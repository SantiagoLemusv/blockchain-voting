/**
 * chatbotStorage.js — Persistencia local de preguntas/respuestas custom del chatbot.
 *
 * Decisión arquitectónica:
 * Para mantener el proyecto sin backend, las ediciones del administrador
 * se persisten en localStorage. Esto significa:
 *
 *   ✅ Cero infraestructura adicional, ideal para demo académica.
 *   ✅ Cada admin tiene su propia configuración por navegador.
 *   ⚠️ Si el admin abre desde otro dispositivo, no verá sus ediciones.
 *   ⚠️ Si limpia el navegador, pierde las ediciones.
 *
 * Para producción real con múltiples admins se requeriría backend con DB.
 * Esto queda documentado en docs/ARCHITECTURE.md como trabajo futuro.
 */

const STORAGE_KEY = "chatbot-custom-questions";

/**
 * Estructura de una pregunta custom:
 * { id: string, categoryId: "usage"|"blockchain"|"civic", q: string, a: string, custom: true }
 */

export function getCustomQuestions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomQuestion(question) {
  const all = getCustomQuestions();
  const existingIdx = all.findIndex((q) => q.id === question.id);

  if (existingIdx >= 0) {
    all[existingIdx] = { ...question, custom: true };
  } else {
    all.push({ ...question, custom: true, id: question.id || `custom-${Date.now()}` });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

export function deleteCustomQuestion(id) {
  const all = getCustomQuestions().filter((q) => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

export function clearAllCustomQuestions() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Combina las categorías predefinidas con preguntas custom del admin.
 * Las custom se agregan a la categoría correspondiente.
 */
export function mergeKnowledgeWithCustom(baseKnowledge) {
  const custom = getCustomQuestions();
  if (custom.length === 0) return baseKnowledge;

  const merged = {
    ...baseKnowledge,
    categories: baseKnowledge.categories.map((cat) => {
      const extras = custom.filter((q) => q.categoryId === cat.id);
      return {
        ...cat,
        questions: [...cat.questions, ...extras.map((q) => ({ id: q.id, q: q.q, a: q.a, custom: true }))],
      };
    }),
  };

  return merged;
}
