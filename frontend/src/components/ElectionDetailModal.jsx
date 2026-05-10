import { format } from "date-fns";
import es from "date-fns/locale/es";
import ElectionStatus from "./ElectionStatus";
import { getWinner, candidatePercent, getElectionState } from "../utils/electionUtils";

export default function ElectionDetailModal({ election, onClose }) {
  if (!election) return null;

  const formatDate = (ts) => format(new Date(ts * 1000), "dd MMM yyyy HH:mm", { locale: es });
  const state = getElectionState(election);
  const winner = getWinner(election);
  const showResults = election.totalVotes > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{election.name}</h2>
            {election.description && (
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>{election.description}</p>
            )}
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <ElectionStatus election={election} showCountdown={true} />
          <span className="badge badge-muted">
            {election.votingType === 0 ? "Selección Única" : `Selección Múltiple ≤${election.maxChoices}`}
          </span>
          <span className="badge badge-muted" style={{ fontFamily: "monospace", fontSize: 11 }}>
            {election.address.slice(0, 10)}…
          </span>
        </div>

        {/* Dates + totals */}
        <div className="detail-dates">
          <div className="detail-date-item">
            <span className="small">Inicio</span>
            <strong style={{ fontSize: 13 }}>{formatDate(election.startTime)}</strong>
          </div>
          <div className="detail-date-divider">→</div>
          <div className="detail-date-item">
            <span className="small">Cierre</span>
            <strong style={{ fontSize: 13 }}>{formatDate(election.endTime)}</strong>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <span className="small">Votos totales</span>
            <strong style={{ fontSize: 24, display: "block", color: "var(--primary)", lineHeight: 1 }}>
              {election.totalVotes}
            </strong>
          </div>
        </div>

        {/* Candidates / Results */}
        <div className="section-divider" style={{ marginTop: 16 }}>
          {showResults ? "Resultados" : "Candidatos"}
        </div>

        {winner && state === "ended" && (
          <div className="winner-banner">
            🏆 Ganador: <strong>{winner.name}</strong> — {winner.votes} votos ({candidatePercent(winner.votes, election.totalVotes)}%)
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {election.options.map((opt, idx) => {
            const votes = election.votes[idx] || 0;
            const pct = candidatePercent(votes, election.totalVotes);
            const isWinner = winner && winner.idx === idx && state === "ended";
            return (
              <div key={idx} className={`candidate-row${isWinner ? " candidate-winner" : ""}`}>
                <div className="flex-between" style={{ marginBottom: showResults ? 6 : 0 }}>
                  <span style={{ fontWeight: isWinner ? 700 : 400, fontSize: 14 }}>
                    {isWinner && "🏆 "}{opt}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                    {votes} votos{showResults ? ` · ${pct}%` : ""}
                  </span>
                </div>
                {showResults && (
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

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
