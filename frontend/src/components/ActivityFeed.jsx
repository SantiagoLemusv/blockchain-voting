import { format } from "date-fns";
import es from "date-fns/locale/es";

const EVENT_META = {
  election_created: { icon: "🗳️", label: "Elección creada" },
  voter_registered: { icon: "👤", label: "Votante registrado" },
  vote_cast: { icon: "✅", label: "Voto emitido" },
  vote_multiple: { icon: "✅", label: "Votos emitidos" },
};

export default function ActivityFeed({ activities }) {
  const recent = activities ? [...activities].reverse().slice(0, 20) : [];

  return (
    <div>
      <div className="section-divider">Actividad reciente</div>
      {recent.length === 0 ? (
        <p className="muted" style={{ fontSize: 13, textAlign: "center", padding: "16px 0" }}>
          Sin actividad registrada aún en esta sesión.
        </p>
      ) : (
        <div className="activity-feed">
          {recent.map((a, i) => {
            const meta = EVENT_META[a.type] || { icon: "📋", label: a.type };
            return (
              <div key={i} className="activity-item">
                <span className="activity-icon">{meta.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{meta.label}</div>
                  {a.payload?.name && (
                    <div
                      className="muted"
                      style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {a.payload.name}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", flexShrink: 0 }}>
                  {format(new Date(a.timestamp), "HH:mm:ss", { locale: es })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
