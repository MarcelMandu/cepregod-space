import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { path: '/', label: 'DASHBOARD' },
  { path: '/rankings', label: 'RANKINGS' },
  { path: '/buscar', label: 'BUSCAR' },
  { path: '/posiciones', label: 'TABLA DE POSICIONES' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    if (mobileOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="brand-cepre">Cepre</span><span className="brand-god">God</span>
          </Link>
          <span className="navbar-badge">CEPRE UNI 2026</span>
        </div>
        <div className="navbar-links">
          {links.map(({ path, label }) => (
            <Link key={path} to={path} className={`nav-link ${location.pathname === path ? 'active' : ''}`}>
              <span className="nav-link-text">{label}</span>
            </Link>
          ))}
        </div>
        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`} />
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            {links.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`mobile-link ${location.pathname === path ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
