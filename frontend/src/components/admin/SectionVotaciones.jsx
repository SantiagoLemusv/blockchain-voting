import { format } from "date-fns";
import es from "date-fns/locale/es";
import CreateElection from "../CreateElection";
import ElectionStatus from "../ElectionStatus";

export default function SectionVotaciones({ elections, onCreate, onSelectElection }) {
  const formatDate = (ts) => format(new Date(ts * 1000), "dd MMM HH:mm", { locale: es });

  return (
    <div>
      <h2 className="section-title">🗳️ Gestión de votaciones</h2>
      <p className="muted" style={{ marginBottom: 20, fontSize: 13 }}>
        Crea nuevas elecciones y administra las existentes. Cada elección queda registrada como un contrato blockchain
        independiente.
      </p>

      {/* Formulario crear */}
      <div className="card" style={{ marginBottom: 24 }}>
        <CreateElection isAdmin={true} onCreate={onCreate} />
      </div>

      {/* Lista existentes */}
      <div className="section-divider">Elecciones existentes ({elections.length})</div>
      {elections.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗳️</div>
          <p className="empty-state-title">Sin elecciones aún</p>
          <p className="empty-state-desc">Usa el formulario de arriba para crear la primera.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {elections.map((e) => (
            <div
              key={e.address}
              className="card election-card-clickable"
              style={{
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
              onClick={() => onSelectElection?.(e)}
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
                  {formatDate(e.startTime)} — {formatDate(e.endTime)} · {e.options.length} opciones · {e.totalVotes} votos
                </p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  fontFamily: "monospace",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
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
