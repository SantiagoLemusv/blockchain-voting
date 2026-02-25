import { useState } from "react";

export default function CastVote({ elections, onVote, loadingVote }) {
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleElectionChange = (id) => {
    setSelectedElection(id);
    setSelectedOption(null);
  };

  const current = elections.find((e) => e.id === selectedElection);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Emitir Voto</h2>
      <p className="text-gray-600 mb-4">
        Selecciona una elección activa y una opción.
      </p>
      <select
        className="w-full border rounded p-2 mb-4"
        value={selectedElection || ""}
        onChange={(e) => handleElectionChange(Number(e.target.value))}
      >
        <option value="">Seleccionar elección...</option>
        {elections
          .filter((e) => e.isActive)
          .map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} (ID {e.id})
            </option>
          ))}
      </select>

      {current && (
        <div className="space-y-2 mb-4">
          {current.options.map((opt, idx) => (
            <label key={idx} className="flex items-center space-x-2">
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
        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-gray-300"
        disabled={!current || selectedOption === null || loadingVote}
        onClick={() => onVote(current.id, selectedOption)}
      >
        {loadingVote ? "Enviando..." : "Emitir Voto"}
      </button>
    </div>
  );
}
