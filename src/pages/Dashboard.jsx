import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { DistributionChart } from '../components/Charts.jsx';
import CountdownCard from '../components/CountdownCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ErrorScreen from '../components/ErrorScreen.jsx';

const exams = ['1PC', '2PC', '3PC', '4PC', '5PC', '6PC', '7PC', '1EP', '2EP', 'EF', 'PAV'];

export default function Dashboard() {
  const { data, loading, error, retry } = useData();
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState('1PC');

  const evalStats = useMemo(() => {
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

  const rankingGeneral = useMemo(() => {
    if (!data) return [];
    return [...data.students]
      .sort((a, b) => (a.rank || 999) - (b.rank || 999))
      .slice(0, 15);
  }, [data]);

  const rankingArquitectura = useMemo(() => {
    if (!data) return [];
    return [...data.students]
      .filter(s => s.isArquitectura)
      .sort((a, b) => (a.rank || 999) - (b.rank || 999))
      .slice(0, 15);
  }, [data]);

  const examColumns = ['1PC', '2PC', '1EP', '3PC', '4PC', '2EP', '5PC', '6PC', '7PC', 'EF', 'PAV'];

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={retry} />;

  return (
    <div className="dashboard">
      <CountdownCard />

      <div className="eval-tabs">
        {exams.map(exam => (
          <button
            key={exam}
            className={`eval-tab ${selectedExam === exam ? 'active' : ''}`}
            onClick={() => setSelectedExam(exam)}
          >
            {exam}
          </button>
        ))}
      </div>

      <div className="eval-metrics">
        <div className="eval-metric-card">
          <span className="eval-metric-label">PROMEDIO</span>
          <span className="eval-metric-value">{evalStats ? evalStats.avg.toFixed(2) : '—'}</span>
        </div>
        <div className="eval-metric-card">
          <span className="eval-metric-label">MÁXIMA</span>
          <span className="eval-metric-value eval-metric-success">{evalStats ? evalStats.max.toFixed(1) : '—'}</span>
        </div>
        <div className="eval-metric-card">
          <span className="eval-metric-label">MÍNIMA</span>
          <span className="eval-metric-value eval-metric-danger">{evalStats ? evalStats.min.toFixed(1) : '—'}</span>
        </div>
        <div className="eval-metric-card">
          <span className="eval-metric-label">EVALUADOS</span>
          <span className="eval-metric-value">{evalStats ? evalStats.count : '—'}</span>
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

      <div className="ranking-card">
        <h3>Ranking General — Top 15</h3>
        <div className="table-wrapper">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Nombre</th>
                {examColumns.map(col => (
                  <th key={col}>{col}</th>
                ))}
                <th>Prom.</th>
                <th>Ing.</th>
              </tr>
            </thead>
            <tbody>
              {rankingGeneral.map(s => {
                const notas = examColumns.map(col => s.notas[col]?.nota);
                return (
                  <tr key={s.codigo} className="ranking-row" onClick={() => navigate(`/student/${s.codigo}`)}>
                    <td className="td-rank">{s.rank}</td>
                    <td className="td-codigo">{s.codigo}</td>
                    <td className="td-nombre">{s.nombre}</td>
                    {notas.map((n, i) => (
                      <td key={i} className="td-nota">
                        {n !== undefined
                          ? <span className={n >= 10 ? 'grade-pass' : 'grade-fail'}>{n.toFixed(1)}</span>
                          : <span className="td-pendiente">—</span>
                        }
                      </td>
                    ))}
                    <td className="td-nota">
                      {s.promedio !== null
                        ? <span className={s.promedio >= 10 ? 'grade-pass' : 'grade-fail'}>{s.promedio.toFixed(1)}</span>
                        : <span className="td-pendiente">—</span>
                      }
                    </td>
                    <td className={s.ingresado === true ? 'td-ingresado' : 'td-no-ingresado'} title={s.carrera}>
                      {s.ingresado === true ? '✓' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ranking-card">
        <h3>Ranking Arquitectura — Top 15</h3>
        <div className="table-wrapper">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Nombre</th>
                {['1PC','2PC','1EP','3PC','4PC','2EP','5PC','6PC','7PC','EF','PAV','T1','T2','T3','T4','T5','T6','ACUM'].map(col => (
                  <th key={col}>{col}</th>
                ))}
                <th>Prom.</th>
                <th>Ing.</th>
              </tr>
            </thead>
            <tbody>
              {rankingArquitectura.map(s => {
                const pcEP = ['1PC','2PC','1EP','3PC','4PC','2EP','5PC','6PC','7PC','EF','PAV'].map(col => s.notas[col]?.nota);
                const tareas = s.taller?.tareas || [];
                const tNotas = [1,2,3,4,5,6].map(i => {
                  const t = tareas.find(t => t.numero === i);
                  return t?.nota;
                });
                const acum = s.taller?.acumulado;
                return (
                  <tr key={s.codigo} className="ranking-row" onClick={() => navigate(`/student/${s.codigo}`)}>
                    <td className="td-rank">{s.rank}</td>
                    <td className="td-codigo">{s.codigo}</td>
                    <td className="td-nombre">{s.nombre}</td>
                    {pcEP.map((n, i) => (
                      <td key={`pe-${i}`} className="td-nota">
                        {n !== undefined
                          ? <span className={n >= 10 ? 'grade-pass' : 'grade-fail'}>{n.toFixed(1)}</span>
                          : <span className="td-pendiente">—</span>
                        }
                      </td>
                    ))}
                    {tNotas.map((n, i) => (
                      <td key={`t-${i}`} className="td-nota">
                        {n !== null && n !== undefined
                          ? <span className={n >= 10 ? 'grade-pass' : 'grade-fail'}>{n.toFixed(1)}</span>
                          : <span className="td-pendiente">—</span>
                        }
                      </td>
                    ))}
                    <td className="td-nota">
                      {acum !== null && acum !== undefined
                        ? <span className={acum >= 10 ? 'grade-pass' : 'grade-fail'}>{acum.toFixed(1)}</span>
                        : <span className="td-pendiente">—</span>
                      }
                    </td>
                    <td className="td-nota">
                      {s.promedio !== null
                        ? <span className={s.promedio >= 10 ? 'grade-pass' : 'grade-fail'}>{s.promedio.toFixed(1)}</span>
                        : <span className="td-pendiente">—</span>
                      }
                    </td>
                    <td className={s.ingresado === true ? 'td-ingresado' : 'td-no-ingresado'} title={s.carrera}>
                      {s.ingresado === true ? '✓' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
