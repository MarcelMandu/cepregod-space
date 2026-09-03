import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { DistributionChart } from '../components/Charts.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ErrorScreen from '../components/ErrorScreen.jsx';

const exams = [
  { group: 'PRÁCTICAS CALIFICADAS', items: ['1PC', '2PC', '3PC', '4PC', '5PC', '6PC', '7PC'] },
  { group: 'EXÁMENES', items: ['1EP', '2EP', 'EF', 'PAV'] },
];

export default function EvaluacionPage() {
  const { data, loading, error, retry } = useData();
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState('1PC');

  const stats = useMemo(() => {
    if (!data?.examStats) return null;
    return data.examStats[selectedExam] || null;
  }, [data, selectedExam]);

  const distribution = useMemo(() => {
    if (!data?.distributions) return null;
    return data.distributions[selectedExam] || null;
  }, [data, selectedExam]);

  const top10 = useMemo(() => {
    if (!data?.students) return [];
    return [...data.students]
      .filter(s => s.notas[selectedExam]?.nota !== undefined && s.notas[selectedExam]?.nota !== null)
      .sort((a, b) => (b.notas[selectedExam]?.nota ?? 0) - (a.notas[selectedExam]?.nota ?? 0))
      .slice(0, 10)
      .map((s, i) => ({
        puesto: i + 1,
        codigo: s.codigo,
        nombre: s.nombre,
        especialidad: s.isArquitectura ? 'ARQUITECTURA' : 'INGENIERÍA',
        nota: s.notas[selectedExam].nota,
      }));
  }, [data, selectedExam]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={retry} />;

  return (
    <div className="eval-page">
      <div className="eval-tabs-wrapper">
        {exams.map(({ group, items }) => (
          <div key={group} className="eval-tab-group">
            <span className="eval-tab-label">{group}</span>
            <div className="eval-tabs">
              {items.map(exam => (
                <button
                  key={exam}
                  className={`eval-tab ${selectedExam === exam ? 'active' : ''}`}
                  onClick={() => setSelectedExam(exam)}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="eval-metrics">
        <div className="eval-metric-card">
          <span className="eval-metric-label">PROMEDIO</span>
          <span className="eval-metric-value">{stats ? stats.avg.toFixed(2) : '—'}</span>
        </div>
        <div className="eval-metric-card">
          <span className="eval-metric-label">MÁXIMA</span>
          <span className="eval-metric-value eval-metric-success">{stats ? stats.max.toFixed(1) : '—'}</span>
        </div>
        <div className="eval-metric-card">
          <span className="eval-metric-label">MÍNIMA</span>
          <span className="eval-metric-value eval-metric-danger">{stats ? stats.min.toFixed(1) : '—'}</span>
        </div>
        <div className="eval-metric-card">
          <span className="eval-metric-label">EVALUADOS</span>
          <span className="eval-metric-value">{stats ? stats.count : '—'}</span>
        </div>
      </div>

      <div className="eval-chart">
        <DistributionChart
          data={distribution || {}}
          title={`DISTRIBUCIÓN — ${selectedExam}`}
          height={300}
          color="#FF0033"
        />
      </div>

      <div className="eval-top10">
        <h3 className="eval-top10-title">TOP 10 — {selectedExam}</h3>
        <div className="table-wrapper">
          <table className="eval-top10-table">
            <thead>
              <tr>
                <th>#</th>
                <th>CÓDIGO</th>
                <th>NOMBRE</th>
                <th>ESPECIALIDAD</th>
                <th>NOTA</th>
              </tr>
            </thead>
            <tbody>
              {top10.map(s => (
                <tr
                  key={s.codigo}
                  className="eval-top10-row"
                  onClick={() => navigate(`/student/${s.codigo}`)}
                >
                  <td className="eval-td-puesto">{s.puesto}</td>
                  <td className="eval-td-codigo">{s.codigo}</td>
                  <td className="eval-td-nombre">{s.nombre}</td>
                  <td className={`eval-td-especialidad ${s.especialidad === 'ARQUITECTURA' ? 'esp-arq' : 'esp-ing'}`}>
                    {s.especialidad}
                  </td>
                  <td className="eval-td-nota">{s.nota.toFixed(1)}</td>
                </tr>
              ))}
              {top10.length === 0 && (
                <tr>
                  <td colSpan={5} className="eval-td-empty">No hay datos disponibles para esta evaluación</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
