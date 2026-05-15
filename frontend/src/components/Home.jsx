import { useState, useEffect } from "react";
import { getElectionState } from "../utils/electionUtils";
import { getExplorerUrl } from "../utils/web3";
import { getReceipts } from "../utils/receiptStorage";
import HashVisual from "./HashVisual";
import VoteReceipt from "./VoteReceipt";

const REGISTRY_ADDRESS = import.meta.env.VITE_CONTRACT_REGISTRY_ADDRESS;
const FACTORY_ADDRESS = import.meta.env.VITE_CONTRACT_FACTORY_ADDRESS;
const NETWORK = import.meta.env.VITE_NETWORK || "sepolia";

export default function Home({ account, isAdmin, elections, totalVoters, onNavigate }) {
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    setReceipts(getReceipts(account));
  }, [account]);
  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const active = elections.filter((e) => getElectionState(e) === "active").length;
  const upcoming = elections.filter((e) => getElectionState(e) === "upcoming").length;
  const ended = elections.filter((e) => getElectionState(e) === "ended").length;

  const [copied, setCopied] = useState(false);
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Hero section */}
      <div style={{ textAlign: "center", paddingBottom: 32, marginBottom: 32 }}>
        <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", letterSpacing: "0.5px" }}>
          TU BILLETERA
        </p>
        <div
          onClick={handleCopyAddress}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "var(--bg-accent)",
            borderRadius: 12,
            border: "1px solid var(--primary)",
            cursor: "pointer",
            transition: "all 0.2s",
            marginBottom: 20,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.15)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: 18 }}>👛</span>
          <code style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--primary)" }}>
            {formatAddress(account)}
          </code>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {copied ? "✓ Copiado" : "Copiar"}
          </span>
        </div>
        <h1 className="landing-title" style={{ marginBottom: 12, marginTop: 0 }}>
          Plataforma de votación descentralizada
        </h1>
        <p className="landing-desc" style={{ margin: 0, textAlign: "center" }}>
          Ya estás conectado y listo para participar de forma segura e inmutable.
        </p>
      </div>

      {/* Status card */}
      <div
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
          padding: "16px",
        }}
      >
        <div>
          <span className="small">Estado de conexión</span>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <div className="wallet-dot" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Conectado</span>
          </div>
          {isAdmin && (
            <span className="badge badge-success" style={{ marginTop: 6, display: "inline-block" }}>
              Administrador
            </span>
          )}
        </div>
        <div>
          <span className="small">Red</span>
          <div style={{ marginTop: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>localhost · 2 votantes</span>
          </div>
        </div>
      </div>

      {/* System summary */}
      <div className="section-divider">Resumen del sistema</div>
      <div
        className="stat-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", marginBottom: 24 }}
      >
        <div className="stat-card">
          <div className="stat-number">{elections.length}</div>
          <div className="stat-label">Elecciones</div>
        </div>
        <div className="stat-card">
          <div className="stat-number green">{active}</div>
          <div className="stat-label">Activas ahora</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#f59e0b" }}>{upcoming}</div>
          <div className="stat-label">Próximas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number muted">{ended}</div>
          <div className="stat-label">Finalizadas</div>
        </div>
      </div>

      {/* Quick navigation */}
      <div className="section-divider">Navegar</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        <button
          onClick={() => onNavigate("vote")}
          className="card"
          style={{
            cursor: "pointer",
            padding: 24,
            textAlign: "center",
            border: "2px solid transparent",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🗳️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Votar</div>
          <div className="small">Emite tu voto en las elecciones activas</div>
        </button>

        <button
          onClick={() => onNavigate("results")}
          className="card"
          style={{
            cursor: "pointer",
            padding: 24,
            textAlign: "center",
            border: "2px solid transparent",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Resultados</div>
          <div className="small">Consulta los resultados en tiempo real</div>
        </button>

        {isAdmin && (
          <button
            onClick={() => onNavigate("admin")}
            className="card"
            style={{
              cursor: "pointer",
              padding: 24,
              textAlign: "center",
              border: "2px solid transparent",
              transition: "all 0.15s",
              background: "#ede9fe",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚙️</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Panel Admin</div>
            <div className="small">Gestiona votantes y elecciones</div>
          </button>
        )}
      </div>

      {/* Comprobantes recientes del votante */}
      {receipts.length > 0 && (
        <>
          <div className="section-divider">Mis comprobantes de voto ({receipts.length})</div>
          <p className="small" style={{ marginTop: -8, marginBottom: 10 }}>
            🔐 Solo tú puedes ver tus comprobantes — almacenados localmente en tu navegador.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {receipts.slice(0, 5).map((r, i) => (
              <button
                key={`${r.txHash}-${i}`}
                className="receipt-row-card"
                onClick={() => setSelectedReceipt(r)}
              >
                <HashVisual hash={r.txHash} size={48} />
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <strong style={{ fontSize: 13 }}>{r.electionName}</strong>
                  <div className="small" style={{ marginTop: 2, fontFamily: "monospace" }}>
                    {r.txHash.slice(0, 16)}…
                  </div>
                  {r.blockNumber && (
                    <div className="small" style={{ fontSize: 10 }}>
                      Bloque #{r.blockNumber}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: "var(--accent-vote)", fontWeight: 600 }}>
                  Ver →
                </span>
              </button>
            ))}
          </div>
          {receipts.length > 5 && (
            <p className="small" style={{ marginTop: 8, textAlign: "center" }}>
              Tienes {receipts.length - 5} comprobantes más guardados.
            </p>
          )}
        </>
      )}

      {/* Info section */}
      <div style={{ marginTop: 32, padding: 20, background: "#f0f9ff", borderRadius: 12 }}>
        <strong style={{ color: "#0369a1" }}>💡 ¿Qué es esto?</strong>
        <p style={{ margin: "8px 0 0", color: "#0c4a6e", fontSize: 13, lineHeight: 1.6 }}>
          Plataforma de votación descentralizada basada en Ethereum. Cada voto queda registrado de
          forma inmutable en la blockchain. Segura, transparente y auditable en todo momento.
        </p>
      </div>

      {/* Blockchain transparency */}
      <div className="section-divider" style={{ marginTop: 24 }}>Contratos desplegados (transparencia)</div>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div style={{ padding: 12, background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>
            VoterRegistry
          </div>
          {REGISTRY_ADDRESS &&
            (getExplorerUrl(REGISTRY_ADDRESS, NETWORK) ? (
              <a
                href={getExplorerUrl(REGISTRY_ADDRESS, NETWORK)}
                target="_blank"
                rel="noopener noreferrer"
                className="contract-pill"
                style={{ wordBreak: "break-all" }}
              >
                <span className="contract-pill-icon">🔗</span>
                {REGISTRY_ADDRESS.slice(0, 16)}…
                <span style={{ marginLeft: 4 }}>↗</span>
              </a>
            ) : (
              <span className="contract-pill" style={{ wordBreak: "break-all" }}>
                <span className="contract-pill-icon">🔗</span>
                {REGISTRY_ADDRESS}
              </span>
            ))}
        </div>
        <div style={{ padding: 12, background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>
            ElectionFactory
          </div>
          {FACTORY_ADDRESS &&
            (getExplorerUrl(FACTORY_ADDRESS, NETWORK) ? (
              <a
                href={getExplorerUrl(FACTORY_ADDRESS, NETWORK)}
                target="_blank"
                rel="noopener noreferrer"
                className="contract-pill"
                style={{ wordBreak: "break-all" }}
              >
                <span className="contract-pill-icon">🔗</span>
                {FACTORY_ADDRESS.slice(0, 16)}…
                <span style={{ marginLeft: 4 }}>↗</span>
              </a>
            ) : (
              <span className="contract-pill" style={{ wordBreak: "break-all" }}>
                <span className="contract-pill-icon">🔗</span>
                {FACTORY_ADDRESS}
              </span>
            ))}
        </div>
      </div>
      <p className="small" style={{ marginTop: 6 }}>
        Estos son los smart contracts que sustentan toda la plataforma. Auditables desde cualquier explorador blockchain.
      </p>

      {selectedReceipt && (
        <VoteReceipt receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
}
