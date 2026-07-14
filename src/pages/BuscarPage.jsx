import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useData } from '../context/DataContext.jsx';

export default function BuscarPage() {
  const { data, loading, error } = useData();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!data || query.length < 1) return [];
    const q = query.toLowerCase();
    return data.students.filter(
      s => s.codigo.toLowerCase().includes(q) || s.nombre.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [data, query]);

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-card">
          <span className="error-icon">⚠️</span>
          <h3>Error al cargar datos</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Buscar Alumno</h2>
        <p className="header-sub">{data.students.length} alumnos registrados</p>
      </div>

      <div className="search-card">
        <div className="search-input-wrap">
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Ingresa código o apellido del alumno..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              className="search-clear"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="results-list">
          {results.map((s) => (
            <div
              key={s.codigo}
              className="result-item"
              onClick={() => navigate(`/student/${s.codigo}`)}
            >
              <span className="result-codigo">{s.codigo}</span>
              <span className="result-nombre">{s.nombre}</span>
              {s.isArquitectura && <span className="result-badge">ARQ</span>}
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p>No se encontraron alumnos con "{query}"</p>
        </div>
      )}

      {!query && (
        <div className="stats-overview">
          <div className="stat-mini-card">
            <span className="stat-mini-num">{data.students.length}</span>
            <span className="stat-mini-label">Alumnos</span>
          </div>
          <div className="stat-mini-card">
            <span className="stat-mini-num">{Object.keys(data.examStats).length}</span>
            <span className="stat-mini-label">Exámenes</span>
          </div>
          <div className="stat-mini-card">
            <span className="stat-mini-num">
              {data.students.filter(s => s.isArquitectura).length}
            </span>
            <span className="stat-mini-label">Arquitectura</span>
          </div>
        </div>
      )}
    </div>
  );
}
