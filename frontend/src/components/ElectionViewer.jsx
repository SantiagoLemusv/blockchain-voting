import { format } from "date-fns";
import es from "date-fns/locale/es";

export default function ElectionViewer({ elections }) {
  const formatDate = (ts) =>
    format(new Date(ts * 1000), "dd MMM yyyy HH:mm", { locale: es });

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <h2 className="section-title">Elecciones</h2>
        <span className="badge badge-muted">Total: {elections.length}</span>
      </div>
      {elections.length === 0 && <p className="muted">Aún no hay elecciones creadas.</p>}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {elections.map((election) => (
          <div key={election.address} className="election-item">
            <div className="flex-between">
              <h3 className="election-title">{election.name}</h3>
              <span className={election.isActive ? "badge badge-success" : "badge badge-muted"}>
                {election.isActive ? "Activa" : "Finalizada"}
              </span>
            </div>
            <p className="muted" style={{ margin: "4px 0", fontSize: 12 }}>
              {election.votingType === 0 ? "Selección Única" : `Selección Múltiple (hasta ${election.maxChoices})`}
            </p>
            <p className="muted" style={{ margin: "4px 0" }}>
              {formatDate(election.startTime)} — {formatDate(election.endTime)}
            </p>
            <p className="muted" style={{ margin: "4px 0" }}>Total de votos: {election.totalVotes}</p>
            <div style={{ marginTop: 8 }}>
              {election.options.map((opt, idx) => (
                <div key={idx} className="flex-between" style={{ fontSize: 14 }}>
                  <span>{opt}</span>
                  <strong>{election.votes[idx] || 0}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
