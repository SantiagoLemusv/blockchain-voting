import { useState, useEffect } from "react";
import { getElectionState, timeRemaining } from "../utils/electionUtils";

const STATE_CONFIG = {
  upcoming: { className: "badge badge-warn", label: "Próxima" },
  active: { className: "badge badge-success", label: "Activa" },
  ended: { className: "badge badge-muted", label: "Finalizada" },
};

export default function ElectionStatus({ election, showCountdown = true }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!showCountdown) return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [showCountdown]);

  const state = getElectionState(election);
  const { className, label } = STATE_CONFIG[state];

  const getCountdown = () => {
    if (state === "active") {
      const rem = timeRemaining(election.endTime);
      return rem ? `Cierra en ${rem}` : "Cerrando...";
    }
    if (state === "upcoming") {
      const rem = timeRemaining(election.startTime);
      return rem ? `Inicia en ${rem}` : "Iniciando...";
    }
    return null;
  };

  const countdown = showCountdown ? getCountdown() : null;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className={className}>{label}</span>
      {countdown && (
        <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
          {countdown}
        </span>
      )}
    </span>
  );
}
