import { useState } from "react";

export default function CastVote({ elections, onVote, loadingVote }) {
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleElectionChange = (addr) => {
    setSelectedElection(addr);
    setSelectedOption(null);
  };

  const current = elections.find((e) => e.address === selectedElection);

  return (
    <div>
      <div className="flex-between">
        <h2 className="section-title">Emitir voto</h2>
        <span className="badge badge-muted">Activas: {elections.filter((e) => e.isActive).length}</span>
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>
        Selecciona una elección activa y tu opción preferida.
      </p>
      <select
        className="select"
        value={selectedElection || ""}
        onChange={(e) => handleElectionChange(e.target.value)}
      >
        <option value="">Seleccionar elección...</option>
        {elections
          .filter((e) => e.isActive)
          .map((e) => (
            <option key={e.address} value={e.address}>
              {e.name} ({e.address.slice(0, 6)}…)
            </option>
          ))}
      </select>

      {current && (
        <div className="space-y-6" style={{ marginTop: 12, marginBottom: 12 }}>
          {current.options.map((opt, idx) => (
            <label key={idx} className="pill">
              <input
                type="radio"
                name="option"
                value={idx}
                checked={selectedOption === idx}
                onChange={() => setSelectedOption(idx)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: "100%" }}
        disabled={!current || selectedOption === null || loadingVote}
        onClick={() => onVote(current.address, selectedOption)}
      >
        {loadingVote ? "Enviando..." : "Emitir Voto"}
      </button>
    </div>
  );
}
