import { Link, useLocation } from 'react-router-dom';

const links = [
  { path: '/', label: 'DASHBOARD' },
  { path: '/rankings', label: 'RANKINGS' },
  { path: '/buscar', label: 'BUSCAR' },
  { path: '/posiciones', label: 'TABLA DE POSICIONES' },
];

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
          {links.map(({ path, label }) => (
            <Link key={path} to={path} className={`nav-link ${location.pathname === path ? 'active' : ''}`}>
              <span className="nav-link-text">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
