import RegisterVoter from "../RegisterVoter";

export default function SectionUsuarios({ onRegister, totalVoters }) {
  return (
    <div>
      <h2 className="section-title">👥 Gestión de participantes</h2>
      <p className="muted" style={{ marginBottom: 20, fontSize: 13 }}>
        Autoriza a las personas que podrán participar en las votaciones. Solo los participantes registrados pueden
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
        <strong style={{ color: "#0369a1", fontSize: 13 }}>💡 ¿Cómo funciona la autorización?</strong>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#0c4a6e", lineHeight: 1.6 }}>
          Cada participante necesita un identificador único (su billetera digital). Lo autorizas una sola vez y, a partir
          de ahí, podrá votar en cualquier elección activa.
        </p>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#0c4a6e", lineHeight: 1.6 }}>
          <strong>🔐 Privacidad:</strong> La lista de participantes autorizados es pública (cualquiera puede verificar
          quién está habilitado), pero la <em>identidad real</em> de cada persona permanece protegida — solo tú custodias
          esa relación.
        </p>
      </div>
    </div>
  );
}
