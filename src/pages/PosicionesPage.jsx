import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ErrorScreen from '../components/ErrorScreen.jsx';

const WEIGHTS = { '1PC': 1, '2PC': 1, '3PC': 1, '4PC': 1, '5PC': 1, '6PC': 1, '7PC': 1, '1EP': 2, '2EP': 4, 'EF': 6, 'PAV': 1 };

function acumulado(s) {
  if (s.puntajeAcumulado != null && !isNaN(s.puntajeAcumulado)) return s.puntajeAcumulado;
  let sum = 0;
  for (const [exam, weight] of Object.entries(WEIGHTS)) {
    if (exam === 'PAV' && !s.isArquitectura) continue;
    const nota = s.notas[exam]?.nota;
    if (nota !== undefined && !isNaN(nota)) sum += nota * weight;
  }
  return s.promedio != null && !isNaN(s.promedio) ? s.promedio : sum;
}

function maskCode(codigo) {
  return codigo ? `••••${String(codigo).slice(-4)}` : '—';
}

function notaToVig(p) {
  return p != null && !isNaN(p) ? (Number(p) / 2700) * 20 : null;
}

export default function PosicionesPage() {
  const { data, loading, error, retry } = useData();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const students = data?.students || [];
  const careerResults = data?.careerResults || [];
  const careers = data?.careers || [];

  const careerStats = useMemo(() => {
    return careerResults.map(cr => {
      const list = students.filter(s => s.ingresado === true && String(s.carrera || '').trim() === cr.name);
      return {
        ...cr,
        vacantes: (careers.find(c => c.name === cr.name) || {}).target,
        maxPuntaje: cr.max,
        minPuntaje: cr.min,
        count: list.length,
      };
    });
  }, [careerResults, careers, students]);

  const filtered = useMemo(() => {
    if (!query) return careerStats;
    const q = query.toLowerCase();
    return careerStats.filter(c => c.name.toLowerCase().includes(q));
  }, [careerStats, query]);

  const selectedCareer = useMemo(() => {
    if (!selected) return null;
    return careerStats.find(c => c.name === selected.name) || null;
  }, [selected, careerStats]);

  const ingresantes = useMemo(() => {
    if (!selectedCareer) return [];
    return students
      .filter(s => s.ingresado === true && String(s.carrera || '').trim() === selectedCareer.name)
      .map(s => ({ student: s, total: acumulado(s) }))
      .sort((a, b) => b.total - a.total);
  }, [selectedCareer, students]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={retry} />;

  return (
    <div className="dashboard">
      <div className="hero-section">
        <div className="hero-left">
          <h1 className="hero-title">
            <span className="hero-ciclo">Resultados Finales</span>
            <span className="hero-cepre">CEPRE UNI 2026-2</span>
          </h1>
          <p className="hero-subtitle">
            Puntaje máximo y mínimo de corte por carrera, y cuadro de posiciones de ingresantes.
          </p>
          <p className="hero-note">
            Los datos se completarán automáticamente cuando se publiquen los resultados finales.
          </p>
        </div>
        <div className="hero-right" />
      </div>
      <div className="hero-divider" />

      <div className="ranking-card">
        <h3>Resumen por Carrera — Puntajes Máximos y Mínimos</h3>
        <div className="search-input-wrap" style={{ marginBottom: '1rem' }}>
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar carrera..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="table-wrapper">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Carrera</th>
                <th>Vacantes</th>
                <th>Puntaje Máximo</th>
                <th>Puntaje Mínimo / Corte</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="5" className="td-empty">No hay carreras disponibles aún.</td></tr>
              )}
              {filtered.map((c, i) => (
                <tr
                  key={c.name}
                  className={`ranking-row pos-reasign-row ${selected?.name === c.name ? 'pos-selected' : ''}`}
                  onClick={() => setSelected(c)}
                >
                  <td className="td-rank">{i + 1}</td>
                  <td className="td-nombre">{c.name}</td>
                  <td className="td-nota">{c.count != null ? c.count : '-'}</td>
                  <td className="td-nota">
                    {c.maxPuntaje != null
                      ? <span className="pos-max">{c.maxPuntaje.toFixed(2)}</span>
                      : <span className="td-pendiente">—</span>}
                  </td>
                  <td className="td-nota">
                    {c.minPuntaje != null
                      ? <span className="pos-min">{c.minPuntaje.toFixed(2)}</span>
                      : <span className="td-pendiente">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCareer && (
        <div className="ranking-card">
          <h3>
            {selectedCareer.maxPuntaje != null && <span className="pos-crown-icon">👑</span>}
            Cuadro de Posiciones — {selectedCareer.name}
            <span className="section-count">{ingresantes.length} postulantes / {ingresantes.length} ingresantes</span>
          </h3>
          <div className="table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Puesto</th>
                  <th>Nombre</th>
                  <th>Código/DNI</th>
                  <th>Puntaje Acumulado</th>
                  <th>Nota Vigesimal</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ingresantes.length === 0 && (
                  <tr><td colSpan="6" className="td-empty">Aún no hay ingresantes publicados para esta carrera.</td></tr>
                )}
                {ingresantes.map((item, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <tr
                      key={item.student.codigo}
                      className={`ranking-row pos-entry ${isFirst ? 'pos-first' : ''}`}
                    >
                      <td className="td-rank">{isFirst ? <span className="pos-crown">👑</span> : idx + 1}</td>
                      <td className="td-nombre">{item.student.nombre || '—'}</td>
                      <td className="td-codigo">{maskCode(item.student.codigo)}</td>
                      <td className="td-nota"><span className={isFirst ? 'pos-first-score' : ''}>{item.total.toFixed(2)}</span></td>
                      <td className="td-nota">{notaToVig(item.total) != null ? notaToVig(item.total).toFixed(2) : '—'}</td>
                      <td className="td-nota"><span className="pos-ingreso">✓ INGRESÓ</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {ingresantes.length > 0 && (
            <div className="pos-cut-line-wrap">
              <div className="pos-cut-line" />
              <span className="pos-cut-label">Límite de vacantes ({selectedCareer.count != null ? selectedCareer.count : '-'})</span>
            </div>
          )}
        </div>
      )}

      {!selectedCareer && (
        <div className="chart-card" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Selecciona una carrera para ver su cuadro de posiciones.
        </div>
      )}
    </div>
  );
}