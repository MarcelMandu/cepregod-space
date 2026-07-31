import { processTables, fetchTablesJSONP, fetchCareerData } from './googleSheets.js';

export async function fetchFromAPI() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch('/api/data', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const processed = processTables(data.tables);
    return { ...processed, careers: data.careers || [] };
  } catch {
    const tables = await fetchTablesJSONP();
    const processed = processTables(tables);
    const careers = await fetchCareerData();
    return { ...processed, careers };
  }
}
