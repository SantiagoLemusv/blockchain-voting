import RegisterVoter from "./RegisterVoter";
import CreateElection from "./CreateElection";
import { format } from "date-fns";
import es from "date-fns/locale/es";

export default function AdminDashboard({ elections, totalVoters, onRegister, onCreate }) {
  const active = elections.filter((e) => e.isActive).length;
  const finished = elections.filter((e) => !e.isActive).length;

  const formatDate = (ts) =>
    format(new Date(ts * 1000), "dd MMM HH:mm", { locale: es });

  return (
    <div>
      <h2 className="section-title">Panel de Administrador</h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        Gestiona votantes, elecciones y consulta el estado del sistema.
      </p>

      {/* ── Métricas ── */}
      <div className="section-divider">Resumen del sistema</div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-number">{elections.length}</div>
          <div className="stat-label">Total de elecciones</div>
        </div>
        <div className="stat-card">
          <div className="stat-number green">{active}</div>
          <div className="stat-label">Activas ahora</div>
        </div>
        <div className="stat-card">
          <div className="stat-number muted">{finished}</div>
          <div className="stat-label">Finalizadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalVoters}</div>
          <div className="stat-label">Votantes registrados</div>
        </div>
      </div>

      {/* ── Acciones de administración ── */}
      <div className="section-divider">Acciones</div>
      <div className="admin-actions">
        <div className="card">
          <RegisterVoter isAdmin={true} onRegister={onRegister} />
        </div>
        <div className="card">
          <CreateElection isAdmin={true} onCreate={onCreate} />
        </div>
      </div>

      {/* ── Lista de elecciones ── */}
      <div className="section-divider">Elecciones creadas</div>
      {elections.length === 0 ? (
        <p className="muted">Aún no hay elecciones. Crea una desde el formulario de arriba.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {elections.map((e) => (
            <div
              key={e.address}
              className="card"
              style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <strong style={{ fontSize: 15 }}>{e.name}</strong>
                  <span className={e.isActive ? "badge badge-success" : "badge badge-muted"}>
                    {e.isActive ? "Activa" : "Finalizada"}
                  </span>
                  <span className="badge badge-muted" style={{ fontSize: 11 }}>
                    {e.votingType === 0 ? "Única" : `Múltiple ≤${e.maxChoices}`}
                  </span>
                </div>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                  {formatDate(e.startTime)} — {formatDate(e.endTime)}
                  {" · "}{e.options.length} opciones{" · "}{e.totalVotes} votos
                </p>
              </div>
              <span
                style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0 }}
              >
                {e.address.slice(0, 8)}…
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
