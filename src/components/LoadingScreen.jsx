export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-card">
        <div className="spinner-gradient" />
        <p className="loading-text">
          Conectando con la base de datos{' '}
          <span style={{color: '#FFFFFF'}}>Cepre</span>
          <span style={{color: '#FF0033'}}>God</span>...
        </p>
        <p className="loading-sub">Procesando orden de m&eacute;rito en tiempo real...</p>
      </div>
    </div>
  );
}
