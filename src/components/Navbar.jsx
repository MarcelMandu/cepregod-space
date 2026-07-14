import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span style={{color: '#FFFFFF'}}>Cepre</span><span style={{color: '#FF0033'}}>God</span>
        </Link>
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
        </div>
      </div>
    </nav>
  );
}
