import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useData } from '../context/DataContext.jsx';

export default function RankingsPage() {
  const { data, loading, error } = useData();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const allRanked = useMemo(() => {
    if (!data) return [];
    return [...data.students]
      .sort((a, b) => (b.promedio ?? 0) - (a.promedio ?? 0))
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }, [data]);

  const filtered = useMemo(() => {
    if (!query) return allRanked;
    const q = query.toLowerCase();
    return allRanked.filter(
      s => s.codigo.toLowerCase().includes(q) || s.nombre.toLowerCase().includes(q)
    );
  }, [allRanked, query]);

  const ROWS_PER_PAGE = 25;
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [query]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filtered.slice(start, start + ROWS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const examColumns = ['1PC', '2PC', '1EP', '3PC', '4PC', '2EP', '5PC', '6PC'];

  if (loading) {
    return <LoadingScreen />;
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

      <div className="rankings-page">
      <div className="ranking-card">
        <h3>Ranking Completo — {allRanked.length} alumnos</h3>
        <div className="table-wrapper">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Nombre</th>
                {examColumns.map(col => (
                  <th key={col}>{col}</th>
                ))}
                <th>Prom.</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(s => {
                const notas = examColumns.map(col => s.notas[col]?.nota);
                return (
                  <tr key={s.codigo} className="ranking-row" onClick={() => navigate(`/student/${s.codigo}`)}>
                    <td className={`td-rank ${s.rank <= 3 ? 'top-3' : ''}`}>{s.rank}</td>
                    <td className="td-codigo">{s.codigo}</td>
                    <td className="td-nombre">{s.nombre}</td>
                    {notas.map((n, i) => (
                      <td key={i} className="td-nota">
                        {n !== undefined
                          ? <span className={n >= 10 ? 'grade-pass' : 'grade-fail'}>{n.toFixed(1)}</span>
                          : <span className="td-pendiente">—</span>
                        }
                      </td>
                    ))}
                    <td className="td-nota">
                      {s.promedio !== null
                        ? <span className={s.promedio >= 10 ? 'grade-pass' : 'grade-fail'}>{s.promedio.toFixed(1)}</span>
                        : <span className="td-pendiente">—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>←</button>
            {getPageNumbers().map((p, i) =>
              p === '...'
                ? <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
                : <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            )}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
