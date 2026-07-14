import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';

const totalExams = 9;

const examOrder = ['1PC', '2PC', '3PC', '4PC', '5PC', '6PC', '7PC', '1EP', '2EP'];

function computeStudentStats(student) {
  let sum = 0;
  let count = 0;
  const pending = [];
  for (const name of examOrder) {
    const nota = student.notas[name]?.nota;
    if (nota !== undefined) {
      sum += nota;
      count++;
    } else {
      pending.push(name);
    }
  }
  return { currentSum: sum, currentCount: count, pending, currentAvg: count > 0 ? sum / count : 0 };
}

export default function GoalCalculator({ student }) {
  const { data } = useData();
  const careers = data?.careers || [];

  const [selectedCareer, setSelectedCareer] = useState('');
  const [mode, setMode] = useState('meta');
  const [simValues, setSimValues] = useState({});

  const stats = useMemo(() => computeStudentStats(student), [student]);
  const { currentSum, currentCount, pending, currentAvg } = stats;

  const career = careers.find(c => c.name === selectedCareer);
  const target = career?.target || 0;
  const remaining = totalExams - currentCount;

  const requiredAvg = remaining > 0 && target > 0
    ? ((target * totalExams) - currentSum) / remaining
    : 0;

  const handleSimChange = (exam, value) => {
    setSimValues(prev => ({ ...prev, [exam]: value }));
  };

  let projectedAvg = 0;
  if (mode === 'simular') {
    let simSum = 0;
    let simCount = 0;
    for (const name of examOrder) {
      const real = student.notas[name]?.nota;
      if (real !== undefined) {
        simSum += real;
        simCount++;
      } else if (simValues[name] !== undefined && simValues[name] !== '') {
        const v = parseFloat(simValues[name]);
        if (!isNaN(v)) {
          simSum += v;
          simCount++;
        }
      }
    }
    if (simCount > 0) projectedAvg = simSum / totalExams;
  }

  const isOnTrack = target > 0 && currentAvg >= target;

  if (careers.length === 0) return null;

  return (
    <section className="goal-calculator">
      <div className="goal-header">
        <span className="goal-icon">🎯</span>
        <span className="goal-title">CALCULADORA DE METAS</span>
      </div>

      <div className="goal-select-row">
        <label className="goal-label">Selecciona tu carrera:</label>
        <select
          className="goal-select"
          value={selectedCareer}
          onChange={e => setSelectedCareer(e.target.value)}
        >
          <option value="">— Seleccionar —</option>
          {careers.map(c => (
            <option key={c.code || c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCareer && (
        <div className="goal-results">
          <div className="goal-stats">
            <div className="goal-stat">
              <span className="goal-stat-label">META</span>
              <span className="goal-stat-value goal-target">{target.toFixed(2)}</span>
            </div>
            <div className="goal-stat">
              <span className="goal-stat-label">TU PROMEDIO</span>
              <span className={`goal-stat-value ${isOnTrack ? 'goal-on-track' : 'goal-behind'}`}>
                {currentAvg.toFixed(2)}
              </span>
            </div>
            <div className="goal-stat">
              <span className="goal-stat-label">EXÁMENES RESTANTES</span>
              <span className="goal-stat-value goal-neutral">{remaining}</span>
            </div>
          </div>

          {remaining > 0 && !isOnTrack && (
            <div className="goal-required">
              <span className="goal-required-label">Necesitas promedio de</span>
              <span className="goal-required-value">
                {requiredAvg > 0 ? requiredAvg.toFixed(2) : '—'}
              </span>
              <span className="goal-required-label">en los {remaining} exámenes restantes</span>
            </div>
          )}

          {isOnTrack && (
            <div className="goal-on-track-msg">¡Ya alcanzaste la meta para esta carrera!</div>
          )}

          <div className="goal-mode-tabs">
            <button
              className={`goal-mode-tab ${mode === 'meta' ? 'active' : ''}`}
              onClick={() => setMode('meta')}
            >
              META
            </button>
            <button
              className={`goal-mode-tab ${mode === 'simular' ? 'active' : ''}`}
              onClick={() => setMode('simular')}
            >
              SIMULAR
            </button>
          </div>

          {mode === 'simular' && pending.length > 0 && (
            <div className="goal-sim-grid">
              {pending.map(name => (
                <div key={name} className="goal-sim-input-group">
                  <label className="goal-sim-label">{name}</label>
                  <input
                    className="goal-sim-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    placeholder="0-20"
                    value={simValues[name] ?? ''}
                    onChange={e => handleSimChange(name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {mode === 'simular' && projectedAvg > 0 && (
            <div className="goal-projected">
              <span className="goal-projected-label">Promedio proyectado:</span>
              <span className={`goal-projected-value ${projectedAvg >= target ? 'goal-on-track' : 'goal-behind'}`}>
                {projectedAvg.toFixed(2)}
              </span>
              {projectedAvg >= target && (
                <span className="goal-projected-badge">✓ META ALCANZABLE</span>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
