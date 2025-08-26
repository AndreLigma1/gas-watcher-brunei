// Utility to fetch filter options from the API
export async function fetchFilterOptions() {
  const BASE_URL = 'http://192.168.123.129/api';
  // These endpoints should exist on the backend
  const [manufacturers, distributors, consumers] = await Promise.all([
    fetch(`${BASE_URL}/manufacturers`).then(r => r.json()),
    fetch(`${BASE_URL}/distributors`).then(r => r.json()),
    fetch(`${BASE_URL}/consumers`).then(r => r.json()),
  ]);
  return { manufacturers, distributors, consumers };
}
