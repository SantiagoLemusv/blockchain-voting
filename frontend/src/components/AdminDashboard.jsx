import { format } from "date-fns";
import es from "date-fns/locale/es";
import RegisterVoter from "./RegisterVoter";
import CreateElection from "./CreateElection";
import ElectionStatus from "./ElectionStatus";
import ActivityFeed from "./ActivityFeed";
import { getElectionState, participationRate } from "../utils/electionUtils";

export default function AdminDashboard({ elections, totalVoters, onRegister, onCreate, onSelectElection, activityLog }) {
  const active = elections.filter((e) => getElectionState(e) === "active").length;
  const upcoming = elections.filter((e) => getElectionState(e) === "upcoming").length;
  const ended = elections.filter((e) => getElectionState(e) === "ended").length;
  const totalVotes = elections.reduce((sum, e) => sum + e.totalVotes, 0);

  const formatDate = (ts) => format(new Date(ts * 1000), "dd MMM HH:mm", { locale: es });

  const latest = elections.length > 0 ? elections[elections.length - 1] : null;
  const overallParticipation = participationRate(totalVotes, totalVoters);

  return (
    <div>
      <h2 className="section-title">Panel de Administrador</h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        Gestiona votantes, elecciones y consulta el estado del sistema en tiempo real.
      </p>

      {/* ── Métricas ── */}
      <div className="section-divider">Resumen del sistema</div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-number">{elections.length}</div>
          <div className="stat-label">Total elecciones</div>
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
        <div className="stat-card">
          <div className="stat-number">{totalVoters}</div>
          <div className="stat-label">Votantes registrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalVotes}</div>
          <div className="stat-label">Votos totales emitidos</div>
        </div>
      </div>

      {/* ── Participation rate ── */}
      {totalVoters > 0 && totalVotes > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: "14px 16px" }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Participación global estimada</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{overallParticipation}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallParticipation}%` }} />
          </div>
          <p className="small" style={{ marginTop: 6 }}>
            {totalVotes} votos / {totalVoters} votantes registrados
          </p>
        </div>
      )}

      {/* ── Latest election ── */}
      {latest && (
        <div className="card" style={{ marginBottom: 20, padding: "12px 16px" }}>
          <span className="small">Última elección creada</span>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{latest.name}</div>
          <div className="small" style={{ marginTop: 2 }}>
            {formatDate(latest.startTime)} — {formatDate(latest.endTime)}
          </div>
        </div>
      )}

      {/* ── Acciones ── */}
      <div className="section-divider">Acciones</div>
      <div className="admin-actions">
        <div className="card">
          <RegisterVoter isAdmin={true} onRegister={onRegister} />
        </div>
        <div className="card">
          <CreateElection isAdmin={true} onCreate={onCreate} />
        </div>
      </div>

      {/* ── Elecciones + Actividad ── */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr" }}>
        <div>
          <div className="section-divider">Elecciones creadas</div>
          {elections.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🗳️</div>
              <p className="empty-state-title">Sin elecciones aún</p>
              <p className="empty-state-desc">Crea la primera desde el formulario de arriba.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {elections.map((e) => (
                <div
                  key={e.address}
                  className="card election-card-clickable"
                  style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}
                  onClick={() => onSelectElection && onSelectElection(e)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 14 }}>{e.name}</strong>
                      <ElectionStatus election={e} showCountdown={true} />
                      <span className="badge badge-muted" style={{ fontSize: 11 }}>
                        {e.votingType === 0 ? "Única" : `Múltiple ≤${e.maxChoices}`}
                      </span>
                    </div>
                    <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                      {formatDate(e.startTime)} — {formatDate(e.endTime)}
                      {" · "}{e.options.length} opciones{" · "}{e.totalVotes} votos
                    </p>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {e.address.slice(0, 8)}…
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <ActivityFeed activities={activityLog} />
        </div>
      </div>
    </div>
  );
}
