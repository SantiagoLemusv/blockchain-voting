import { useState, useEffect, useRef, useMemo } from "react";
import { chatbotKnowledge } from "../data/chatbotKnowledge";
import { mergeKnowledgeWithCustom } from "../utils/chatbotStorage";

/**
 * Renderizado simple de texto con formato.
 * Convierte **bold**, código en bloque ```code```, y conserva saltos de línea.
 */
function FormattedText({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${idx}`} className="chat-code">
            {codeBuffer.join("\n")}
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (line.trim() === "") {
      elements.push(<div key={`br-${idx}`} style={{ height: 6 }} />);
      return;
    }

    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formatted = parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    elements.push(
      <p key={`p-${idx}`} className="chat-line">
        {formatted}
      </p>
    );
  });

  return <div className="chat-formatted">{elements}</div>;
}

export default function ChatBot({ isOpen, onClose, currentSection }) {
  const [view, setView] = useState("welcome"); // welcome | category | answer
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Merge knowledge base con preguntas personalizadas del admin
  const knowledge = useMemo(() => mergeKnowledgeWithCustom(chatbotKnowledge), [isOpen]);

  // Auto-scroll al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isTyping]);

  // Mensaje de bienvenida al abrir por primera vez
  useEffect(() => {
    if (isOpen && conversation.length === 0) {
      setConversation([
        {
          type: "bot",
          content: knowledge.welcome.message,
          isWelcome: true,
        },
      ]);
    }
  }, [isOpen]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setView("category");
    setConversation((prev) => [
      ...prev,
      { type: "user", content: cat.title },
      { type: "bot", content: `Aquí hay preguntas frecuentes sobre **${cat.title}**. Selecciona una:`, options: cat.questions },
    ]);
  };

  const handleQuestionClick = (question) => {
    setActiveQuestion(question);
    setView("answer");
    setConversation((prev) => [
      ...prev,
      { type: "user", content: question.q },
    ]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setConversation((prev) => [
        ...prev,
        { type: "bot", content: question.a, isFullAnswer: true },
      ]);
    }, 700);
  };

  const handleBackToCategories = () => {
    setView("welcome");
    setActiveCategory(null);
    setActiveQuestion(null);
    setConversation((prev) => [
      ...prev,
      { type: "user", content: "Ver todas las categorías" },
      { type: "bot", content: "¿Sobre qué te gustaría saber?", showCategories: true },
    ]);
  };

  const handleAnotherQuestion = () => {
    if (activeCategory) {
      setView("category");
      setActiveQuestion(null);
      setConversation((prev) => [
        ...prev,
        {
          type: "bot",
          content: `Otras preguntas sobre **${activeCategory.title}**:`,
          options: activeCategory.questions.filter((q) => q.id !== activeQuestion?.id),
        },
      ]);
    }
  };

  const handleReset = () => {
    setConversation([
      {
        type: "bot",
        content: knowledge.welcome.message,
        isWelcome: true,
      },
    ]);
    setView("welcome");
    setActiveCategory(null);
    setActiveQuestion(null);
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-panel" role="dialog" aria-label="Asistente virtual">
      {/* Header */}
      <div className="chatbot-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="chatbot-avatar">
            <span style={{ fontSize: 18 }}>🤖</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Asistente Virtual</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4 }}>
              <span className="chatbot-status-dot" /> En línea · Respuestas verificadas
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className="chatbot-icon-btn"
            onClick={handleReset}
            title="Reiniciar conversación"
            aria-label="Reiniciar"
          >
            ↻
          </button>
          <button
            className="chatbot-icon-btn"
            onClick={onClose}
            title="Cerrar"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="chatbot-messages">
        {/* Welcome banner */}
        {conversation.length === 1 && conversation[0].isWelcome && (
          <div className="chatbot-welcome">
            <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>
              {knowledge.welcome.title}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              {knowledge.welcome.message}
            </p>
          </div>
        )}

        {/* Conversation messages */}
        {conversation.map((msg, idx) => {
          if (msg.isWelcome) return null; // Welcome ya se muestra arriba

          return (
            <div
              key={idx}
              className={`chat-msg chat-msg-${msg.type}`}
            >
              {msg.type === "bot" && (
                <div className="chat-msg-avatar">🤖</div>
              )}
              <div className={`chat-msg-bubble chat-msg-bubble-${msg.type}`}>
                {msg.isFullAnswer ? (
                  <FormattedText text={msg.content} />
                ) : (
                  <FormattedText text={msg.content} />
                )}

                {msg.options && (
                  <div className="chat-options">
                    {msg.options.map((q) => (
                      <button
                        key={q.id}
                        className="chat-option-btn"
                        onClick={() => handleQuestionClick(q)}
                      >
                        {q.q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Categories selector (welcome view) */}
        {view === "welcome" && (
          <div style={{ marginTop: 12 }}>
            <p className="chatbot-suggestion">{knowledge.welcome.suggestion}</p>
            <div className="chatbot-categories">
              {knowledge.categories.map((cat) => (
                <button
                  key={cat.id}
                  className="chatbot-category-btn"
                  onClick={() => handleCategoryClick(cat)}
                  style={{ borderLeftColor: cat.color }}
                >
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{cat.title}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>
                    {cat.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="chat-msg chat-msg-bot">
            <div className="chat-msg-avatar">🤖</div>
            <div className="chat-msg-bubble chat-msg-bubble-bot chat-typing">
              <span className="chat-typing-dot"></span>
              <span className="chat-typing-dot"></span>
              <span className="chat-typing-dot"></span>
            </div>
          </div>
        )}

        {/* Quick actions after answer */}
        {view === "answer" && !isTyping && (
          <div className="chatbot-quick-actions">
            <button className="chatbot-action-btn primary" onClick={handleAnotherQuestion}>
              Otra pregunta sobre {activeCategory?.title}
            </button>
            <button className="chatbot-action-btn" onClick={handleBackToCategories}>
              ← Ver todas las categorías
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="chatbot-footer">
        <div style={{ fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
          💡 Asistente con base de conocimiento curada · Sin alucinaciones
        </div>
      </div>
    </div>
  );
}
