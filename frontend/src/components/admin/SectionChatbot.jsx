/**
 * SectionChatbot — Editor del chatbot por administrador.
 *
 * Permite al admin agregar/editar/eliminar preguntas y respuestas del
 * asistente virtual. Las modificaciones se persisten en localStorage.
 */

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { chatbotKnowledge } from "../../data/chatbotKnowledge";
import {
  getCustomQuestions,
  saveCustomQuestion,
  deleteCustomQuestion,
  clearAllCustomQuestions,
} from "../../utils/chatbotStorage";

const EMPTY_FORM = { id: "", categoryId: "usage", q: "", a: "" };

export default function SectionChatbot() {
  const [customQuestions, setCustomQuestions] = useState([]);
  const [editing, setEditing] = useState(null); // null | {id, categoryId, q, a}
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setCustomQuestions(getCustomQuestions());
  }, []);

  const startNew = () => {
    setEditing("new");
    setForm({ ...EMPTY_FORM, id: `custom-${Date.now()}` });
    setErrors({});
  };

  const startEdit = (q) => {
    setEditing(q.id);
    setForm({ id: q.id, categoryId: q.categoryId, q: q.q, a: q.a });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!form.q.trim()) errs.q = "La pregunta es obligatoria.";
    if (form.q.length > 200) errs.q = "Máximo 200 caracteres.";
    if (!form.a.trim()) errs.a = "La respuesta es obligatoria.";
    if (form.a.length > 4000) errs.a = "Máximo 4000 caracteres.";
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const updated = saveCustomQuestion({
      id: form.id,
      categoryId: form.categoryId,
      q: form.q.trim(),
      a: form.a.trim(),
    });
    setCustomQuestions(updated);
    cancelEdit();
    toast.success("✅ Pregunta guardada");
  };

  const handleDelete = (id) => {
    if (!confirm("¿Eliminar esta pregunta? Esta acción no se puede deshacer.")) return;
    const updated = deleteCustomQuestion(id);
    setCustomQuestions(updated);
    toast.info("🗑️ Pregunta eliminada");
  };

  const handleClearAll = () => {
    if (!confirm("¿Eliminar TODAS las preguntas personalizadas? Las predefinidas se conservarán.")) return;
    clearAllCustomQuestions();
    setCustomQuestions([]);
    toast.info("🗑️ Preguntas personalizadas eliminadas");
  };

  const totalPredefined = chatbotKnowledge.categories.reduce((s, c) => s + c.questions.length, 0);
  const groupedByCategory = chatbotKnowledge.categories.map((cat) => ({
    ...cat,
    customs: customQuestions.filter((q) => q.categoryId === cat.id),
  }));

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 6 }}>
        <h2 className="section-title" style={{ margin: 0 }}>💬 Gestor del Chatbot</h2>
        {customQuestions.length > 0 && (
          <button
            className="btn"
            style={{ background: "var(--bg)", color: "var(--text)", fontSize: 12, padding: "6px 12px" }}
            onClick={handleClearAll}
          >
            🗑️ Limpiar personalizadas
          </button>
        )}
      </div>
      <p className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
        Personaliza el contenido educativo del asistente virtual. Tus preguntas se agregan a las categorías existentes
        y aparecen junto a las predefinidas.
      </p>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-number">{totalPredefined}</div>
          <div className="stat-label">Predefinidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number green">{customQuestions.length}</div>
          <div className="stat-label">Personalizadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalPredefined + customQuestions.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Privacidad / persistencia */}
      <div style={{ padding: 14, background: "#fff7ed", borderRadius: 8, marginBottom: 20, border: "1px solid #fed7aa" }}>
        <strong style={{ fontSize: 13, color: "#c2410c" }}>⚠️ Almacenamiento local</strong>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9a3412", lineHeight: 1.6 }}>
          Las preguntas personalizadas se guardan en <code>localStorage</code> de este navegador. Si abres la plataforma
          desde otro dispositivo no las verás. Para sincronización multi-admin se requeriría un backend con base de datos
          (documentado como trabajo futuro).
        </p>
      </div>

      {/* Botón nueva pregunta */}
      {editing === null && (
        <button className="btn btn-primary" style={{ marginBottom: 20 }} onClick={startNew}>
          + Agregar nueva pregunta
        </button>
      )}

      {/* Formulario edición */}
      {editing !== null && (
        <div className="card" style={{ marginBottom: 20, padding: 16, border: "2px solid var(--accent-chatbot)" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>
            {editing === "new" ? "Nueva pregunta" : "Editar pregunta"}
          </h3>

          <div style={{ marginBottom: 10 }}>
            <div className="small" style={{ marginBottom: 4 }}>Categoría</div>
            <select
              className="select"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              {chatbotKnowledge.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div className="small" style={{ marginBottom: 4 }}>
              Pregunta * <span className="muted">({form.q.length}/200)</span>
            </div>
            <input
              className={`input${errors.q ? " input-error" : ""}`}
              placeholder="¿Cómo funciona...?"
              value={form.q}
              onChange={(e) => { setForm({ ...form, q: e.target.value }); setErrors({ ...errors, q: "" }); }}
              maxLength={200}
            />
            {errors.q && <span className="form-error">{errors.q}</span>}
          </div>

          <div style={{ marginBottom: 10 }}>
            <div className="small" style={{ marginBottom: 4 }}>
              Respuesta * <span className="muted">({form.a.length}/4000)</span>
            </div>
            <textarea
              className={`textarea${errors.a ? " input-error" : ""}`}
              placeholder="Escribe aquí la respuesta. Puedes usar **negritas** y saltos de línea."
              value={form.a}
              onChange={(e) => { setForm({ ...form, a: e.target.value }); setErrors({ ...errors, a: "" }); }}
              maxLength={4000}
              style={{ minHeight: 140, fontFamily: "inherit" }}
            />
            {errors.a && <span className="form-error">{errors.a}</span>}
            <p className="small" style={{ marginTop: 4 }}>
              💡 Formato: usa <code>**texto**</code> para negritas y deja líneas en blanco para párrafos.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={handleSave}>
              💾 Guardar
            </button>
            <button
              className="btn"
              style={{ background: "var(--bg)", color: "var(--text)" }}
              onClick={cancelEdit}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista por categoría */}
      <div className="section-divider">Preguntas por categoría</div>
      {groupedByCategory.map((cat) => (
        <div key={cat.id} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{cat.icon}</span>
            <strong style={{ fontSize: 14 }}>{cat.title}</strong>
            <span className="badge badge-muted">
              {cat.questions.length} predefinidas
              {cat.customs.length > 0 && ` + ${cat.customs.length} personalizadas`}
            </span>
          </div>

          {/* Predefinidas */}
          {cat.questions.map((q) => (
            <div key={q.id} className="chatbot-q-row predefined">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{q.q}</div>
                <span className="badge badge-muted" style={{ fontSize: 10, marginTop: 4, display: "inline-block" }}>
                  Predefinida · no editable
                </span>
              </div>
            </div>
          ))}

          {/* Custom */}
          {cat.customs.map((q) => (
            <div key={q.id} className="chatbot-q-row custom">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{q.q}</div>
                <span className="badge badge-success" style={{ fontSize: 10, marginTop: 4, display: "inline-block" }}>
                  ✏️ Personalizada
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  className="btn"
                  style={{ background: "var(--bg)", color: "var(--text)", fontSize: 11, padding: "4px 10px" }}
                  onClick={() => startEdit(q)}
                  disabled={editing !== null}
                >
                  Editar
                </button>
                <button
                  className="btn"
                  style={{ background: "#fef2f2", color: "#dc2626", fontSize: 11, padding: "4px 10px" }}
                  onClick={() => handleDelete(q.id)}
                  disabled={editing !== null}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
