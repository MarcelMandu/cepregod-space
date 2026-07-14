import { useState, useEffect } from 'react';

const examenes = [
  { id: '6PC',  nombre: '6.ª PRUEBA CALIFICADA',     fecha: '2026-07-12T09:00:00' },
  { id: '7PC',  nombre: '7.ª PRUEBA CALIFICADA',     fecha: '2026-07-26T09:00:00' },
  { id: 'PAV',  nombre: 'PRUEBA DE APTITUD VOCACIONAL', fecha: '2026-08-01T09:00:00' },
  { id: 'EF',   nombre: 'EXAMEN FINAL',              fecha: '2026-08-02T09:00:00' },
];

function getNextExam() {
  const now = new Date();
  return examenes.find(e => new Date(e.fecha) > now) || null;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function CountdownCard() {
  const [exam, setExam] = useState(getNextExam);
  const [diff, setDiff] = useState({ dias: 0, horas: 0, min: 0, seg: 0 });

  useEffect(() => {
    const tick = () => {
      const next = getNextExam();
      if (next !== exam) {
        setExam(next);
      }
      if (next) {
        const now = new Date();
        const target = new Date(next.fecha);
        const ms = Math.max(0, target - now);
        const seg = Math.floor(ms / 1000) % 60;
        const min = Math.floor(ms / 60000) % 60;
        const horas = Math.floor(ms / 3600000) % 24;
        const dias = Math.floor(ms / 86400000);
        setDiff({ dias, horas, min, seg });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [exam]);

  if (!exam) {
    return (
      <div className="countdown-card">
        <div className="countdown-header">
          <span className="countdown-title">CENTRO DE SEGUIMIENTO</span>
        </div>
        <div className="countdown-ended">
          Todos los exámenes han finalizado.
        </div>
      </div>
    );
  }

  const desafios = examenes.slice(examenes.indexOf(exam) + 1);

  return (
    <div className="countdown-card">
      <div className="countdown-header">
        <div>
          <span className="countdown-title">CENTRO DE SEGUIMIENTO</span>
          <h2 className="countdown-exam">{exam.nombre} CEPREUNI</h2>
        </div>
        <div className="countdown-date">
          <span className="countdown-clock">🕒</span>
          {new Date(exam.fecha).toLocaleDateString('es-PE', {
            day: 'numeric', month: 'short', year: 'numeric'
          }).toUpperCase()}
        </div>
      </div>

      <div className="countdown-boxes">
        <div className="countdown-box">
          <span className="countdown-number">{pad(diff.dias)}</span>
          <span className="countdown-label">DIAS</span>
        </div>
        <div className="countdown-box">
          <span className="countdown-number">{pad(diff.horas)}</span>
          <span className="countdown-label">HOR</span>
        </div>
        <div className="countdown-box">
          <span className="countdown-number">{pad(diff.min)}</span>
          <span className="countdown-label">MIN</span>
        </div>
        <div className="countdown-box">
          <span className="countdown-number">{pad(diff.seg)}</span>
          <span className="countdown-label">SEG</span>
        </div>
      </div>

      {desafios.length > 0 && (
        <div className="countdown-challenges">
          <span className="countdown-challenges-title">PROXIMOS DESAFIOS</span>
          <div className="countdown-challenges-list">
            {desafios.map(d => (
              <div key={d.id} className="countdown-challenge-item">
                <span className="challenge-arrow">→</span>
                <span className="challenge-name">{d.nombre}</span>
                <span className="challenge-date">
                  {new Date(d.fecha).toLocaleDateString('es-PE', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  }).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
