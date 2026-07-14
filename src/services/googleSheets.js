const SHEET_ID = '1iLPmyCH2hxLr3YAylqnPgJ4qX4CJnOdX';
const PC_SHEETS = ['1PC', '2PC', '3PC', '4PC', '5PC', '6PC'];
const EP_SHEETS = ['1EP', '2EP'];
const TALLER_SHEET = 'TALLER';

function getCell(row, colIndex) {
  if (!row || !row.c || !row.c[colIndex]) return null;
  return row.c[colIndex].v ?? null;
}

function fetchSheetJSONP(sheetName, sheetId) {
  const id = sheetId || SHEET_ID;
  return new Promise((resolve, reject) => {
    const cb = `_gviz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json;responseHandler:${cb}&sheet=${encodeURIComponent(sheetName)}`;

    window[cb] = (data) => {
      resolve(data.table);
      cleanup();
    };

    const script = document.createElement('script');
    script.src = url;
    script.onerror = () => { reject(new Error(`Error al cargar ${sheetName}`)); cleanup(); };

    document.head.appendChild(script);

    const timeout = setTimeout(() => {
      reject(new Error(`Tiempo de espera agotado: ${sheetName}`));
      cleanup();
    }, 30000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[cb];
      if (script.parentNode) script.parentNode.removeChild(script);
    }
  });
}

const fetchSheet = fetchSheetJSONP;

function findColIndex(cols, ...labels) {
  for (const label of labels) {
    const idx = cols.findIndex(
      (c) => c.label?.toUpperCase() === label.toUpperCase()
    );
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
  return table.cols.map((c) => ({
    label: c.label || '',
    type: c.type || ''
  }));
}

const CAREER_SHEET_ID = '11Ma_iBsyRA30ynAyS2bhaSAtGI9PnJV2';

export async function fetchCareerData() {
  const table = await fetchSheetJSONP('Sheet1', CAREER_SHEET_ID);
  const cols = table.cols.map(c => ({ label: c.label || '', type: c.type || '' }));
  const rows = table.rows || [];
  const careers = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = getCell(row, 3);
    const target = getCell(row, 4);
    if (name && target !== null && !isNaN(Number(target))) {
      careers.push({
        code: getCell(row, 2) || '',
        name: String(name).trim(),
        target: Number(target),
      });
    }
  }
  return careers;
}

export async function fetchAllData() {
  const [promedios, arqui, pc1, pc2, pc3, pc4, pc5, pc6, ep1, ep2, taller] = await Promise.all([
    fetchSheet('PROMEDIOS_CEPRE'),
    fetchSheet('ARQUI'),
    fetchSheet('1PC'),
    fetchSheet('2PC'),
    fetchSheet('3PC'),
    fetchSheet('4PC'),
    fetchSheet('5PC'),
    fetchSheet('6PC'),
    fetchSheet('1EP'),
    fetchSheet('2EP'),
    fetchSheet(TALLER_SHEET),
  ]);

  const studentMap = new Map();

  function getOrCreate(codigo) {
    if (!codigo) return null;
    const c = String(codigo).trim();
    if (!c) return null;
    if (!studentMap.has(c)) {
      studentMap.set(c, {
        codigo: c,
        nombre: '',
        isArquitectura: false,
        notas: {},
        taller: null,
        promedio: null,
      });
    }
    return studentMap.get(c);
  }

  const gCols = getColLabels(promedios);
  const gCodigoIdx = findColIndex(gCols, 'CODIGO');
  const gNombreIdx = findColIndex(gCols, 'NOMBRE');
  const gExamNames = ['1PC', '2PC', '1EP', '3PC', '4PC', '2EP', '5PC', '6PC'];
  const gExamIdxs = gExamNames.map(name => findColIndex(gCols, name));
  const gPromIdx = findColIndex(gCols, 'PROMEDIO');

  for (let i = 0; i < promedios.rows.length; i++) {
    const row = promedios.rows[i];
    const codigo = getCell(row, gCodigoIdx);
    if (!codigo) continue;
    const c = String(codigo).trim();
    const s = getOrCreate(c);
    const nombre = getCell(row, gNombreIdx);
    if (nombre) s.nombre = parseNombre(nombre) || c;
    gExamIdxs.forEach((idx, pos) => {
      if (idx === -1) return;
      const nota = getCell(row, idx);
      if (nota !== null && !isNaN(Number(nota))) {
        s.notas[gExamNames[pos]] = { nota: Number(nota) };
      }
    });
    const prom = getCell(row, gPromIdx);
    if (prom !== null && !isNaN(Number(prom))) {
      s.promedio = Number(prom);
    }
  }

  const aCols = getColLabels(arqui);
  const aCodigoIdx = findColIndex(aCols, 'CODIGO');
  const aNombreIdx = findColIndex(aCols, 'NOMBRE');
  const aExamNames = ['1PC', '2PC', '1EP', '3PC', '4PC', '2EP', '5PC', '6PC'];
  const aExamIdxs = aExamNames.map(name => findColIndex(aCols, name));
  const aTNotaCols = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map(name => findColIndex(aCols, name));
  const aPromIdx = findColIndex(aCols, 'PROMEDIO');

  for (let i = 0; i < arqui.rows.length; i++) {
    const row = arqui.rows[i];
    const codigo = getCell(row, aCodigoIdx);
    if (!codigo) continue;
    const c = String(codigo).trim();
    const s = getOrCreate(c);
    s.isArquitectura = true;
    const nombre = getCell(row, aNombreIdx);
    if (nombre) s.nombre = parseNombre(nombre) || c;
    aExamIdxs.forEach((idx, pos) => {
      if (idx === -1) return;
      const nota = getCell(row, idx);
      if (nota !== null && !isNaN(Number(nota))) {
        s.notas[aExamNames[pos]] = { nota: Number(nota) };
      }
    });
    s.taller = { seccion: '', tareas: [], acumulado: null };
    aTNotaCols.forEach((idx, pos) => {
      if (idx === -1) return;
      const nota = getCell(row, idx);
      if (nota !== null && !isNaN(Number(nota))) {
        s.taller.tareas.push({ numero: pos + 1, puntaje: null, nota: Number(nota) });
      }
    });
    const prom = getCell(row, aPromIdx);
    if (prom !== null && !isNaN(Number(prom))) {
      s.promedio = Number(prom);
    }
  }

  function addPuntaje(codigo, examName, puntaje) {
    if (!codigo) return;
    const c = String(codigo).trim();
    if (!c || !studentMap.has(c)) return;
    const s = studentMap.get(c);
    if (puntaje !== null && puntaje !== undefined && !isNaN(Number(puntaje))) {
      if (!s.notas[examName]) {
        s.notas[examName] = {};
      }
      s.notas[examName].puntaje = Number(puntaje);
    }
  }

  function processPuntajeRows(rows, examName, codigoIdx, notaIdx) {
    const puntajeIdx = notaIdx - 1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const codigo = getCell(row, codigoIdx);
      const puntaje = puntajeIdx >= 0 ? getCell(row, puntajeIdx) : null;
      addPuntaje(codigo, examName, puntaje);
    }
  }

  const pcExamList = [
    { name: '1PC', table: pc1 },
    { name: '2PC', table: pc2 },
    { name: '3PC', table: pc3 },
    { name: '4PC', table: pc4 },
    { name: '5PC', table: pc5 },
    { name: '6PC', table: pc6 },
  ];

  for (const exam of pcExamList) {
    const cols = getColLabels(exam.table);
    const codigoIdx = findColIndex(cols, 'CODIGO', 'COD.');
    const notaIdx = findColIndex(cols, 'NOTA');
    if (codigoIdx === -1 || notaIdx === -1) continue;
    processPuntajeRows(exam.table.rows, exam.name, codigoIdx, notaIdx);
  }

  const epExamList = [
    { name: '1EP', table: ep1 },
    { name: '2EP', table: ep2 },
  ];

  for (const exam of epExamList) {
    const cols = getColLabels(exam.table);
    const codigoIdx = findColIndex(cols, 'CODIGO');
    const notaIdx = findColIndex(cols, 'NOTA');
    if (codigoIdx === -1 || notaIdx === -1) continue;
    processPuntajeRows(exam.table.rows, exam.name, codigoIdx, notaIdx);
  }

  const tallerCols = getColLabels(taller);
  const tallerCodigoIdx = findColIndex(tallerCols, 'CODIGO');
  const tPuntajeCols = [
    findColIndex(tallerCols, 'PUNTAJET1'),
    findColIndex(tallerCols, 'PUNTAJET2'),
    findColIndex(tallerCols, 'PUNTAJET3'),
    findColIndex(tallerCols, 'PUNTAJET4'),
    findColIndex(tallerCols, 'PUNTAJET5'),
    findColIndex(tallerCols, 'PUNTAJET6'),
  ];

  for (let i = 0; i < taller.rows.length; i++) {
    const row = taller.rows[i];
    const codigo = getCell(row, tallerCodigoIdx);
    if (!codigo) continue;
    const c = String(codigo).trim();
    if (!studentMap.has(c)) continue;
    const s = studentMap.get(c);
    s.isArquitectura = true;
    if (!s.taller) {
      s.taller = { seccion: '', tareas: [], acumulado: null };
    }
    const tallerSeccionIdx = findColIndex(tallerCols, 'SECCION');
    const tallerAcumuladoIdx = findColIndex(tallerCols, 'ACUMULADO');
    s.taller.seccion = getCell(row, tallerSeccionIdx) || s.taller.seccion;
    const ac = tallerAcumuladoIdx !== -1 ? getCell(row, tallerAcumuladoIdx) : null;
    if (ac !== null && !isNaN(Number(ac))) {
      s.taller.acumulado = Number(ac);
    }
    for (let j = 0; j < 6; j++) {
      const pIdx = tPuntajeCols[j];
      if (pIdx === -1) continue;
      const puntaje = getCell(row, pIdx);
      if (puntaje === null || isNaN(Number(puntaje))) continue;
      const existing = s.taller.tareas.find(t => t.numero === j + 1);
      if (existing) {
        existing.puntaje = Number(puntaje);
      } else {
        s.taller.tareas.push({ numero: j + 1, puntaje: Number(puntaje), nota: null });
      }
    }
  }

  const students = [];
  for (const [, s] of studentMap) {
    students.push(s);
  }

  students.sort((a, b) => (b.promedio || 0) - (a.promedio || 0));
  students.forEach((s, i) => { s.rank = i + 1; });

  const examStats = {};
  const allExamNames = ['1PC', '2PC', '1EP', '3PC', '4PC', '2EP', '5PC', '6PC'];
  for (const examName of allExamNames) {
    const scores = [];
    for (const s of students) {
      if (s.notas[examName] && s.notas[examName].nota !== undefined) {
        scores.push(s.notas[examName].nota);
      }
    }
    if (scores.length > 0) {
      const sum = scores.reduce((a, b) => a + b, 0);
      examStats[examName] = {
        avg: sum / scores.length,
        max: Math.max(...scores),
        min: Math.min(...scores),
        count: scores.length,
      };
    }
  }

  const distributions = {};
  const distExamNames = ['1PC', '2PC', '3PC', '4PC', '5PC', '6PC', '1EP', '2EP'];
  for (const examName of distExamNames) {
    const buckets = {};
    for (let i = 0; i <= 140; i += 10) {
      buckets[`${i}-${i + 10}`] = 0;
    }
    for (const s of students) {
      const p = s.notas[examName]?.puntaje;
      if (p !== undefined && p !== null && !isNaN(p)) {
        const start = Math.min(Math.floor(p / 10) * 10, 140);
        const key = `${start}-${start + 10}`;
        if (buckets[key] !== undefined) buckets[key]++;
      }
    }
    distributions[examName] = buckets;
  }

  const tallerBuckets = {};
  for (let i = 0; i <= 50; i += 5) {
    tallerBuckets[`${i}-${i + 5}`] = 0;
  }
  for (const s of students) {
    if (!s.taller || !s.taller.tareas.length) continue;
    let total = 0;
    let count = 0;
    for (const t of s.taller.tareas) {
      if (t.puntaje !== null && !isNaN(t.puntaje)) {
        total += t.puntaje;
        count++;
      }
    }
    if (count > 0) {
      const avg = total / count;
      const start = Math.min(Math.floor(avg / 5) * 5, 50);
      const key = `${start}-${start + 5}`;
      if (tallerBuckets[key] !== undefined) tallerBuckets[key]++;
      else tallerBuckets[key] = 1;
    }
  }
  distributions['TALLER'] = tallerBuckets;

  const careers = await fetchCareerData();

  return { students, examStats, distributions, careers };
}
