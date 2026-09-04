import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_PARTICIPANTS = 'cepregod_sorteo_participants';
const STORAGE_KEY_LAST_ID = 'cepregod_sorteo_lastId';
const STORAGE_KEY_USER_HASH = 'cepregod_sorteo_userHash';
const FOLLOWER_GOAL = 100;
const WHATSAPP_URL = 'https://whatsapp.com/channel/0029Vb98c4E60eBiHsfPq73O';

function loadParticipants() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PARTICIPANTS)) || [];
  } catch { return []; }
}

function loadLastId() {
  try {
    return Number(localStorage.getItem(STORAGE_KEY_LAST_ID)) || 0;
  } catch { return 0; }
}

function loadUserHash() {
  try {
    return localStorage.getItem(STORAGE_KEY_USER_HASH) || null;
  } catch { return null; }
}

function hashName(name, phone) {
  let hash = 0;
  const str = name.trim().toLowerCase() + phone.trim();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

function maskPhone(phone) {
  if (!phone || phone.length <= 4) return phone || '';
  return phone.slice(0, 3) + '***' + phone.slice(-3);
}

export default function SorteosPage() {
  const [participants, setParticipants] = useState(loadParticipants);
  const [lastId, setLastId] = useState(loadLastId);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketGenerated, setTicketGenerated] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LAST_ID, String(lastId));
  }, [lastId]);

  useEffect(() => {
    const userHash = loadUserHash();
    if (userHash) {
      const saved = participants.find(p => p.hash === userHash);
      if (saved) setTicketGenerated(saved);
    }
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/sorteo');
        const { drawing, winner: apiWinner } = await res.json();

        if (drawing && !isDrawing && !showWinner) {
          const parts = loadParticipants();
          if (parts.length < 2) return;
          setIsDrawing(true);
          setShowWinner(false);
          setWinner(null);
          let count = 0;
          const maxIterations = 30 + Math.floor(Math.random() * 10);
          const rollInterval = setInterval(() => {
            setCurrentNumber(parts[count % parts.length].id);
            count++;
            if (count >= maxIterations) {
              clearInterval(rollInterval);
              if (apiWinner) {
                setWinner(apiWinner);
              } else {
                const idx = Math.floor(Math.random() * parts.length);
                setWinner(parts[idx]);
              }
              setIsDrawing(false);
              setShowWinner(true);
            }
          }, 80);
        }
      } catch {}
    };

    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [isDrawing, showWinner]);

  const generateTicket = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedPhone) {
      setFormError('Completa ambos campos.');
      return;
    }
    if (trimmedPhone.length < 8) {
      setFormError('Ingresa un número de teléfono válido.');
      return;
    }

    const userHash = hashName(trimmedName, trimmedPhone);
    const existing = participants.find(p => p.hash === userHash);
    if (existing) {
      setTicketGenerated(existing);
      localStorage.setItem(STORAGE_KEY_USER_HASH, userHash);
      setFormError('');
      return;
    }

    const newId = lastId + 1;
    const ticket = {
      id: newId,
      name: trimmedName,
      phone: trimmedPhone,
      hash: userHash,
      date: new Date().toISOString()
    };
    setParticipants(prev => [...prev, ticket]);
    setLastId(newId);
    setTicketGenerated(ticket);
    localStorage.setItem(STORAGE_KEY_USER_HASH, userHash);
    setFormError('');
    setName('');
    setPhone('');
  }, [name, phone, lastId, participants]);

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

      <div className="sorteo-prize-card">
        <div className="sorteo-prize-icon">📚</div>
        <h3 className="sorteo-prize-title">LIBRO OFICIAL CEPREGOD</h3>
        <p className="sorteo-prize-desc">Preparación Universitaria UNI — Edición 2026</p>
      </div>

      <div className="sorteo-goal-card">
        <p className="sorteo-goal-text">
          ¡Al llegar a la meta de <strong>{FOLLOWER_GOAL} SEGUIDORES</strong> en nuestro
          canal de WhatsApp, se activará el sorteo en vivo en esta misma página! 🚀
        </p>
      </div>

      <div className="sorteo-step">
        <div className="sorteo-step-number">1</div>
        <div className="sorteo-step-content">
          <h3 className="sorteo-step-title">Únete al Canal de WhatsApp</h3>
          <p className="sorteo-step-desc">Suscríbete para recibir notificaciones del sorteo.</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sorteo-whatsapp-btn"
          >
            📲 Unirme al Canal de WhatsApp
          </a>
        </div>
      </div>

      {!ticketGenerated && (
        <div className="sorteo-step">
          <div className="sorteo-step-number">2</div>
          <div className="sorteo-step-content">
            <h3 className="sorteo-step-title">Registra tu Ticket</h3>
            <p className="sorteo-step-desc">Completa tus datos para obtener tu ticket participante.</p>
            <div className="sorteo-form">
              <div className="sorteo-form-group">
                <span className="sorteo-form-icon">👤</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Ingresa tu Nombre Completo"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFormError(''); }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="sorteo-form-group">
                <span className="sorteo-form-icon">📱</span>
                <input
                  type="tel"
                  className="search-input"
                  placeholder="Ingresa tu Número de Teléfono"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setFormError(''); }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              {formError && <p className="sorteo-form-error">{formError}</p>}
              <button
                className="sorteo-generate-btn"
                onClick={generateTicket}
                disabled={!name.trim() || !phone.trim()}
              >
                🎟️ Obtener Mi Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {ticketGenerated && (
        <div className="sorteo-ticket">
          <div className="sorteo-ticket-badge">TICKET #{String(ticketGenerated.id).padStart(3, '0')}</div>
          <div className="sorteo-ticket-name">{ticketGenerated.name}</div>
          <div className="sorteo-ticket-phone">{maskPhone(ticketGenerated.phone)}</div>
          <p className="sorteo-ticket-note">
            Ya estás participando con el TICKET #{String(ticketGenerated.id).padStart(3, '0')}.
          </p>
          <p className="sorteo-ticket-note">Guarda tu número — lo necesitarás para el sorteo.</p>
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
