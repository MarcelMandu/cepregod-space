import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { path: '/', label: 'Dashboard' },
  { path: '/rankings', label: 'Rankings' },
  { path: '/buscar', label: 'Buscar' },
  { path: '/posiciones', label: 'Tabla de Posiciones' },
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
              {location.pathname === path && (
                <motion.div
                  className="nav-pill"
                  layoutId="active-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="nav-link-text">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
