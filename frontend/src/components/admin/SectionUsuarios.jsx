import RegisterVoter from "../RegisterVoter";

export default function SectionUsuarios({ onRegister, totalVoters }) {
  return (
    <div>
      <h2 className="section-title">👥 Gestión de usuarios</h2>
      <p className="muted" style={{ marginBottom: 20, fontSize: 13 }}>
        Registra las direcciones Ethereum que pueden participar en las votaciones. Solo las direcciones registradas pueden
        emitir votos.
      </p>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-number">{totalVoters}</div>
          <div className="stat-label">Votantes registrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-number muted" style={{ fontSize: 14, lineHeight: 1.4, paddingTop: 8 }}>
            🔐<br />
            <span style={{ fontSize: 11 }}>Solo el admin puede registrar</span>
          </div>
          <div className="stat-label">Permisos</div>
        </div>
      </div>

      {/* Formulario */}
      <div className="card">
        <RegisterVoter isAdmin={true} onRegister={onRegister} />
      </div>

      {/* Info */}
      <div style={{ marginTop: 20, padding: 16, background: "#f0f9ff", borderRadius: 8 }}>
        <strong style={{ color: "#0369a1", fontSize: 13 }}>💡 ¿Cómo funciona el registro?</strong>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#0c4a6e", lineHeight: 1.6 }}>
          Cada votante necesita una dirección Ethereum válida (su wallet MetaMask). Esa dirección se registra una sola vez
          en el contrato <code>VoterRegistry</code>. Una vez autorizada, podrá participar en cualquier elección activa.
        </p>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#0c4a6e", lineHeight: 1.6 }}>
          <strong>⚠️ Nota de privacidad:</strong> El registro es público en blockchain (cualquiera puede ver las direcciones
          autorizadas), pero la identidad real detrás de cada dirección permanece privada.
        </p>
      </div>
    </div>
  );
}
