import { useState } from 'react'

export default function Footer() {
  const [showYape, setShowYape] = useState(false)

  return (
    <>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-col footer-brand">
            <div className="footer-logo">
              <span style={{ color: '#FFFFFF' }}>Cepre</span>
              <span style={{ color: '#FF0033' }}>God</span>
            </div>
            <p className="footer-copy">&copy; 2026 CepreGod. Todos los derechos reservados.</p>
          </div>
          <div className="footer-col footer-creator">
            <span className="footer-badge">CREADOR UNICO</span>
            <p className="footer-name">Facundo Marcel Mandujano Gutierrez</p>
            <a
              href="https://www.instagram.com/facu_mandu?igsh=MXFnOXh3cXNldXl6dw=="
              target="_blank"
              rel="noopener noreferrer"
              className="footer-instagram"
              aria-label="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
          <div className="footer-col footer-legal">
            <p>Fuentes: Informacion procesada a partir de los cronogramas y PDFs publicos de admision CEPRE-UNI.</p>
            <p>Nota: Este sitio web tiene fines puramente informativos y de simulacion. No representa un canal de comunicacion oficial de la institucion.</p>
          </div>
        </div>
      </footer>

      <button className="yape-fab" onClick={() => setShowYape(true)}>
        💜 Apoyar a CepreGod
      </button>

      {showYape && (
        <div className="yape-modal-overlay" onClick={() => setShowYape(false)}>
          <div className="yape-modal-card" onClick={e => e.stopPropagation()}>
            <button className="yape-modal-close" onClick={() => setShowYape(false)}>✕</button>
            <img src="/yape-qr.png" alt="Yape QR" className="yape-modal-img" />
          </div>
        </div>
      )}
    </>
  )
}
