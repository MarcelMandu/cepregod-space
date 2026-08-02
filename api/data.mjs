const SHEET_ID = '1iLPmyCH2hxLr3YAylqnPgJ4qX4CJnOdX';
const CAREER_SHEET_ID = '11Ma_iBsyRA30ynAyS2bhaSAtGI9PnJV2';

function getCell(row, colIndex) {
  if (!row || !row.c || !row.c[colIndex]) return null;
  return row.c[colIndex].v ?? null;
}

function findColIndex(cols, ...labels) {
  for (const label of labels) {
    const idx = cols.findIndex(c => c.label?.toUpperCase() === label.toUpperCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseNombre(nombre) {
  if (!nombre || typeof nombre !== 'string') return nombre;
  return nombre.trim().replace(/\s+/g, ' ').toUpperCase();
}

function getColLabels(table) {
  if (!table.cols || table.cols.length === 0) return [];
  return table.cols.map(c => ({ label: c.label || '', type: c.type || '' }));
}

async function fetchGviz(id, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  const text = await res.text();
  const m = text.replace(/^\/\*O_o\*\//, '').match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
  if (!m) throw new Error(`Failed to parse ${sheetName}`);
  return JSON.parse(m[1]).table;
}

export default async function handler(req, res) {
  try {
    const [promedios, arqui, pc1, pc2, pc3, pc4, pc5, pc6, pc7, ep1, ep2, ef, pav, taller] = await Promise.all([
      fetchGviz(SHEET_ID, 'PROMEDIOS_CEPRE'), fetchGviz(SHEET_ID, 'ARQUI'),
      fetchGviz(SHEET_ID, '1PC'), fetchGviz(SHEET_ID, '2PC'),
      fetchGviz(SHEET_ID, '3PC'), fetchGviz(SHEET_ID, '4PC'),
      fetchGviz(SHEET_ID, '5PC'), fetchGviz(SHEET_ID, '6PC'),
      fetchGviz(SHEET_ID, '7PC'),
      fetchGviz(SHEET_ID, '1EP'), fetchGviz(SHEET_ID, '2EP'),
      fetchGviz(SHEET_ID, 'EF'),
      fetchGviz(SHEET_ID, 'VC'),
      fetchGviz(SHEET_ID, 'TALLER'),
    ]);

    const careerTable = await fetchGviz(CAREER_SHEET_ID, 'Sheet1');
    const cc = getColLabels(careerTable);
    const careers = [];
    for (let i = 1; i < careerTable.rows.length; i++) {
      const name = getCell(careerTable.rows[i], 3);
      const target = getCell(careerTable.rows[i], 4);
      if (name && target !== null && !isNaN(Number(target))) {
        careers.push({ code: getCell(careerTable.rows[i], 2) || '', name: String(name).trim(), target: Number(target) });
      }
    }

    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.json({
      tables: { promedios, arqui, pc1, pc2, pc3, pc4, pc5, pc6, pc7, ep1, ep2, ef, pav, taller },
      careers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}