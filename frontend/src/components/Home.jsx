import { getElectionState } from "../utils/electionUtils";

export default function Home({ account, isAdmin, elections, totalVoters, onNavigate }) {
  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const active = elections.filter((e) => getElectionState(e) === "active").length;
  const upcoming = elections.filter((e) => getElectionState(e) === "upcoming").length;
  const ended = elections.filter((e) => getElectionState(e) === "ended").length;

  return (
    <div>
      {/* Hero section */}
      <div style={{ textAlign: "center", paddingBottom: 32, marginBottom: 32 }}>
        <h1 className="landing-title" style={{ marginBottom: 8 }}>
          Bienvenido, <span className="landing-highlight">{formatAddress(account)}</span>
        </h1>
        <p className="landing-desc" style={{ margin: 0 }}>
          Sistema de votación descentralizado. Ya estás conectado y listo para participar.
        </p>
      </div>

      {/* Status card */}
      <div
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
          padding: "16px",
        }}
      >
        <div>
          <span className="small">Estado de conexión</span>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <div className="wallet-dot" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Conectado</span>
          </div>
          {isAdmin && (
            <span className="badge badge-success" style={{ marginTop: 6, display: "inline-block" }}>
              Administrador
            </span>
          )}
        </div>
        <div>
          <span className="small">Red</span>
          <div style={{ marginTop: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>localhost · 2 votantes</span>
          </div>
        </div>
      </div>

      {/* System summary */}
      <div className="section-divider">Resumen del sistema</div>
      <div
        className="stat-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", marginBottom: 24 }}
      >
        <div className="stat-card">
          <div className="stat-number">{elections.length}</div>
          <div className="stat-label">Elecciones</div>
        </div>
        <div className="stat-card">
          <div className="stat-number green">{active}</div>
          <div className="stat-label">Activas ahora</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#f59e0b" }}>{upcoming}</div>
          <div className="stat-label">Próximas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number muted">{ended}</div>
          <div className="stat-label">Finalizadas</div>
        </div>
      </div>

      {/* Quick navigation */}
      <div className="section-divider">Navegar</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        <button
          onClick={() => onNavigate("vote")}
          className="card"
          style={{
            cursor: "pointer",
            padding: 24,
            textAlign: "center",
            border: "2px solid transparent",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🗳️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Votar</div>
          <div className="small">Emite tu voto en las elecciones activas</div>
        </button>

        <button
          onClick={() => onNavigate("results")}
          className="card"
          style={{
            cursor: "pointer",
            padding: 24,
            textAlign: "center",
            border: "2px solid transparent",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Resultados</div>
          <div className="small">Consulta los resultados en tiempo real</div>
        </button>

        {isAdmin && (
          <button
            onClick={() => onNavigate("admin")}
            className="card"
            style={{
              cursor: "pointer",
              padding: 24,
              textAlign: "center",
              border: "2px solid transparent",
              transition: "all 0.15s",
              background: "#ede9fe",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚙️</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Panel Admin</div>
            <div className="small">Gestiona votantes y elecciones</div>
          </button>
        )}
      </div>

      {/* Info section */}
      <div style={{ marginTop: 32, padding: 20, background: "#f0f9ff", borderRadius: 12 }}>
        <strong style={{ color: "#0369a1" }}>💡 ¿Qué es esto?</strong>
        <p style={{ margin: "8px 0 0", color: "#0c4a6e", fontSize: 13, lineHeight: 1.6 }}>
          Sistema de votación descentralizado basado en Ethereum. Cada voto queda registrado de
          forma inmutable en la blockchain. Seguro, transparente y auditable en todo momento.
        </p>
      </div>
    </div>
  );
}
