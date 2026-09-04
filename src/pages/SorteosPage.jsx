import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_PARTICIPANTS = 'cepregod_sorteo_participants';
const STORAGE_KEY_LAST_ID = 'cepregod_sorteo_lastId';
const FOLLOWER_GOAL = 500;
const CURRENT_FOLLOWERS = 320;
const WHATSAPP_URL = 'https://whatsapp.com/channel/0029Vb98c4E60eBiHsfPq73O';

function loadParticipants() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PARTICIPANTS)) || [];
  } catch {
    return [];
  }
}

function loadLastId() {
  try {
    return Number(localStorage.getItem(STORAGE_KEY_LAST_ID)) || 0;
  } catch {
    return 0;
  }
}

export default function SorteosPage() {
  const [participants, setParticipants] = useState(loadParticipants);
  const [lastId, setLastId] = useState(loadLastId);
  const [name, setName] = useState('');
  const [ticketGenerated, setTicketGenerated] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LAST_ID, String(lastId));
  }, [lastId]);

  const progressPercent = Math.min((CURRENT_FOLLOWERS / FOLLOWER_GOAL) * 100, 100);

  const generateTicket = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newId = lastId + 1;
    const ticket = { id: newId, name: trimmed, date: new Date().toISOString() };
    setParticipants(prev => [...prev, ticket]);
    setLastId(newId);
    setTicketGenerated(ticket);
    setName('');
  }, [name, lastId]);

  const startDraw = useCallback(() => {
    if (participants.length < 2) return;
    setIsDrawing(true);
    setShowWinner(false);
    setWinner(null);
    let count = 0;
    const maxIterations = 30 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      setCurrentNumber(participants[count % participants.length].id);
      count++;
      if (count >= maxIterations) {
        clearInterval(interval);
        const winnerIdx = Math.floor(Math.random() * participants.length);
        setWinner(participants[winnerIdx]);
        setIsDrawing(false);
        setShowWinner(true);
      }
    }, 80);
  }, [participants]);

  const resetDraw = useCallback(() => {
    setShowWinner(false);
    setWinner(null);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') generateTicket();
  };

  return (
    <div className="dashboard">
      <section className="hero-center">
        <h1 className="hero-center-title">
          <span className="hero-center-ciclo">🎁 SORTEO DE LIBRO</span>
          <span className="hero-center-cepre">UNI 2026</span>
        </h1>
        <p className="hero-center-subtitle">
          Participa y gana el libro oficial de CepreGod — Preparación Universitaria UNI.
        </p>
        <p className="hero-center-note">
          Registra tu ticket y espera al sorteo en vivo.
        </p>
      </section>

      <div className="sorteo-goal-card">
        <div className="sorteo-goal-header">
          <span className="sorteo-goal-count">{CURRENT_FOLLOWERS}</span>
          <span className="sorteo-goal-separator">/</span>
          <span className="sorteo-goal-total">{FOLLOWER_GOAL} SEGUIDORES</span>
        </div>
        <div className="sorteo-progress-bar">
          <div
            className="sorteo-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="sorteo-goal-legend">
          El sorteo se ejecutará en vivo en esta página al llegar a los {FOLLOWER_GOAL} seguidores.
        </p>
      </div>

      <div className="sorteo-step">
        <div className="sorteo-step-number">1</div>
        <div className="sorteo-step-content">
          <h3 className="sorteo-step-title">Suscríbete al Canal de WhatsApp</h3>
          <p className="sorteo-step-desc">Únete para recibir notificaciones del sorteo.</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sorteo-whatsapp-btn"
          >
            📲 Ir al Canal de WhatsApp
          </a>
        </div>
      </div>

      <div className="sorteo-step">
        <div className="sorteo-step-number">2</div>
        <div className="sorteo-step-content">
          <h3 className="sorteo-step-title">Registra tu Ticket</h3>
          <p className="sorteo-step-desc">Ingresa tu nombre o código para generar tu participante.</p>
          <div className="sorteo-register">
            <div className="search-input-wrap">
              <span className="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Ingresa tu Nombre o Código"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              className="sorteo-generate-btn"
              onClick={generateTicket}
              disabled={!name.trim()}
            >
              🎟️ Generar Ticket
            </button>
          </div>
        </div>
      </div>

      {ticketGenerated && (
        <div className="sorteo-ticket">
          <div className="sorteo-ticket-badge">TICKET GENERADO</div>
          <div className="sorteo-ticket-id">#{String(ticketGenerated.id).padStart(3, '0')}</div>
          <div className="sorteo-ticket-name">{ticketGenerated.name}</div>
          <div className="sorteo-ticket-note">Guarda tu número — lo necesitarás para el sorteo.</div>
        </div>
      )}

      {participants.length > 0 && (
        <div className="sorteo-participants">
          <h3 className="sorteo-participants-title">
            👥 Participantes ({participants.length})
          </h3>
          <div className="sorteo-participants-grid">
            {participants.map(p => (
              <div key={p.id} className="sorteo-participant-card">
                <span className="sorteo-participant-id">#{String(p.id).padStart(3, '0')}</span>
                <span className="sorteo-participant-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {participants.length >= 2 && !isDrawing && !showWinner && (
        <div className="sorteo-draw-section">
          <button className="sorteo-draw-btn" onClick={startDraw}>
            🎲 Iniciar Sorteo Aleatorio
          </button>
          <p className="sorteo-draw-note">
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
        <div className="sorteo-winner-overlay" onClick={resetDraw}>
          <div className="sorteo-winner-card" onClick={e => e.stopPropagation()}>
            <div className="sorteo-winner-confetti">🎉🏆🎉</div>
            <div className="sorteo-winner-badge">🏆 GANADOR</div>
            <div className="sorteo-winner-ticket">TICKET #{String(winner.id).padStart(3, '0')}</div>
            <div className="sorteo-winner-name">{winner.name}</div>
            <div className="sorteo-winner-congrats">¡Felicitaciones!</div>
            <button className="sorteo-winner-close" onClick={resetDraw}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
