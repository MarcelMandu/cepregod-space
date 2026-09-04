import { useState, useEffect, useCallback } from 'react';

const ADMIN_KEY = 'CEPRE2026';

function maskPhone(phone) {
  if (!phone || phone.length <= 4) return phone || '';
  return phone.slice(0, 3) + '***' + phone.slice(-3);
}

export default function AdminSorteo() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showWinner, setShowWinner] = useState(false);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch('/api/sorteo');
      const data = await res.json();
      setParticipants(data.participants || []);
    } catch {}
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchParticipants();
  }, [isAuthenticated, fetchParticipants]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(fetchParticipants, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchParticipants]);

  const handleLogin = useCallback(() => {
    if (passwordInput.trim() === ADMIN_KEY) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Clave incorrecta.');
    }
  }, [passwordInput]);

  const startDraw = useCallback(async () => {
    if (participants.length < 2) return;
    setIsDrawing(true);
    setShowWinner(false);
    setWinner(null);

    try {
      await fetch('/api/sorteo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'draw', drawing: true, winner: null })
      });
    } catch {}

    let count = 0;
    const maxIterations = 30 + Math.floor(Math.random() * 10);
    const interval = setInterval(async () => {
      setCurrentNumber(participants[count % participants.length].id);
      count++;
      if (count >= maxIterations) {
        clearInterval(interval);
        const winnerIdx = Math.floor(Math.random() * participants.length);
        const w = participants[winnerIdx];
        setWinner(w);
        setIsDrawing(false);
        setShowWinner(true);

        try {
          await fetch('/api/sorteo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'draw', drawing: false, winner: w })
          });
        } catch {}
      }
    }, 80);
  }, [participants]);

  const handleLoginKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  if (!isAuthenticated) {
    return (
      <div className="dashboard">
        <section className="hero-center">
          <h1 className="hero-center-title">
            <span className="hero-center-ciclo">🔒 PANEL</span>
            <span className="hero-center-cepre">ADMINISTRADOR</span>
          </h1>
        </section>
        <div className="admin-login">
          <p className="admin-login-label">Ingresa la clave de administrador:</p>
          <div className="admin-login-form">
            <input
              type="password"
              className="search-input"
              placeholder="Clave de acceso"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }}
              onKeyDown={handleLoginKeyDown}
            />
            <button className="admin-login-btn" onClick={handleLogin}>
              🔓 Entrar
            </button>
          </div>
          {passwordError && <p className="admin-login-error">{passwordError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <section className="hero-center">
        <h1 className="hero-center-title">
          <span className="hero-center-ciclo">🔒 PANEL</span>
          <span className="hero-center-cepre">ADMINISTRADOR</span>
        </h1>
        <p className="hero-center-subtitle">Control del Sorteo — Libro UNI 2026</p>
      </section>

      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <span className="admin-stat-value">{participants.length}</span>
          <span className="admin-stat-label">PARTICIPANTES</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">
            #{String(participants.length > 0 ? participants[participants.length - 1].id : 0).padStart(3, '0')}
          </span>
          <span className="admin-stat-label">ÚLTIMO TICKET</span>
        </div>
      </div>

      {participants.length > 0 && (
        <div className="admin-table-wrap">
          <h3 className="admin-table-title">📋 Lista de Participantes</h3>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(p => (
                  <tr key={p.id}>
                    <td className="admin-table-id">#{String(p.id).padStart(3, '0')}</td>
                    <td>{p.name}</td>
                    <td>{maskPhone(p.phone)}</td>
                    <td>{new Date(p.date).toLocaleDateString('es-PE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {participants.length === 0 && (
        <div className="admin-empty">
          <p>No hay participantes registrados aún.</p>
        </div>
      )}

      {participants.length >= 2 && !isDrawing && !showWinner && (
        <div className="admin-draw-section">
          <button className="admin-draw-btn" onClick={startDraw}>
            🎲 Iniciar Sorteo Aleatorio
          </button>
          <p className="admin-draw-note">
            Se seleccionará un ganador al azar de entre los {participants.length} participantes.
          </p>
        </div>
      )}

      {isDrawing && (
        <div className="sorteo-animation">
          <div className="sorteo-animation-label">🎲 SORTENANDO...</div>
          <div className="sorteo-rolling-number">#{String(currentNumber).padStart(3, '0')}</div>
          <div className="sorteo-animation-dots">
            <span className="sorteo-dot" />
            <span className="sorteo-dot" />
            <span className="sorteo-dot" />
          </div>
        </div>
      )}

      {showWinner && winner && (
        <div className="sorteo-winner-overlay">
          <div className="sorteo-winner-card">
            <div className="sorteo-winner-confetti">🎉🏆🎉</div>
            <div className="sorteo-winner-badge">🏆 GANADOR</div>
            <div className="sorteo-winner-ticket">TICKET #{String(winner.id).padStart(3, '0')}</div>
            <div className="sorteo-winner-name">{winner.name}</div>
            <div className="sorteo-winner-congrats">¡Felicitaciones!</div>
          </div>
        </div>
      )}
    </div>
  );
}
