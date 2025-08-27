// Utility to fetch filter options from the API
export async function fetchFilterOptions() {
  const BASE_URL = 'http://192.168.123.129/api';
  // Use the new endpoints and response structure
  const [manRes, distRes, consRes] = await Promise.all([
    fetch(`${BASE_URL}/manufacturer`).then(r => r.json()),
    fetch(`${BASE_URL}/distributor`).then(r => r.json()),
    fetch(`${BASE_URL}/consumer`).then(r => r.json()),
  ]);

  // Each response is { ok: true, items: [...] }
  const manufacturers = (manRes.items || []).map((m: any) => ({
    id: m.manufacturer_id,
    name: m.name,
  }));
  const distributors = (distRes.items || []).map((d: any) => ({
    id: d.distributor_id,
    name: d.name,
    manufacturer_id: d.manufacturer_id,
    manufacturer_name: d.manufacturer_name,
  }));
  const consumers = (consRes.items || []).map((c: any) => ({
    id: c.consumer_id,
    name: c.name,
    distributor_id: c.distributor_id,
    distributor_name: c.distributor_name,
    manufacturer_id: c.manufacturer_id,
    manufacturer_name: c.manufacturer_name,
  }));
  return { manufacturers, distributors, consumers };
}
