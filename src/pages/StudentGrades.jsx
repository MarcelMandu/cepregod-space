import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext.jsx';
import { BarChart, EvolutionChart } from '../components/Charts.jsx';
import GoalCalculator from '../components/GoalCalculator.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ErrorScreen from '../components/ErrorScreen.jsx';

export default function StudentGrades() {
  const { codigo } = useParams();
  const { data, loading, error, retry } = useData();
  const [copied, setCopied] = useState(false);

  const student = useMemo(() => {
    if (!data) return null;
    return data.students.find(s => s.codigo === codigo) || null;
  }, [data, codigo]);

  const examStats = data?.examStats || {};

  useEffect(() => {
    if (student?.ingresado !== true) return;
    confetti({
      particleCount: 120,
      spread: 80,
      angle: 60,
      origin: { x: 0, y: 1 },
      startVelocity: 55,
    });
    confetti({
      particleCount: 120,
      spread: 80,
      angle: 120,
      origin: { x: 1, y: 1 },
      startVelocity: 55,
    });
    const timer = setTimeout(() => {
      confetti({
        particleCount: 300,
        spread: 360,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#FFD700', '#FFC000', '#FFF8DC', '#FFE066', '#FF0033'],
        scalar: 1.2,
        ticks: 220,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [student]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={retry} />;
  if (!student) return <Navigate to="/" replace />;

  const pcExams = ['1PC', '2PC', '3PC', '4PC', '5PC', '6PC', '7PC'];
  const epExams = ['1EP', '2EP'];
  const efExams = ['EF'];
  const pavExams = ['PAV'];

  const allNotas = [];
  let total = 0;
  let count = 0;

  const pcGrades = [];
  for (const name of pcExams) {
    const nota = student.notas[name]?.nota;
    const puntaje = student.notas[name]?.puntaje;
    pcGrades.push({
      name,
      nota,
      puntaje,
      avg: examStats[name]?.avg,
      max: examStats[name]?.max,
      min: examStats[name]?.min,
      pendiente: nota === undefined
    });
    if (nota !== undefined) {
      allNotas.push({ name, nota, avg: examStats[name]?.avg });
      total += nota;
      count++;
    }
  }

  const epGrades = [];
  for (const name of epExams) {
    const nota = student.notas[name]?.nota;
    const puntaje = student.notas[name]?.puntaje;
    epGrades.push({
      name,
      nota,
      puntaje,
      avg: examStats[name]?.avg,
      max: examStats[name]?.max,
      min: examStats[name]?.min,
      pendiente: nota === undefined
    });
    if (nota !== undefined) {
      allNotas.push({ name, nota, avg: examStats[name]?.avg });
      total += nota;
      count++;
    }
  }

  const efGrades = [];
  for (const name of efExams) {
    const nota = student.notas[name]?.nota;
    const puntaje = student.notas[name]?.puntaje;
    efGrades.push({
      name,
      nota,
      puntaje,
      avg: examStats[name]?.avg,
      max: examStats[name]?.max,
      min: examStats[name]?.min,
      pendiente: nota === undefined
    });
    if (nota !== undefined) {
      allNotas.push({ name, nota, avg: examStats[name]?.avg });
      total += nota;
      count++;
    }
  }

  const pavGrades = [];
  for (const name of pavExams) {
    const nota = student.notas[name]?.nota;
    const puntaje = student.notas[name]?.puntaje;
    pavGrades.push({
      name,
      nota,
      puntaje,
      avg: examStats[name]?.avg,
      max: examStats[name]?.max,
      min: examStats[name]?.min,
      pendiente: nota === undefined
    });
    if (nota !== undefined) {
      allNotas.push({ name, nota, avg: examStats[name]?.avg });
      total += nota;
      count++;
    }
  }

  const promedio = count > 0 ? total / count : 0;

  const tallerGrades = [];
  if (student.taller) {
    for (const t of student.taller.tareas) {
      if (t.nota !== null) {
        tallerGrades.push({ name: `T${t.numero}`, nota: t.nota, puntaje: t.puntaje });
      }
    }
  }

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="student-page">
      <div className="page-top-bar">
        <Link to="/" className="back-link">← Volver</Link>
        <button className="share-btn" onClick={handleShare}>
          {copied ? '✅ Copiado!' : '📤 Compartir'}
        </button>
      </div>

      <div className="student-profile-card">
        <div className="profile-info">
          <h2 className="profile-name">{student.nombre.toUpperCase()}</h2>
          <div className="profile-meta">
            <span className="profile-codigo">{student.codigo}</span>
            {student.isArquitectura && <span className="profile-badge">ARQ</span>}
            {student.rank && <span className="profile-badge rank-badge">TOP {student.rank}</span>}
          </div>
          <div className="profile-details">
            {student.puestoIngreso != null && (
              <div className="profile-detail">
                <span className="profile-detail-label">Puesto</span>
                <span className="profile-detail-value">#{student.puestoIngreso}</span>
              </div>
            )}
            {student.carrera && (
              <div className="profile-detail">
                <span className="profile-detail-label">Carrera</span>
                <span className="profile-detail-value">{student.carrera}</span>
              </div>
            )}
            <div className="profile-detail">
              <span className="profile-detail-label">Estado</span>
              {student.ingresado === true ? (
                <span className="profile-badge profile-badge-ingresado">✓ INGRESANTE</span>
              ) : student.ingresado === false ? (
                <span className="profile-badge profile-badge-no">No ingresó</span>
              ) : (
                <span className="profile-detail-value">—</span>
              )}
            </div>
          </div>
        </div>
        <div className="profile-score">
          <span className="profile-score-number">
            {(student.promedio ?? promedio).toFixed(2)}
          </span>
          <span className="profile-score-label">Promedio Simple</span>
        </div>
      </div>

      {student.PID !== undefined ? (
        <section className="grade-section">
          <h3 className="section-title">Puntaje Final</h3>
          <div className="chart-card">
            <div style={{ padding: '0.3rem 0' }}>
              <div style={{ fontSize: '0.82rem', marginBottom: '0.6rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                PID = S({student.PIDdesglose.S}) + 2×EP1({student.PIDdesglose.EP1}) + 4×EP2({student.PIDdesglose.EP2}) + 6×EF({student.PIDdesglose.EF})
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.3rem', color: 'var(--primary)' }}>
                {student.PID} pts
                <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-secondary)' }}> / 2700 pts</span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: 10, height: 18, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(student.PID / 2700 * 100, 100)}%`,
                  background: student.PID / 2700 >= 0.5 ? 'var(--success)' : student.PID / 2700 >= 0.35 ? 'var(--warning)' : 'var(--danger)',
                  height: '100%',
                  borderRadius: 10,
                  transition: 'width 0.5s'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                <span>{(student.PID / 2700 * 100).toFixed(1)}% del puntaje máximo</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Nota: {student.vigesimal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="chart-card" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Aún no hay datos suficientes para calcular el puntaje final
        </div>
      )}

      {pcGrades.length > 0 && (
        <section className="grade-section">
          <h3 className="section-title">
            Prácticas Calificadas (PCs)
            <span className="section-count">{pcGrades.filter(g => !g.pendiente).length}/{pcGrades.length} exámenes</span>
          </h3>
            <div className="chart-card chart-card-pc">
            <BarChart data={pcGrades.filter(g => !g.pendiente)} title="PCs - Notas" compare={true} barColor="#00F0FF" />
          </div>
          <div className="data-table-card table-card-pc">
            <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Examen</th>
                  <th>Nota (0-20)</th>
                  <th>Puntaje (0-150)</th>
                  <th>Promedio</th>
                  <th>Máx</th>
                  <th>Mín</th>
                  <th>Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {pcGrades.map(g => (
                  <tr key={g.name}>
                    <td className="td-exam">{g.name}</td>
                    <td className="td-num" data-label="Nota">
                      {g.pendiente ? (
                        <span className="td-pendiente">Pendiente</span>
                      ) : (
                        <span className={g.nota >= 10 ? 'grade-pass' : 'grade-fail'}>
                          {g.nota.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="td-num" data-label="Puntaje">
                      {g.pendiente ? (
                        <span className="td-pendiente">—</span>
                      ) : g.puntaje !== null && g.puntaje !== undefined ? (
                        <span className={g.puntaje >= 75 ? 'grade-pass' : 'grade-fail'}>{g.puntaje.toFixed(2)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="td-num" data-label="Promedio">{g.avg?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Máx">{g.max?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Mín">{g.min?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Rendimiento">
                      {g.pendiente ? '-' : g.avg ? (
                        <span className={g.nota >= g.avg ? 'badge-up' : 'badge-down'}>
                          {g.nota >= g.avg ? '▲ Sobre promedio' : '▼ Bajo promedio'}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </section>
      )}

      {epGrades.length > 0 && (
        <section className="grade-section">
          <h3 className="section-title">
            Exámenes Parciales (EPs)
            <span className="section-count">{epGrades.filter(g => !g.pendiente).length}/{epGrades.length} exámenes</span>
          </h3>
          <div className="chart-card chart-card-ep">
            <BarChart data={epGrades.filter(g => !g.pendiente)} title="Parciales - Notas" compare={true} barColor="#FF0033" />
          </div>
          <div className="data-table-card table-card-ep">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Examen</th>
                  <th>Nota (0-20)</th>
                  <th>Puntaje (0-150)</th>
                  <th>Promedio</th>
                  <th>Máx</th>
                  <th>Mín</th>
                  <th>Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {epGrades.map(g => (
                  <tr key={g.name}>
                    <td className="td-exam">{g.name}</td>
                    <td className="td-num" data-label="Nota">
                      {g.pendiente ? (
                        <span className="td-pendiente">Pendiente</span>
                      ) : (
                        <span className={g.nota >= 10 ? 'grade-pass' : 'grade-fail'}>
                          {g.nota.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="td-num" data-label="Puntaje">
                      {g.pendiente ? (
                        <span className="td-pendiente">—</span>
                      ) : g.puntaje !== null && g.puntaje !== undefined ? (
                        <span className={g.puntaje >= 75 ? 'grade-pass' : 'grade-fail'}>{g.puntaje.toFixed(2)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="td-num" data-label="Promedio">{g.avg?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Máx">{g.max?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Mín">{g.min?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Rendimiento">
                      {g.pendiente ? '-' : g.avg ? (
                        <span className={g.nota >= g.avg ? 'badge-up' : 'badge-down'}>
                          {g.nota >= g.avg ? '▲ Sobre promedio' : '▼ Bajo promedio'}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </section>
      )}

      {efGrades.length > 0 && (
        <section className="grade-section">
          <h3 className="section-title">
            Examen Final (EF)
            <span className="section-count">{efGrades.filter(g => !g.pendiente).length}/{efGrades.length} exámenes</span>
          </h3>
          <div className="chart-card chart-card-ef">
            <BarChart data={efGrades.filter(g => !g.pendiente)} title="Examen Final" compare={true} barColor="#BD00FF" />
          </div>
          <div className="data-table-card table-card-ef">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Examen</th>
                  <th>Nota (0-20)</th>
                  <th>Puntaje (0-150)</th>
                  <th>Promedio</th>
                  <th>Máx</th>
                  <th>Mín</th>
                  <th>Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {efGrades.map(g => (
                  <tr key={g.name}>
                    <td className="td-exam">{g.name}</td>
                    <td className="td-num" data-label="Nota">
                      {g.pendiente ? (
                        <span className="td-pendiente">Pendiente</span>
                      ) : (
                        <span className={g.nota >= 10 ? 'grade-pass' : 'grade-fail'}>
                          {g.nota.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="td-num" data-label="Puntaje">
                      {g.pendiente ? (
                        <span className="td-pendiente">—</span>
                      ) : g.puntaje !== null && g.puntaje !== undefined ? (
                        <span className={g.puntaje >= 75 ? 'grade-pass' : 'grade-fail'}>{g.puntaje.toFixed(2)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="td-num" data-label="Promedio">{g.avg?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Máx">{g.max?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Mín">{g.min?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Rendimiento">
                      {g.pendiente ? '-' : g.avg ? (
                        <span className={g.nota >= g.avg ? 'badge-up' : 'badge-down'}>
                          {g.nota >= g.avg ? '▲ Sobre promedio' : '▼ Bajo promedio'}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </section>
      )}

      {student.isArquitectura && pavGrades.length > 0 && (
        <section className="grade-section">
          <h3 className="section-title">
            Aptitud Vocacional (PAV)
            <span className="section-count">{pavGrades.filter(g => !g.pendiente).length}/{pavGrades.length} exámenes</span>
          </h3>
          <div className="chart-card chart-card-ef">
            <BarChart data={pavGrades.filter(g => !g.pendiente)} title="Aptitud Vocacional" compare={true} barColor="#BD00FF" />
          </div>
          <div className="data-table-card table-card-ef">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Examen</th>
                  <th>Nota (0-20)</th>
                  <th>Puntaje (0-200)</th>
                  <th>Promedio</th>
                  <th>Máx</th>
                  <th>Mín</th>
                  <th>Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {pavGrades.map(g => (
                  <tr key={g.name}>
                    <td className="td-exam">{g.name}</td>
                    <td className="td-num" data-label="Nota">
                      {g.pendiente ? (
                        <span className="td-pendiente">Pendiente</span>
                      ) : (
                        <span className={g.nota >= 10 ? 'grade-pass' : 'grade-fail'}>
                          {g.nota.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="td-num" data-label="Puntaje">
                      {g.pendiente ? (
                        <span className="td-pendiente">—</span>
                      ) : g.puntaje !== null && g.puntaje !== undefined ? (
                        <span className={g.puntaje >= 100 ? 'grade-pass' : 'grade-fail'}>{g.puntaje.toFixed(2)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="td-num" data-label="Promedio">{g.avg?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Máx">{g.max?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Mín">{g.min?.toFixed(2) || '-'}</td>
                    <td className="td-num" data-label="Rendimiento">
                      {g.pendiente ? '-' : g.avg ? (
                        <span className={g.nota >= g.avg ? 'badge-up' : 'badge-down'}>
                          {g.nota >= g.avg ? '▲ Sobre promedio' : '▼ Bajo promedio'}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </section>
      )}

      {tallerGrades.length > 0 && (
        <section className="grade-section">
          <h3 className="section-title">
            Taller (Arquitectura)
            <span className="section-count">{tallerGrades.length} tareas</span>
          </h3>
          <div className="stats-mini-row">
            {student.taller?.seccion && (
              <div className="stat-pill">
                <span className="stat-pill-label">Sección</span>
                <span className="stat-pill-value">{student.taller.seccion}</span>
              </div>
            )}
            {student.taller?.acumulado !== null && (
              <div className="stat-pill">
                <span className="stat-pill-label">Acumulado</span>
                <span className="stat-pill-value">{student.taller.acumulado?.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="chart-card chart-card-taller">
            <BarChart data={tallerGrades} title="Taller - Notas" compare={false} barColor="#BD00FF" />
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tarea</th>
                  <th>Nota</th>
                  <th>Puntaje</th>
                </tr>
              </thead>
              <tbody>
                {tallerGrades.map(t => (
                  <tr key={t.name}>
                    <td className="td-exam">{t.name}</td>
                    <td className="td-num" data-label="Nota">{t.nota.toFixed(2)}</td>
                    <td className="td-num" data-label="Puntaje">{t.puntaje !== null ? t.puntaje.toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {allNotas.length > 1 && (
        <section className="grade-section">
          <h3 className="section-title">
            Evolución de Notas
          </h3>
          <div className="chart-card chart-card-evolution">
            <EvolutionChart data={allNotas} />
          </div>
        </section>
      )}

      <GoalCalculator student={student} />
    </div>
  );
}
