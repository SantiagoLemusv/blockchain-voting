import { useState, useEffect } from "react";
import { format } from "date-fns";
import es from "date-fns/locale/es";
import HashVisual from "./HashVisual";
import { fetchAuditLog, EVENT_LABELS } from "../utils/auditEvents";
import { getExplorerUrl } from "../utils/web3";

const REGISTRY_ADDRESS = import.meta.env.VITE_CONTRACT_REGISTRY_ADDRESS;
const FACTORY_ADDRESS = import.meta.env.VITE_CONTRACT_FACTORY_ADDRESS;
const NETWORK = import.meta.env.VITE_NETWORK || "sepolia";

function truncate(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatTs(ts) {
  if (!ts) return "—";
  return format(new Date(ts * 1000), "dd MMM yyyy HH:mm:ss", { locale: es });
}

export default function AuditPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const log = await fetchAuditLog(REGISTRY_ADDRESS, FACTORY_ADDRESS);
      setEvents(log);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filterType === "all" ? events : events.filter((e) => e.type === filterType);

  const countByType = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 6 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Bitácora pública verificable</h2>
        <button className="btn" style={{ background: "var(--bg)", color: "var(--text)" }} onClick={load} disabled={loading}>
          {loading ? "Cargando..." : "↻ Recargar"}
        </button>
      </div>
      <p className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
        Registro inmutable de eventos blockchain. Cada operación tiene su huella criptográfica y puede verificarse públicamente.
        <br />
        <strong>🔐 Privacidad:</strong> No se expone qué opción votó cada persona, solo que la transacción ocurrió.
      </p>

      {/* Filtros */}
      <div className="audit-filters">
        <button
          className={`audit-filter${filterType === "all" ? " active" : ""}`}
          onClick={() => setFilterType("all")}
        >
          Todos ({events.length})
        </button>
        {Object.entries(EVENT_LABELS).map(([key, meta]) => {
          if (!countByType[key]) return null;
          return (
            <button
              key={key}
              className={`audit-filter${filterType === key ? " active" : ""}`}
              onClick={() => setFilterType(key)}
            >
              {meta.icon} {meta.label} ({countByType[key]})
            </button>
          );
        })}
      </div>

      {loading && events.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <p className="empty-state-title">Leyendo eventos de blockchain...</p>
          <p className="empty-state-desc">Esto puede tardar unos segundos.</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-title">Sin eventos registrados</p>
          <p className="empty-state-desc">
            No hay actividad blockchain reciente que mostrar con este filtro.
          </p>
        </div>
      )}

      <div className="audit-log">
        {filtered.map((ev, idx) => {
          const meta = EVENT_LABELS[ev.type] || { icon: "📋", label: ev.type, color: "var(--muted)" };
          const explorerUrl = getExplorerUrl(ev.txHash?.replace(/^0x/, ""), NETWORK);

          return (
            <div key={`${ev.txHash}-${idx}`} className="audit-item">
              {/* Huella visual del hash */}
              <HashVisual hash={ev.txHash} size={56} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 16 }}>{meta.icon}</span>
                  <strong style={{ fontSize: 14, color: meta.color }}>{meta.label}</strong>
                  {ev.payload?.electionName && (
                    <span className="badge badge-muted" style={{ fontSize: 11 }}>
                      {ev.payload.electionName}
                    </span>
                  )}
                  {ev.payload?.choicesCount && (
                    <span className="small">({ev.payload.choicesCount} opciones)</span>
                  )}
                </div>

                <div className="audit-item-row">
                  <span className="audit-key">Hash:</span>
                  <span className="audit-value mono" title={ev.txHash}>
                    {truncate(ev.txHash)}
                  </span>
                  {NETWORK !== "localhost" && (
                    <a
                      href={`https://${NETWORK}.etherscan.io/tx/${ev.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="audit-link"
                    >
                      Ver en Etherscan ↗
                    </a>
                  )}
                </div>

                <div className="audit-item-row">
                  <span className="audit-key">Bloque:</span>
                  <span className="audit-value mono">#{ev.blockNumber}</span>
                  <span className="audit-key">Fecha:</span>
                  <span className="audit-value">{formatTs(ev.timestamp)}</span>
                </div>

                <div className="audit-item-row">
                  <span className="audit-key">Contrato:</span>
                  <span className="audit-value mono" title={ev.contractAddress}>
                    {truncate(ev.contractAddress)}
                  </span>
                  {ev.payload?.voter && (
                    <>
                      <span className="audit-key">Origen:</span>
                      <span className="audit-value mono" title={ev.payload.voter}>
                        {truncate(ev.payload.voter)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {events.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, background: "#f0f9ff", borderRadius: 8, fontSize: 12, color: "#0c4a6e" }}>
          💡 <strong>¿Cómo leer esta bitácora?</strong> Cada fila es una transacción verificable. El hash es la huella
          criptográfica única. El bloque es el "número de página" donde se registró. La huella visual a la izquierda permite
          reconocer rápidamente eventos similares — mismo hash = misma figura.
        </div>
      )}
    </div>
  );
}
