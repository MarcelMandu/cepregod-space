import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { DistributionChart } from '../components/Charts.jsx';
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

export default function PosicionesPage() {
  const { data, loading, error, retry } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('TODAS');
  const [selectedCareer, setSelectedCareer] = useState(null);

  const students = data?.students || [];
  const careerResults = data?.careerResults || [];
  const careers = data?.careers || [];
  const distributions = data?.distributions || {};

  const faculties = useMemo(() => {
    const set = new Set(careerResults.map(c => c.facultad).filter(Boolean));
    return ['TODAS', ...Array.from(set).sort()];
  }, [careerResults]);

  const careerStats = useMemo(() => {
    return careerResults.map(cr => {
      const ingresados = students.filter(s => s.ingresado === true && String(s.carrera || '').trim() === cr.name);
      const vacantes = ingresados.length;
      return {
        ...cr,
        vacantes,
        count: ingresados.length,
      };
    });
  }, [careerResults, students]);

  const filtered = useMemo(() => {
    let result = careerStats;
    if (selectedFaculty !== 'TODAS') {
      result = result.filter(c => c.facultad === selectedFaculty);
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.facultad && c.facultad.toLowerCase().includes(q))
      );
    }
    return result;
  }, [careerStats, selectedFaculty, query]);

  const selectedCareerData = useMemo(() => {
    if (!selectedCareer) return null;
    return careerStats.find(c => c.name === selectedCareer.name) || null;
  }, [selectedCareer, careerStats]);

  const ingresantes = useMemo(() => {
    if (!selectedCareerData) return [];
    return students
      .filter(s => s.ingresado === true && String(s.carrera || '').trim() === selectedCareerData.name)
      .map(s => ({ student: s, total: acumulado(s) }))
      .sort((a, b) => b.total - a.total);
  }, [selectedCareerData, students]);

  const careerDistribution = useMemo(() => {
    if (!selectedCareerData) return null;
    const careerStudents = students.filter(s =>
      s.ingresado === true && String(s.carrera || '').trim() === selectedCareerData.name
    );
    if (careerStudents.length === 0) return null;

    const buckets = {};
    careerStudents.forEach(s => {
      const nota = s.promedio;
      if (nota == null || isNaN(nota)) return;
      const bucket = Math.floor(nota / 2) * 2;
      const key = `${bucket}-${bucket + 2}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });

    return buckets;
  }, [selectedCareerData, students]);

  const getDifficultyLevel = (min) => {
    if (min == null) return 0;
    if (min >= 18) return 5;
    if (min >= 15) return 4;
    if (min >= 12) return 3;
    if (min >= 9) return 2;
    return 1;
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={retry} />;

  return (
    <div className="dashboard">
      <section className="hero-center">
        <h1 className="hero-center-title">
          <span className="hero-center-ciclo">Carreras</span>
          <span className="hero-center-cepre">CEPRE UNI 2026</span>
        </h1>
        <p className="hero-center-subtitle">
          Explora todas las carreras disponibles, puntajes de corte y postulantes CEPRE.
        </p>
      </section>

      <div className="search-input-wrap" style={{ marginBottom: '1rem' }}>
        <span className="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar carrera por nombre o facultad..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="faculty-filters">
        {faculties.map(f => (
          <button
            key={f}
            className={`faculty-pill ${selectedFaculty === f ? 'active' : ''}`}
            onClick={() => setSelectedFaculty(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="careers-grid">
        {filtered.length === 0 && (
          <div className="careers-empty">No se encontraron carreras.</div>
        )}
        {filtered.map(c => {
          const level = getDifficultyLevel(c.min);
          return (
            <div
              key={c.name}
              className={`career-card ${selectedCareerData?.name === c.name ? 'selected' : ''}`}
              onClick={() => setSelectedCareer(c)}
            >
              <div className="career-card-header">
                <span className="career-card-name">{c.name}</span>
                {c.facultad && <span className="career-card-badge">{c.facultad}</span>}
              </div>
              <div className="career-card-stats">
                <div className="career-stat">
                  <span className="career-stat-label">VACANTES</span>
                  <span className="career-stat-value">{c.vacantes}</span>
                </div>
                <div className="career-stat">
                  <span className="career-stat-label">INGRESANTES</span>
                  <span className="career-stat-value">{c.count}</span>
                </div>
                <div className="career-stat">
                  <span className="career-stat-label">CORTE</span>
                  <span className="career-stat-value career-stat-accent">
                    {c.min != null ? c.min.toFixed(1) : '—'}
                  </span>
                </div>
              </div>
              <div className="career-card-bar-wrap">
                <div className="career-card-bar">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`career-bar-segment ${i < level ? 'filled' : ''}`}
                    />
                  ))}
                </div>
                <span className="career-bar-label">
                  {level >= 4 ? 'MUY COMPETITIVA' : level >= 3 ? 'COMPETITIVA' : level >= 2 ? 'MODERADA' : 'ACCESIBLE'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCareerData && (
        <div className="career-detail-overlay" onClick={() => setSelectedCareer(null)}>
          <div className="career-detail-panel" onClick={e => e.stopPropagation()}>
            <div className="career-detail-header">
              <div>
                <h2 className="career-detail-title">{selectedCareerData.name}</h2>
                {selectedCareerData.facultad && (
                  <span className="career-detail-badge">{selectedCareerData.facultad}</span>
                )}
              </div>
              <button className="career-detail-close" onClick={() => setSelectedCareer(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

              <div className="career-detail-stats">
              <div className="eval-metric-card">
                <span className="eval-metric-label">VACANTES</span>
                <span className="eval-metric-value">{selectedCareerData.vacantes}</span>
              </div>
              <div className="eval-metric-card">
                <span className="eval-metric-label">INGRESANTES</span>
                <span className="eval-metric-value">{selectedCareerData.count}</span>
              </div>
              <div className="eval-metric-card">
                <span className="eval-metric-label">CORTE MÍNIMO</span>
                <span className="eval-metric-value eval-metric-danger">
                  {selectedCareerData.min != null ? selectedCareerData.min.toFixed(1) : '—'}
                </span>
              </div>
              <div className="eval-metric-card">
                <span className="eval-metric-label">MÁXIMO</span>
                <span className="eval-metric-value eval-metric-success">
                  {selectedCareerData.max != null ? selectedCareerData.max.toFixed(1) : '—'}
                </span>
              </div>
            </div>

            {careerDistribution && (
              <div className="eval-chart">
                <DistributionChart
                  data={careerDistribution}
                  title={`DISTRIBUCIÓN — ${selectedCareerData.name}`}
                  height={250}
                  color="#FF0033"
                />
              </div>
            )}

            <div className="eval-top10">
              <h3 className="eval-top10-title">POSTULANTES CEPRE — {selectedCareerData.name}</h3>
              <div className="table-wrapper">
                <table className="eval-top10-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>CÓDIGO</th>
                      <th>NOMBRE</th>
                      <th>PUNTAJE</th>
                      <th>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresantes.map((item, idx) => (
                      <tr
                        key={item.student.codigo}
                        className="eval-top10-row"
                        onClick={() => navigate(`/student/${item.student.codigo}`)}
                      >
                        <td className="eval-td-puesto">{idx + 1}</td>
                        <td className="eval-td-codigo">{maskCode(item.student.codigo)}</td>
                        <td className="eval-td-nombre">{item.student.nombre || '—'}</td>
                        <td className="eval-td-nota">{item.total.toFixed(1)}</td>
                        <td className="eval-td-nota">
                          <span className="pos-ingreso">✓ INGRESÓ</span>
                        </td>
                      </tr>
                    ))}
                    {ingresantes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="eval-td-empty">Aún no hay ingresantes publicados para esta carrera.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
