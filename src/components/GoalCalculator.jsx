import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';

const examWeights = {
  '1PC': 1, '2PC': 1, '3PC': 1, '4PC': 1,
  '5PC': 1, '6PC': 1, '7PC': 1,
  '1EP': 2, '2EP': 4, 'EF': 6, 'PAV': 1,
};

const examOrder = ['1PC', '2PC', '3PC', '4PC', '5PC', '6PC', '7PC', '1EP', '2EP', 'EF', 'PAV'];

function computeStudentStats(student) {
  let weightedSum = 0;
  let totalWeightDone = 0;
  const pending = [];

  for (const name of examOrder) {
    if (name === 'PAV' && !student.isArquitectura) continue;
    const weight = examWeights[name];
    const nota = student.notas[name]?.nota;
    if (nota !== undefined) {
      weightedSum += nota * weight;
      totalWeightDone += weight;
    } else {
      pending.push({ name, weight });
    }
  }

  const totalWeight = student.isArquitectura ? 20 : 19;
  return {
    weightedSum,
    totalWeightDone,
    totalWeight,
    pending,
    currentWAvg: totalWeightDone > 0 ? weightedSum / totalWeightDone : 0,
    remainingWeight: totalWeight - totalWeightDone,
  };
}

export default function GoalCalculator({ student }) {
  const { data } = useData();
  const careers = data?.careers || [];

  const [selectedCareer, setSelectedCareer] = useState('');
  const [mode, setMode] = useState('meta');
  const [simValues, setSimValues] = useState({});

  const stats = useMemo(() => computeStudentStats(student), [student]);
  const { weightedSum, totalWeightDone, totalWeight, pending, currentWAvg, remainingWeight } = stats;

  const career = careers.find(c => c.name === selectedCareer);
  const target = career?.target || 0;

  const requiredAvg = remainingWeight > 0 && target > 0
    ? ((target * totalWeight) - weightedSum) / remainingWeight
    : 0;

  const handleSimChange = (exam, value) => {
    setSimValues(prev => ({ ...prev, [exam]: value }));
  };

  let projectedAvg = 0;
  if (mode === 'simular') {
    let simSum = weightedSum;
    let simWeight = totalWeightDone;
    for (const { name, weight } of pending) {
      const v = simValues[name];
      if (v !== undefined && v !== '') {
        const parsed = parseFloat(v);
        if (!isNaN(parsed)) {
          simSum += parsed * weight;
          simWeight += weight;
        }
      }
    }
    if (simWeight > 0) projectedAvg = simSum / totalWeight;
  }

  const isOnTrack = target > 0 && currentWAvg >= target;

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
              <span className="goal-stat-label">TU PROM. POND.</span>
              <span className={`goal-stat-value ${isOnTrack ? 'goal-on-track' : 'goal-behind'}`}>
                {currentWAvg.toFixed(2)}
              </span>
            </div>
            <div className="goal-stat">
              <span className="goal-stat-label">PESO RESTANTE</span>
              <span className="goal-stat-value goal-neutral">{remainingWeight}</span>
            </div>
          </div>

          {pending.length > 0 && (
            <div className="goal-pending-list">
              <span className="goal-pending-label">Ex&aacute;menes pendientes:</span>
              <div className="goal-pending-exams">
                {pending.map(({ name, weight }) => (
                  <span key={name} className="goal-pending-badge">
                    {name} <small>×{weight}</small>
                  </span>
                ))}
              </div>
            </div>
          )}

          {remainingWeight > 0 && !isOnTrack && (
            <div className="goal-required">
              <span className="goal-required-label">Necesitas promedio de</span>
              <span className="goal-required-value">
                {requiredAvg > 0 ? requiredAvg.toFixed(2) : '—'}
              </span>
              <span className="goal-required-label">en los ex&aacute;menes restantes</span>
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
              {pending.map(({ name, weight }) => (
                <div key={name} className="goal-sim-input-group">
                  <label className="goal-sim-label">
                    {name} <small>(×{weight})</small>
                  </label>
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
