import { getElectionState } from "../../utils/electionUtils";

export default function DashboardChart({ elections }) {
  const active = elections.filter((e) => getElectionState(e) === "active").length;
  const upcoming = elections.filter((e) => getElectionState(e) === "upcoming").length;
  const ended = elections.filter((e) => getElectionState(e) === "ended").length;
  const total = elections.length;

  const segments = [
    { label: "Activas", count: active, color: "var(--success, #16a34a)" },
    { label: "Próximas", count: upcoming, color: "#f59e0b" },
    { label: "Finalizadas", count: ended, color: "var(--muted, #6b7280)" },
  ];

  const topElections = [...elections]
    .filter((e) => e.totalVotes > 0)
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 5);

  const maxVotes = topElections.length > 0 ? Math.max(...topElections.map((e) => e.totalVotes)) : 0;

  if (total === 0) {
    return null;
  }

  return (
    <div className="card" style={{ padding: 20, marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>
        📊 Distribución de elecciones
      </h3>

      {/* Stacked bar with proportions */}
      <div
        style={{
          display: "flex",
          height: 28,
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 12,
          background: "var(--bg)",
        }}
      >
        {segments.map((s) => {
          const pct = total > 0 ? (s.count / total) * 100 : 0;
          if (s.count === 0) return null;
          return (
            <div
              key={s.label}
              style={{
                width: `${pct}%`,
                background: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                transition: "width 0.4s ease",
              }}
              title={`${s.label}: ${s.count} (${pct.toFixed(1)}%)`}
            >
              {pct >= 10 ? `${s.count}` : ""}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: s.color,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 12, color: "var(--text)" }}>
              {s.label}: <strong>{s.count}</strong>
            </span>
          </div>
        ))}
      </div>

      {/* Top elections by votes */}
      {topElections.length > 0 && (
        <>
          <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
            Top {topElections.length} elecciones por participación
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topElections.map((e) => {
              const pct = maxVotes > 0 ? (e.totalVotes / maxVotes) * 100 : 0;
              return (
                <div key={e.address}>
                  <div className="flex-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{e.name}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                      {e.totalVotes} voto{e.totalVotes !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, transition: "width 0.4s ease" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {topElections.length === 0 && (
        <p className="small" style={{ margin: 0, color: "var(--muted)" }}>
          Aún no hay votos emitidos. Cuando los votantes participen, verás aquí la distribución por elección.
        </p>
      )}
    </div>
  );
}
