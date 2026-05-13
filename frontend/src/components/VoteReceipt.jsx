/**
 * VoteReceipt — Comprobante de voto post-firma.
 *
 * Muestra al votante la prueba criptográfica de que su voto se registró.
 * No revela qué opción votó (privacidad), solo confirma la transacción.
 */

import { useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import es from "date-fns/locale/es";
import HashVisual from "./HashVisual";
import { generateShortCode } from "../utils/receiptStorage";
import { getExplorerUrl } from "../utils/web3";

const NETWORK = import.meta.env.VITE_NETWORK || "sepolia";

export default function VoteReceipt({ receipt, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!receipt) return null;

  const code = generateShortCode(receipt.txHash);
  const explorerUrl = receipt.txHash
    ? `https://${NETWORK}.etherscan.io/tx/${receipt.txHash}`
    : null;

  const copyToClipboard = (text, label = "Copiado") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success(`📋 ${label}`);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const downloadJson = () => {
    const data = {
      tipo: "Comprobante de voto",
      eleccion: receipt.electionName,
      direccionContrato: receipt.electionAddress,
      hashTransaccion: receipt.txHash,
      bloque: receipt.blockNumber,
      codigoCorto: code,
      fechaRegistro: receipt.savedAt || new Date().toISOString(),
      privacidad: "Este comprobante NO revela qué opción votaste. Solo confirma que tu voto se registró.",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprobante-voto-${code}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("📥 Comprobante descargado");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 6 }}>✅</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--success)" }}>
            Voto registrado exitosamente
          </h2>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: 13 }}>
            Tu voto quedó grabado de forma inmutable en blockchain
          </p>
        </div>

        {/* Receipt body */}
        <div className="receipt-box">
          {/* Visual + code */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <HashVisual hash={receipt.txHash} size={80} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="small">Código de verificación</div>
              <div className="receipt-code">{code}</div>
              <button
                className="receipt-copy-btn"
                onClick={() => copyToClipboard(code, "Código copiado")}
              >
                {copied ? "✓ Copiado" : "📋 Copiar código"}
              </button>
            </div>
          </div>

          {/* Hash */}
          <div className="receipt-row">
            <span className="receipt-label">Hash de transacción</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <code className="receipt-mono" title={receipt.txHash}>
                {receipt.txHash}
              </code>
              <button
                className="receipt-icon-btn"
                onClick={() => copyToClipboard(receipt.txHash, "Hash copiado")}
                title="Copiar"
              >
                📋
              </button>
            </div>
          </div>

          {/* Block */}
          {receipt.blockNumber && (
            <div className="receipt-row">
              <span className="receipt-label">Bloque</span>
              <code className="receipt-mono">#{receipt.blockNumber}</code>
            </div>
          )}

          {/* Election */}
          <div className="receipt-row">
            <span className="receipt-label">Elección</span>
            <strong style={{ fontSize: 13 }}>{receipt.electionName}</strong>
          </div>

          {/* Contract */}
          <div className="receipt-row">
            <span className="receipt-label">Contrato</span>
            <code className="receipt-mono" title={receipt.electionAddress}>
              {receipt.electionAddress?.slice(0, 16)}…{receipt.electionAddress?.slice(-6)}
            </code>
          </div>

          {/* Date */}
          {receipt.savedAt && (
            <div className="receipt-row">
              <span className="receipt-label">Fecha</span>
              <span style={{ fontSize: 12 }}>
                {format(new Date(receipt.savedAt), "dd MMM yyyy HH:mm:ss", { locale: es })}
              </span>
            </div>
          )}
        </div>

        {/* Privacy notice */}
        <div className="receipt-privacy">
          <strong>🔐 Sobre tu privacidad</strong>
          <p>
            Este comprobante <strong>NO revela qué opción votaste</strong>. Solo certifica que tu transacción fue
            registrada en blockchain. Cualquier persona puede verificar el hash sin acceder al contenido del voto.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <button
            className="btn"
            style={{ flex: 1, background: "var(--bg)", color: "var(--text)" }}
            onClick={downloadJson}
          >
            📥 Descargar comprobante
          </button>
          {explorerUrl && NETWORK !== "localhost" && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ flex: 1, background: "var(--bg)", color: "var(--text)", textDecoration: "none" }}
            >
              🔗 Ver en Etherscan
            </a>
          )}
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
