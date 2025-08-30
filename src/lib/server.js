// --- Get available roles from consumer_role enum ---
app.get(["/roles", "/api/roles"], async (_req, res) => {
  try {
    const q = `SELECT unnest(enum_range(NULL::consumer_role)) AS role`;
    const { rows } = await pool.query(q);
    res.json({ ok: true, roles: rows.map(r => r.role) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
// /opt/website/api/server.js
import express from "express";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool, types } = pkg;

// Parse NUMERIC as float (pg sends NUMERIC as string by default)
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
}
const pool = new Pool({ connectionString: DATABASE_URL });

/* ------------------------------ Utilities ------------------------------ */

function parseLimitOffset(req, defLimit = 100, maxLimit = 1000) {
  const limit = Math.min(parseInt(req.query.limit) || defLimit, maxLimit);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);
  return { limit, offset };
}
function parseSearch(req) {
  const q = (req.query.q || "").toString().trim();
  return q ? `%${q}%` : null;
}
function dirSql(s) {
  return (s || "").toString().toUpperCase() === "ASC" ? "ASC" : "DESC";
}
// Mount the same handler on both /api/... and /...
function mountGet(paths, handler) {
  const arr = Array.isArray(paths) ? paths : [paths];
  for (const p of arr) app.get(p, handler);
}

/* ------------------------------ Health --------------------------------- */

mountGet(["/health", "/api/health"], (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

mountGet(["/db-time", "/api/db-time"], async (_req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* ------------------------------ Devices (existing) ---------------------- */

// 1) Latest row per device (fast list for dashboard)
mountGet(["/devices/latest", "/api/devices/latest"], async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 200, 1000);
  try {
    const q = `
      SELECT DISTINCT ON (id)
             id, measurement, tank_level, "timestamp"
      FROM devices
      ORDER BY id, "timestamp" DESC
      LIMIT $1
    `;
    const { rows } = await pool.query(q, [limit]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// 2) Paged feed of all rows (newest first)
mountGet(["/devices", "/api/devices"], async (req, res) => {
  const { limit, offset } = parseLimitOffset(req, 100, 5000);
  const { manufacturer_id, distributor_id, consumer_id } = req.query;
  let joins = '';
  let where = '';
  let values = [];
  let idx = 1;

  if (manufacturer_id) {
    joins = `
      JOIN consumer ON devices.consumer_id = consumer.consumer_id
      JOIN distributor ON consumer.distributor_id = distributor.distributor_id
      JOIN manufacturer ON distributor.manufacturer_id = manufacturer.manufacturer_id
    `;
    where = `WHERE manufacturer.manufacturer_id = $${idx++}`;
    values.push(manufacturer_id);
  } else if (distributor_id) {
    joins = `
      JOIN consumer ON devices.consumer_id = consumer.consumer_id
      JOIN distributor ON consumer.distributor_id = distributor.distributor_id
    `;
    where = `WHERE distributor.distributor_id = $${idx++}`;
    values.push(distributor_id);
  } else if (consumer_id) {
    joins = `
      JOIN consumer ON devices.consumer_id = consumer.consumer_id
    `;
    where = `WHERE consumer.consumer_id = $${idx++}`;
    values.push(consumer_id);
  }

  values.push(limit, offset);

  try {
    const q = `
      SELECT devices.id, devices.measurement, devices.tank_level, devices."timestamp"
      FROM devices
      ${joins}
      ${where}
      ORDER BY devices."timestamp" DESC
      LIMIT $${idx++} OFFSET $${idx}
    `;
    const { rows } = await pool.query(q, values);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// 3) History for one device
mountGet(["/devices/:id", "/api/devices/:id"], async (req, res) => {
  const id = req.params.id;
  const limit = Math.min(parseInt(req.query.limit) || 1000, 10000);
  const since = String(req.query.since || "24h");

  // Compute cutoff time
  let cutoff = new Date(Date.now() - 24 * 3600 * 1000);
  if (/^\d+\s*(m|min|h|hour|d|day|days)$/i.test(since)) {
    const n = parseInt(since, 10);
    const unit = since.replace(/\d+\s*/, "").toLowerCase();
    const mult = unit.startsWith("m") ? 60 : unit.startsWith("h") ? 3600 : 86400;
    cutoff = new Date(Date.now() - n * mult * 1000);
  } else if (!Number.isNaN(Date.parse(since))) {
    cutoff = new Date(since);
  }

  try {
    const q = `
      SELECT id, measurement, tank_level, "timestamp"
      FROM devices
      WHERE id = $1 AND "timestamp" >= $2
      ORDER BY "timestamp" ASC
      LIMIT $3
    `;
    const { rows } = await pool.query(q, [id, cutoff.toISOString(), limit]);
    if (rows.length === 0) return res.status(404).json({ ok: false, error: "no data" });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});


/* ---------------------- Manufacturer / Distributor / Consumer ----------- */
/* All list endpoints support:
   - ?limit=&offset=
   - ?q= (search across name fields, and joined names where relevant)
   - ?sort=&dir= (safe whitelist — defaults shown below)
*/

// --- Manufacturers ---
mountGet(["/manufacturers", "/api/manufacturers"], async (req, res) => {
  const { limit, offset } = parseLimitOffset(req, 100, 1000);
  const search = parseSearch(req);
  const sortMap = {
    manufacturer_id: "m.manufacturer_id",
    name: "m.name",
    created_at: "m.created_at",
    updated_at: "m.updated_at",
  };
  const sort = sortMap[req.query.sort] || "m.manufacturer_id";
  const dir = dirSql(req.query.dir);

  const values = [];
  let where = "";
  if (search) {
    values.push(search);
    where = "WHERE m.name ILIKE $1";
  }
  values.push(limit, offset);

  const sql = `
    SELECT m.manufacturer_id, m.name, m.created_at, m.updated_at
    FROM manufacturer m
    ${where}
    ORDER BY ${sort} ${dir}
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;
  try {
    const { rows } = await pool.query(sql, values);
    res.json({ ok: true, items: rows, next_offset: rows.length === limit ? offset + rows.length : null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

mountGet(["/manufacturers/:id", "/api/manufacturers/:id"], async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.manufacturer_id, m.name, m.created_at, m.updated_at
       FROM manufacturer m WHERE m.manufacturer_id = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, item: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Distributors (joined with manufacturer name) ---
mountGet(["/distributors", "/api/distributors"], async (req, res) => {
  const { limit, offset } = parseLimitOffset(req, 100, 1000);
  const search = parseSearch(req);
  const sortMap = {
    distributor_id: "d.distributor_id",
    name: "d.name",
    manufacturer_id: "d.manufacturer_id",
    manufacturer_name: "m.name",
    created_at: "d.created_at",
    updated_at: "d.updated_at",
  };
  const sort = sortMap[req.query.sort] || "d.distributor_id";
  const dir = dirSql(req.query.dir);

  const values = [];
  let where = "";
  if (search) {
    values.push(search, search);
    where = "WHERE d.name ILIKE $1 OR m.name ILIKE $2";
  }
  values.push(limit, offset);

  const sql = `
    SELECT
      d.distributor_id, d.name,
      d.manufacturer_id, m.name AS manufacturer_name,
      d.created_at, d.updated_at
    FROM distributor d
    JOIN manufacturer m ON d.manufacturer_id = m.manufacturer_id
    ${where}
    ORDER BY ${sort} ${dir}
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;
  try {
    const { rows } = await pool.query(sql, values);
    res.json({ ok: true, items: rows, next_offset: rows.length === limit ? offset + rows.length : null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

mountGet(["/distributors/:id", "/api/distributors/:id"], async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         d.distributor_id, d.name,
         d.manufacturer_id, m.name AS manufacturer_name,
         d.created_at, d.updated_at
       FROM distributor d
       JOIN manufacturer m ON d.manufacturer_id = m.manufacturer_id
       WHERE d.distributor_id = $1
       LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, item: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Consumers (joined with distributor & manufacturer names) ---
mountGet(["/consumers", "/api/consumers"], async (req, res) => {
  const { limit, offset } = parseLimitOffset(req, 100, 1000);
  const search = parseSearch(req);
  const sortMap = {
    consumer_id: "c.consumer_id",
    name: "c.name",
    distributor_id: "c.distributor_id",
    distributor_name: "d.name",
    manufacturer_id: "d.manufacturer_id",
    manufacturer_name: "m.name",
    created_at: "c.created_at",
    updated_at: "c.updated_at",
  };
  const sort = sortMap[req.query.sort] || "c.consumer_id";
  const dir = dirSql(req.query.dir);

  const values = [];
  let where = "";
  if (search) {
    // Search across consumer, distributor, and manufacturer names
    values.push(search, search, search);
    where = "WHERE c.name ILIKE $1 OR d.name ILIKE $2 OR m.name ILIKE $3";
  }
  values.push(limit, offset);

  const sql = `
    SELECT
      c.consumer_id, c.name,
      c.distributor_id, d.name AS distributor_name,
      d.manufacturer_id, m.name AS manufacturer_name,
      c.created_at, c.updated_at
    FROM consumer c
    JOIN distributor d  ON c.distributor_id = d.distributor_id
    JOIN manufacturer m ON d.manufacturer_id = m.manufacturer_id
    ${where}
    ORDER BY ${sort} ${dir}
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;
  try {
    const { rows } = await pool.query(sql, values);
    res.json({ ok: true, items: rows, next_offset: rows.length === limit ? offset + rows.length : null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

mountGet(["/consumers/:id", "/api/consumers/:id"], async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         c.consumer_id, c.name,
         c.distributor_id, d.name AS distributor_name,
         d.manufacturer_id, m.name AS manufacturer_name,
         c.created_at, c.updated_at
       FROM consumer c
       JOIN distributor d  ON c.distributor_id = d.distributor_id
       JOIN manufacturer m ON d.manufacturer_id = m.manufacturer_id
       WHERE c.consumer_id = $1
       LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, item: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* ------------------------------ Start ---------------------------------- */


// --- Register endpoint ---
app.post(["/register", "/api/register"], async (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password || !role) {
    return res.status(400).json({ ok: false, error: "Missing name, password, or role" });
  }
  try {
    // Check if user exists
    const exists = await pool.query("SELECT 1 FROM consumer WHERE name = $1", [name]);
    if (exists.rows.length) {
      return res.status(409).json({ ok: false, error: "Username already exists" });
    }
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    // For demo, assign distributor_id=1 (adjust as needed)
    const distributor_id = 1;
    const q = `INSERT INTO consumer (name, password, role, distributor_id) VALUES ($1, $2, $3, $4) RETURNING consumer_id, name, role`;
    try {
      const { rows } = await pool.query(q, [name, hash, role, distributor_id]);
      res.json({ ok: true, user: rows[0] });
    } catch (pgErr) {
      // Log and return detailed Postgres error
      console.error("PG registration error:", pgErr);
      res.status(500).json({ ok: false, error: pgErr.message, detail: pgErr.detail, code: pgErr.code, constraint: pgErr.constraint });
    }
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Login endpoint ---
app.post(["/login", "/api/login"], async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ ok: false, error: "Missing name or password" });
  }
  try {
    const q = `SELECT consumer_id, name, password, role FROM consumer WHERE name = $1 LIMIT 1`;
    const { rows } = await pool.query(q, [name]);
    if (!rows.length) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }
    // Create JWT
    const token = jwt.sign(
      { consumer_id: user.consumer_id, name: user.name, role: user.role },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );
    res.json({
      ok: true,
      token,
      user: { consumer_id: user.consumer_id, name: user.name, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`API on ${PORT}`));