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

  const stats = useMemo(() => {
    if (!data?.students) return null;
    const students = data.students;
    const total = students.length;
    const ingresados = students.filter(s => s.ingresado === true).length;
    const tasa = total > 0 ? ((ingresados / total) * 100).toFixed(1) : '—';
    const promedios = students.map(s => s.promedio).filter(p => p !== null && p !== undefined);
    const promedioGeneral = promedios.length > 0
      ? (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(2)
      : '—';
    return { total, ingresados, tasa, promedioGeneral };
  }, [data]);

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

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={retry} />;
  }

  return (
    <div className="dashboard">
      <section className="hero-center">
        <h1 className="hero-center-title">
          <span className="hero-center-ciclo">Ciclo Especial</span>
          <span className="hero-center-cepre">CEPRE UNI 2026</span>
        </h1>
        <p className="hero-center-subtitle">
          Análisis detallado de postulantes — Resultados en tiempo real de cada PC, Examen Parcial y Talleres de Arquitectura.
        </p>
        <p className="hero-center-note">
          Estadísticas procesadas de los resultados de la preparación preuniversitaria UNI.
        </p>
      </section>

      <section className="stats-panel">
        {stats ? (
          <>
            <div className="stat-card">
              <span className="stat-card-label">POSTULANTES</span>
              <span className="stat-card-value">{stats.total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">PROMEDIO GENERAL</span>
              <span className="stat-card-value">{stats.promedioGeneral}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">INGRESADOS</span>
              <span className="stat-card-value stat-card-success">{stats.ingresados}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">TASA DE INGRESO</span>
              <span className="stat-card-value stat-card-accent">{stats.tasa}%</span>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card"><span className="stat-card-label">POSTULANTES</span><span className="stat-card-value">—</span></div>
            <div className="stat-card"><span className="stat-card-label">PROMEDIO GENERAL</span><span className="stat-card-value">—</span></div>
            <div className="stat-card"><span className="stat-card-label">INGRESADOS</span><span className="stat-card-value">—</span></div>
            <div className="stat-card"><span className="stat-card-label">TASA DE INGRESO</span><span className="stat-card-value">—</span></div>
          </>
        )}
      </section>

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

          <div className="distrib-section">
            <h3>PARCIALES CEPRE UNI</h3>
            <div className="distrib-parciales">
              {['1EP', '2EP', 'EF', 'PAV'].map(exam => {
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

