import { useState } from "react";
import ElectionStatus from "./ElectionStatus";
import { getElectionState } from "../utils/electionUtils";

export default function CastVote({ elections, account, onVote, onVoteMultiple, loadingVote }) {
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
  const currentState = current ? getElectionState(current) : null;
  const isAdminOfElection = current && account && current.admin === account.toLowerCase();
  const hasAlreadyVoted = current?.hasVoted === true;
  const canVote = currentState === "active" && !isAdminOfElection && !hasAlreadyVoted;

  const handleCheckboxChange = (idx) => {
    if (!canVote) return;
    const newSet = new Set(selectedOptions);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else if (newSet.size < current.maxChoices) {
      newSet.add(idx);
    }
    setSelectedOptions(newSet);
  };

  const handleVoteClick = () => {
    if (!canVote) return;
    if (isSingle) onVote(current.address, selectedOption);
    else if (isMultiple) onVoteMultiple(current.address, Array.from(selectedOptions));
  };

  const isSubmitDisabled =
    !current ||
    !canVote ||
    (isSingle && selectedOption === null) ||
    (isMultiple && selectedOptions.size === 0) ||
    loadingVote;

  if (elections.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <p className="empty-state-title">No hay elecciones disponibles</p>
        <p className="empty-state-desc">El administrador aún no ha creado ninguna elección.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 4 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Emitir voto</h2>
        <span className="badge badge-success">
          Activas: {elections.filter((e) => getElectionState(e) === "active").length}
        </span>
      </div>
      <p className="muted" style={{ marginBottom: 14 }}>
        Selecciona una elección y emite tu voto de forma segura e inmutable.
      </p>

      {/* Election selector */}
      <select
        className="select"
        value={selectedElection || ""}
        onChange={(e) => handleElectionChange(e.target.value || null)}
        style={{ marginBottom: 12 }}
      >
        <option value="">Seleccionar elección...</option>
        {elections.map((e) => {
          const s = getElectionState(e);
          const labels = { upcoming: "Próxima", active: "Activa", ended: "Finalizada" };
          return (
            <option key={e.address} value={e.address}>
              [{labels[s]}] {e.name}
            </option>
          );
        })}
      </select>

      {/* Selected election info */}
      {current && (
        <div>
          <div
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{current.name}</div>
              <div className="small">
                {isSingle ? "Selección única" : `Selección múltiple — hasta ${current.maxChoices} opciones`}
              </div>
            </div>
            <ElectionStatus election={current} showCountdown={true} />
          </div>

          {/* Admin restriction banner */}
          {isAdminOfElection && (
            <div
              style={{
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 14,
                color: "#4338ca",
                marginBottom: 12,
              }}
            >
              <strong>🛡️ Restricción del sistema</strong>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#4f46e5" }}>
                Los administradores no pueden votar en elecciones que ellos mismos crearon.
                Esto garantiza la imparcialidad del proceso democrático.
              </p>
            </div>
          )}

          {/* Already voted banner */}
          {hasAlreadyVoted && !isAdminOfElection && (
            <div
              style={{
                background: "#ecfdf3",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 14,
                color: "#166534",
                marginBottom: 12,
              }}
            >
              <strong>✅ Ya emitiste tu voto</strong>
              <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                Tu voto ya fue registrado en blockchain. Solo puedes votar una vez por elección.
                Consulta los resultados en la pestaña <strong>Resultados</strong>.
              </p>
            </div>
          )}

          {/* Voting UI or blocked state */}
          {currentState === "upcoming" && (
            <div
              style={{
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 14,
                color: "#c2410c",
                marginBottom: 12,
              }}
            >
              ⏳ Esta elección aún no ha comenzado. Podrás votar cuando se active.
            </div>
          )}

          {currentState === "ended" && (
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 14,
                color: "var(--muted)",
                marginBottom: 12,
              }}
            >
              🔒 Esta elección ha finalizado. Puedes ver los resultados en la pestaña <strong>Resultados</strong>.
            </div>
          )}

          {canVote && (
            <div>
              <p className="small" style={{ marginBottom: 8 }}>
                {isSingle
                  ? "Selecciona una opción para votar:"
                  : `Puedes seleccionar hasta ${current.maxChoices} opciones (${selectedOptions.size}/${current.maxChoices} seleccionadas):`}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {current.options.map((opt, idx) => {
                  const isChecked = isSingle ? selectedOption === idx : selectedOptions.has(idx);
                  const isDisabled = isMultiple && !selectedOptions.has(idx) && selectedOptions.size >= current.maxChoices;
                  return (
                    <label
                      key={idx}
                      className={`candidate-row`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.5 : 1,
                        userSelect: "none",
                        background: isChecked ? "#ede9fe" : "var(--bg)",
                        border: isChecked ? "1px solid #c4b5fd" : "1px solid transparent",
                      }}
                    >
                      {isSingle ? (
                        <input
                          type="radio"
                          name="single-option"
                          value={idx}
                          checked={isChecked}
                          onChange={() => setSelectedOption(idx)}
                          style={{ accentColor: "var(--primary)" }}
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(idx)}
                          disabled={isDisabled}
                          style={{ accentColor: "var(--primary)" }}
                        />
                      )}
                      <span style={{ fontSize: 14 }}>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: "100%", marginTop: 14 }}
        disabled={isSubmitDisabled}
        onClick={handleVoteClick}
      >
        {loadingVote ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="loader-spin" />
            Enviando a blockchain...
          </span>
        ) : (
          "Emitir Voto"
        )}
      </button>
    </div>
  );
}
