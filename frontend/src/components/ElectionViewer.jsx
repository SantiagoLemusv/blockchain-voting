import { format } from "date-fns";
import es from "date-fns/locale/es";
import ElectionStatus from "./ElectionStatus";
import { getWinner, candidatePercent, getElectionState } from "../utils/electionUtils";

export default function ElectionViewer({ elections }) {
  const formatDate = (ts) => {
    if (!ts || isNaN(ts)) return "—";
    try {
      return format(new Date(ts * 1000), "dd MMM yyyy HH:mm", { locale: es });
    } catch {
      return "—";
    }
  };

  if (elections.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🗳️</div>
        <p className="empty-state-title">Sin elecciones aún</p>
        <p className="empty-state-desc">Cuando el admin cree elecciones, los resultados aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Resultados</h2>
        <span className="badge badge-muted">Total: {elections.length}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {elections.map((election) => {
          const state = getElectionState(election);
          const winner = getWinner(election);
          const showBars = election.totalVotes > 0;

          return (
            <div key={election.address} className="card" style={{ padding: 20 }}>
              {/* Header */}
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{election.name}</h3>
                <ElectionStatus election={election} showCountdown={false} />
              </div>

              {/* Meta info */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span className="badge badge-muted">
                  {election.votingType === 0 ? "Selección Única" : `Selección Múltiple ≤${election.maxChoices}`}
                </span>
                <span className="muted" style={{ fontSize: 12, alignSelf: "center" }}>
                  {formatDate(election.startTime)} — {formatDate(election.endTime)}
                </span>
              </div>

              {/* Winner banner */}
              {winner && state === "ended" && (
                <div className="winner-banner" style={{ marginBottom: 10 }}>
                  🏆 Ganador: <strong>{winner.name}</strong> — {winner.votes} votos ({candidatePercent(winner.votes, election.totalVotes)}%)
                </div>
              )}

              {/* Participation summary */}
              <div className="flex-between" style={{ marginBottom: 10 }}>
                <span className="small">Participación: {election.totalVotes} votos emitidos</span>
              </div>

              {/* Candidates with bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {election.options.map((opt, idx) => {
                  const votes = election.votes[idx] || 0;
                  const pct = candidatePercent(votes, election.totalVotes);
                  const isWinner = winner && winner.idx === idx && state === "ended";

                  return (
                    <div key={idx} className={`candidate-row${isWinner ? " candidate-winner" : ""}`}>
                      <div className="flex-between" style={{ marginBottom: showBars ? 5 : 0 }}>
                        <span style={{ fontSize: 14, fontWeight: isWinner ? 700 : 400 }}>
                          {isWinner && "🏆 "}{opt}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                          {votes} votos{showBars ? ` · ${pct}%` : ""}
                        </span>
                      </div>
                      {showBars && (
                        <div className="progress-bar">
                          <div
                            className={`progress-fill${isWinner ? " progress-winner" : ""}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
