// /opt/website/api/server.js
import express from "express";
import pkg from "pg";
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

/** Health + DB time */
app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get("/db-time", async (_req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** 1) Latest row per device (fast list for dashboard)
 *  GET /latest
 *  ?limit=100   (max devices returned)
 */
app.get("/devices/latest", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 200, 1000);
  try {
    // DISTINCT ON picks the newest row for each id (Postgres)
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

/** 2) Paged feed of all rows (newest first) with filtering
 *  GET /devices
 *  ?limit=100&offset=0
 *  ?manufacturer_id=...&distributor_id=...&consumer_id=...
 */
app.get("/devices", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 5000);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);

  // Filtering parameters
  const { manufacturer_id, distributor_id, consumer_id } = req.query;
  const filters = [];
  const values = [];
  let idx = 1;

  // Join clauses if filtering
  let joinClause = "";

  if (manufacturer_id) {
    joinClause += `
      JOIN consumer ON devices.consumer_id = consumer.id
      JOIN distributor ON consumer.distributor_id = distributor.id
      JOIN manufacturer ON distributor.manufacturer_id = manufacturer.id
    `;
    filters.push(`manufacturer.id = $${idx++}`);
    values.push(manufacturer_id);
  } else if (distributor_id) {
    joinClause += `
      JOIN consumer ON devices.consumer_id = consumer.id
      JOIN distributor ON consumer.distributor_id = distributor.id
    `;
    filters.push(`distributor.id = $${idx++}`);
    values.push(distributor_id);
  } else if (consumer_id) {
    joinClause += `
      JOIN consumer ON devices.consumer_id = consumer.id
    `;
    filters.push(`consumer.id = $${idx++}`);
    values.push(consumer_id);
  }

  let whereClause = "";
  if (filters.length > 0) {
    whereClause = "WHERE " + filters.join(" AND ");
  }

  try {
    const q = `
      SELECT devices.id, devices.measurement, devices.tank_level, devices."timestamp"
      FROM devices
      ${joinClause}
      ${whereClause}
      ORDER BY devices."timestamp" DESC
      LIMIT $${idx++} OFFSET $${idx}
    `;
    values.push(limit, offset);
    const { rows } = await pool.query(q, values);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
/** 3) History for one device
 *  GET /devices/:id
 *  ?since=24h  (supports 15m, 6h, 7d or ISO 2025-08-18T03:00:00Z)
 *  ?limit=1000
 */
app.get("/devices/:id", async (req, res) => {
  const id = req.params.id;
  const limit = Math.min(parseInt(req.query.limit) || 1000, 10000);
  const since = String(req.query.since || "24h");

  // Compute cutoff
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

/**
 * Filter endpoints for dropdowns
 */
app.get('/manufacturers', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM manufacturer ORDER BY name ASC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/distributors', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM distributor ORDER BY name ASC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/consumers', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM consumer ORDER BY name ASC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`API on ${PORT}`));