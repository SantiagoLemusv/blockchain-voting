/**
 * VoteConfirmModal — UI-04
 *
 * Modal de confirmación que muestra al votante un resumen antes de firmar
 * la transacción en MetaMask. Una vez confirmado y firmado el voto no
 * podrá modificarse (inmutable on-chain).
 */

export default function VoteConfirmModal({ election, selectedSingle, selectedMultiple, onConfirm, onCancel, loading }) {
  if (!election) return null;

  const isSingle = election.votingType === 0;
  const isMultiple = election.votingType === 1;

  const selectedOptionNames = isSingle
    ? [election.options[selectedSingle]]
    : Array.from(selectedMultiple).map((idx) => election.options[idx]);

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 500 }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🗳️</div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Confirma tu voto</h2>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
            Revisa cuidadosamente antes de firmar
          </p>
        </div>

        {/* Detail */}
        <div className="vote-confirm-block">
          <div className="small">Elección</div>
          <strong style={{ fontSize: 15 }}>{election.name}</strong>
          {election.description && (
            <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
              {election.description}
            </p>
          )}
        </div>

        <div className="vote-confirm-block">
          <div className="small">Tipo de votación</div>
          <span className="badge badge-muted" style={{ marginTop: 4 }}>
            {isSingle ? "Selección única" : `Selección múltiple (hasta ${election.maxChoices})`}
          </span>
        </div>

        <div className="vote-confirm-block highlight">
          <div className="small" style={{ color: "var(--accent-vote)" }}>
            {isSingle ? "Tu elección" : `Tus ${selectedOptionNames.length} elecciones`}
          </div>
          <div style={{ marginTop: 6 }}>
            {selectedOptionNames.map((name, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 0",
                  borderBottom: i < selectedOptionNames.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span style={{ color: "var(--accent-vote)", fontWeight: 700 }}>✓</span>
                <strong style={{ fontSize: 14 }}>{name}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="vote-confirm-warning">
          <strong style={{ fontSize: 13 }}>⚠️ Atención</strong>
          <p style={{ margin: "4px 0 0", fontSize: 12, lineHeight: 1.5 }}>
            Esta acción es <strong>irreversible</strong>. Una vez confirmada, tu voto quedará registrado de forma permanente
            y <strong>no podrá modificarse</strong>.
          </p>
        </div>

        {/* Actions */}
        <div className="modal-footer" style={{ gap: 8, justifyContent: "stretch" }}>
          <button
            className="btn"
            style={{ flex: 1, background: "var(--bg)", color: "var(--text)" }}
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Confirmando..." : "Confirmar voto →"}
          </button>
        </div>

        <p className="small" style={{ textAlign: "center", marginTop: 12 }}>
          🔐 Te pediremos una confirmación de seguridad para enviar tu voto.
        </p>
      </div>
    </div>
  );
}
