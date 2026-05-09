import { useState } from "react";

export default function CastVote({ elections, onVote, onVoteMultiple, loadingVote }) {
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState(new Set());

  const handleElectionChange = (addr) => {
    setSelectedElection(addr);
    setSelectedOption(null);
    setSelectedOptions(new Set());
  };

  const current = elections.find((e) => e.address === selectedElection);
  const isSingle = current?.votingType === 0;
  const isMultiple = current?.votingType === 1;

  const handleCheckboxChange = (idx) => {
    const newSet = new Set(selectedOptions);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      if (newSet.size < current.maxChoices) {
        newSet.add(idx);
      }
    }
    setSelectedOptions(newSet);
  };

  const handleVoteClick = () => {
    if (isSingle) {
      onVote(current.address, selectedOption);
    } else if (isMultiple) {
      onVoteMultiple(current.address, Array.from(selectedOptions));
    }
  };

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
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <p className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
            {isSingle ? "Selecciona una opción" : `Puedes seleccionar hasta ${current.maxChoices} opciones`}
          </p>
          <div className="space-y-6">
            {current.options.map((opt, idx) => (
              <label key={idx} className="pill">
                {isSingle ? (
                  <input
                    type="radio"
                    name="option"
                    value={idx}
                    checked={selectedOption === idx}
                    onChange={() => setSelectedOption(idx)}
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={selectedOptions.has(idx)}
                    onChange={() => handleCheckboxChange(idx)}
                    disabled={!selectedOptions.has(idx) && selectedOptions.size >= current.maxChoices}
                  />
                )}
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {isMultiple && selectedOptions.size > 0 && (
            <p className="muted" style={{ fontSize: 12, marginTop: 8, color: "#10b981" }}>
              Seleccionadas: {selectedOptions.size}/{current.maxChoices}
            </p>
          )}
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: "100%" }}
        disabled={
          !current ||
          (isSingle && selectedOption === null) ||
          (isMultiple && selectedOptions.size === 0) ||
          loadingVote
        }
        onClick={handleVoteClick}
      >
        {loadingVote ? "Enviando..." : "Emitir Voto"}
      </button>
    </div>
  );
}
