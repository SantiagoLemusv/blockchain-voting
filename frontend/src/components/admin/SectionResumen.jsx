import { format } from "date-fns";
import es from "date-fns/locale/es";
import ActivityFeed from "../ActivityFeed";
import DashboardChart from "./DashboardChart";
import { getElectionState, participationRate } from "../../utils/electionUtils";

export default function SectionResumen({ elections, totalVoters, activityLog, onSelectElection, onNavigateSection }) {
  const active = elections.filter((e) => getElectionState(e) === "active").length;
  const upcoming = elections.filter((e) => getElectionState(e) === "upcoming").length;
  const ended = elections.filter((e) => getElectionState(e) === "ended").length;
  const totalVotes = elections.reduce((sum, e) => sum + e.totalVotes, 0);
  const latest = elections.length > 0 ? elections[elections.length - 1] : null;
  const overallParticipation = participationRate(totalVotes, totalVoters);

  const formatDate = (ts) => {
    if (!ts || isNaN(ts)) return "—";
    try {
      return format(new Date(ts * 1000), "dd MMM HH:mm", { locale: es });
    } catch {
      return "—";
    }
  };

  return (
    <div>
      <h2 className="section-title">📊 Resumen del sistema</h2>
      <p className="muted" style={{ marginBottom: 20, fontSize: 13 }}>
        Vista general de métricas, participación y actividad reciente.
      </p>

      {/* Métricas */}
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
          <div className="stat-label">Votos emitidos</div>
        </div>
      </div>

      {/* Gráfica visual */}
      <DashboardChart elections={elections} />

      {/* Participación */}
      {totalVoters > 0 && totalVotes > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: "14px 16px" }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Participación global estimada</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>
              {overallParticipation}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallParticipation}%` }} />
          </div>
          <p className="small" style={{ marginTop: 6 }}>
            {totalVotes} votos / {totalVoters} votantes registrados
          </p>
        </div>
      )}

      {latest && (
        <div className="card" style={{ marginBottom: 20, padding: "12px 16px" }}>
          <span className="small">Última elección creada</span>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{latest.name}</div>
          <div className="small" style={{ marginTop: 2 }}>
            {formatDate(latest.startTime)} — {formatDate(latest.endTime)}
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 8, fontSize: 12, padding: "6px 12px" }}
            onClick={() => onSelectElection?.(latest)}
          >
            Ver detalles →
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div className="section-divider">Acciones rápidas</div>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <button className="card admin-quick-btn" onClick={() => onNavigateSection?.("votaciones")}>
          <div style={{ fontSize: 24 }}>🗳️</div>
          <strong style={{ fontSize: 13 }}>Crear elección</strong>
          <span className="small">Lanzar nueva votación</span>
        </button>
        <button className="card admin-quick-btn" onClick={() => onNavigateSection?.("usuarios")}>
          <div style={{ fontSize: 24 }}>👤</div>
          <strong style={{ fontSize: 13 }}>Registrar votante</strong>
          <span className="small">Autorizar nuevo participante</span>
        </button>
        <button className="card admin-quick-btn" onClick={() => onNavigateSection?.("auditoria")}>
          <div style={{ fontSize: 24 }}>🔍</div>
          <strong style={{ fontSize: 13 }}>Auditar sistema</strong>
          <span className="small">Ver bitácora pública</span>
        </button>
      </div>

      {/* Activity feed */}
      <div style={{ marginTop: 24 }}>
        <ActivityFeed activities={activityLog} />
      </div>
    </div>
  );
}
