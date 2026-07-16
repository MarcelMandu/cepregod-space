export default function ErrorScreen({ message, onRetry }) {
  return (
    <div className="loading-screen">
      <div className="loading-card">
        <div className="error-icon">&#9888;</div>
        <p className="loading-text" style={{color: '#FF0033'}}>
          Error de conexi&oacute;n
        </p>
        <p className="loading-sub" style={{marginBottom: '1.2rem'}}>
          {message || 'No se pudieron cargar los datos desde Google Sheets.'}
        </p>
        {onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            &#8635; REINTENTAR
          </button>
        )}
      </div>
    </div>
  );
}
