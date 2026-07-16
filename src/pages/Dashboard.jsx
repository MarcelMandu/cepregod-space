import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import ErrorScreen from '../components/ErrorScreen.jsx';
import { DistributionChart } from '../components/Charts.jsx';
import CountdownCard from '../components/CountdownCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

export default function Dashboard() {
  const { data, loading, error, retry } = useData();
  const navigate = useNavigate();

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

  const examColumns = ['1PC', '2PC', '1EP', '3PC', '4PC', '2EP', '5PC', '6PC', '7PC'];

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={retry} />;
  }

  return (
    <div className="dashboard">
      <div className="hero-section">
        <div className="hero-left">
          <h1 className="hero-title">
            <span className="hero-ciclo">Ciclo Especial</span>
            <span className="hero-cepre">CEPRE UNI 2026</span>
          </h1>
          <p className="hero-subtitle">
            Análisis detallado de postulantes — Resultados en tiempo real de cada PC, Examen Parcial y Talleres de Arquitectura.
          </p>
          <p className="hero-note">
            Estadísticas procesadas de los resultados de la preparación preuniversitaria UNI.
          </p>

        </div>
        <div className="hero-right" />
      </div>
      <div className="hero-divider" />

      <CountdownCard />

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
                    {['1PC','2PC','1EP','3PC','4PC','2EP','5PC','6PC','7PC','T1','T2','T3','T4','T5','T6','ACUM'].map(col => (
                      <th key={col}>{col}</th>
                    ))}
                    <th>Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingArquitectura.map(s => {
                    const pcEP = ['1PC','2PC','1EP','3PC','4PC','2EP','5PC','6PC','7PC'].map(col => s.notas[col]?.nota);
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="distrib-section">
            <h3>PARCIALES CEPRE UNI</h3>
            <div className="distrib-parciales">
              {['1EP', '2EP'].map(exam => {
                const dist = data.distributions?.[exam];
                return (
                  <div key={exam} className="distrib-card">
                    <DistributionChart data={dist || {}} title={exam} height={280} color="#FF0033" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="distrib-section">
            <h3>PRÁCTICAS CALIFICADAS (6/8)</h3>
            <div className="distrib-pcs">
              {['1PC', '2PC', '3PC', '4PC', '5PC', '6PC', '7PC'].map(exam => {
                const dist = data.distributions?.[exam];
                return (
                  <div key={exam} className="distrib-card">
                    <DistributionChart data={dist || {}} title={exam} height={260} color="#00F0FF" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="distrib-section">
            <h3>TALLER DE ARQUITECTURA</h3>
            <div className="distrib-taller">
              <div className="distrib-card">
                <DistributionChart data={data.distributions?.['TALLER'] || {}} title="TALLER" height={280} color="#BD00FF" />
              </div>
            </div>
          </div>
    </div>
  );
}

