import { useState, useEffect } from "react";

export default function ChatBotButton({ isOpen, onToggle }) {
  const [showHint, setShowHint] = useState(false);

  // Mostrar hint a los 3 segundos si nunca se ha abierto el bot
  useEffect(() => {
    const wasOpened = localStorage.getItem("chatbot-opened");
    if (!wasOpened && !isOpen) {
      const timer = setTimeout(() => setShowHint(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClick = () => {
    localStorage.setItem("chatbot-opened", "true");
    setShowHint(false);
    onToggle();
  };

  return (
    <>
      {showHint && !isOpen && (
        <div className="chatbot-hint" onClick={handleClick}>
          <strong>¿Tienes dudas?</strong>
          <p>Pregúntale al asistente sobre la votación, la privacidad o cómo funciona la plataforma.</p>
          <button className="chatbot-hint-close" onClick={(e) => { e.stopPropagation(); setShowHint(false); }}>
            ✕
          </button>
        </div>
      )}
      <button
        className={`chatbot-fab${isOpen ? " open" : ""}`}
        onClick={handleClick}
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente virtual"}
        title={isOpen ? "Cerrar asistente" : "Asistente virtual"}
      >
        {isOpen ? (
          <span style={{ fontSize: 20 }}>✕</span>
        ) : (
          <>
            <span style={{ fontSize: 24 }}>💬</span>
            <span className="chatbot-fab-pulse" />
          </>
        )}
      </button>
    </>
  );
}
