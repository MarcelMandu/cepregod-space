import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

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
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/rankings" className={`nav-link ${location.pathname === '/rankings' ? 'active' : ''}`}>
            Rankings
          </Link>
          <Link to="/buscar" className={`nav-link ${location.pathname === '/buscar' ? 'active' : ''}`}>
            Buscar
          </Link>
          <Link to="/posiciones" className={`nav-link ${location.pathname === '/posiciones' ? 'active' : ''}`}>
            Tabla de Posiciones
          </Link>
        </div>
      </div>
    </nav>
  );
}
