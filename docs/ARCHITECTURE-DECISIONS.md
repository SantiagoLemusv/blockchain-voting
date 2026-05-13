# Decisiones Arquitectónicas (ADR)

**Proyecto:** Plataforma adaptable de votación descentralizada
**Última actualización:** Mayo 2026

---

Este documento registra las decisiones de arquitectura tomadas durante el desarrollo, las alternativas evaluadas y las razones de cada decisión. Sirve como complemento de `docs/arquitectura.md` (diagrama estructural).

---

## ADR-001: Arquitectura sin backend (off-chain mínimo)

**Estado:** Aceptado.
**Fecha:** Mayo 2026.

### Contexto

La memoria original propone una arquitectura con:
- Frontend React
- Backend orquestador con API REST
- Base de datos relacional off-chain
- Smart contracts en Ethereum

Durante el desarrollo se evaluó si el backend off-chain era estrictamente necesario para cumplir los objetivos académicos del proyecto.

### Alternativas consideradas

**Opción A — Implementar backend completo**
- ✅ Cumple textualmente con la memoria
- ✅ Permite consultas off-chain rápidas
- ✅ Habilita 100+ usuarios concurrentes
- ❌ Requiere infraestructura: hosting, DB, deploy, CI/CD
- ❌ Aumenta superficie de ataque (otro componente a auditar)
- ❌ Introduce un punto centralizado que contradice el espíritu de "votación descentralizada"
- ❌ Tiempo adicional estimado: 4-6 semanas
- ❌ Costo de hosting recurrente

**Opción B — Backend mínimo solo para caché de lecturas**
- ✅ Acelera lecturas frecuentes (lista de elecciones, totales)
- ✅ Reduce carga sobre RPC
- ❌ Sigue requiriendo infraestructura
- ❌ Introduce desincronización potencial entre caché y blockchain
- ❌ Centraliza algo que debería ser descentralizado

**Opción C — Sin backend, todo on-chain + localStorage para UX (ELEGIDA)**
- ✅ Arquitectura puramente descentralizada, coherente con el discurso
- ✅ Cero infraestructura adicional
- ✅ Cero costos recurrentes
- ✅ Auditabilidad total: cualquiera puede verificar contra blockchain
- ✅ Mantenibilidad simplificada
- ⚠️ Lecturas dependen de RPC (latencia 1-3s)
- ⚠️ Funciones que requerirían DB (búsqueda full-text, paginación avanzada, multi-admin sync) se documentan como trabajo futuro

### Decisión

Se adopta **Opción C**.

Los datos persistentes viven en blockchain (Registry, Factory, Election contracts). La UX local del navegador (comprobantes de voto, ediciones del chatbot, preferencias) se persiste en `localStorage`.

### Consecuencias

**Implicaciones para la memoria:**
La sección de arquitectura debe actualizarse para reflejar:
- Frontend React + ethers.js
- MetaMask como capa de identidad y firma
- Smart contracts en Solidity 0.8.21 desplegados en Hardhat localhost / Sepolia
- `localStorage` del navegador como capa de UX (NO de verdad de datos)
- Auto-refresh periódico para mantener estado on-chain ↔ UI

**Implicaciones para los requisitos:**
- "100 usuarios concurrentes off-chain" → se documenta como trabajo futuro (requiere backend)
- "Base de datos relacional" → reemplazada por almacenamiento estructurado on-chain
- "API REST" → reemplazada por llamadas RPC directas a la blockchain

**Trade-offs aceptados:**
- Si admin abre desde otro dispositivo, no ve sus comprobantes ni ediciones de chatbot. Esto es un trade-off conocido.
- Para sincronización multi-dispositivo se requeriría backend (trabajo futuro).

---

## ADR-002: Privacidad del voto en blockchain pública

**Estado:** Aceptado.
**Fecha:** Mayo 2026.

### Contexto

Blockchain es pública por diseño. Cualquier persona puede ver:
- Qué wallets están registradas como votantes
- Qué wallets votaron en cada elección
- En qué bloque y con qué hash quedó cada voto

Esto crea tensión con el principio democrático de **voto secreto**.

### Alternativas consideradas

**Opción A — Voto totalmente anónimo con zk-SNARKs**
- ✅ Privacidad criptográfica completa
- ❌ Complejidad muy alta (fuera del alcance académico)
- ❌ Requiere circuitos zk personalizados
- ❌ Costo computacional alto en mainnet

**Opción B — Pseudo-anonimato (ELEGIDA)**
- ✅ La wallet NO está vinculada a una identidad real on-chain
- ✅ La identidad real depende del proceso de registro (off-chain, p. ej. cédula → wallet)
- ✅ Simple y auditable
- ⚠️ Si alguien conoce el mapeo identidad↔wallet, puede saber qué votó

**Opción C — Hash de voto en evento + revelación posterior**
- ✅ Voto cifrado durante la elección
- ❌ Complejo, requiere fase de "revelación"
- ❌ Vulnerable a admins que no revelen votos

### Decisión

Se adopta **Opción B** (pseudo-anonimato).

Se complementa con:
1. **Auditoría sin exposición de `candidateId`**: el panel de auditoría muestra que una wallet votó, pero no qué votó.
2. **Comprobantes locales**: el votante puede ver su propio comprobante en su navegador; nadie más.
3. **Disclaimer claro** en la UI sobre la naturaleza pública de blockchain.

### Consecuencias

- Para producción real se recomienda que el proceso de registro (wallet ↔ persona) sea custodiado por una autoridad confiable, NO publicado.
- Para mayor privacidad se documenta como trabajo futuro la integración de zk-SNARKs.

---

## ADR-003: Restricción de admin sobre votación propia

**Estado:** Aceptado.
**Fecha:** Mayo 2026.

### Contexto

Si el administrador puede votar en las elecciones que él mismo crea, se debilita la integridad del proceso democrático y el discurso de imparcialidad del sistema.

### Decisión

Se implementa la restricción en **dos capas (defensa en profundidad)**:

1. **Smart contract** (capa de seguridad): `require(msg.sender != admin, "Admin cannot vote")` en `voteSingle()` y `voteMultiple()`.
2. **Frontend** (capa UX): banner explicativo cuando el admin abre una elección de la que es creador.

### Consecuencias

- El admin puede crear, observar y auditar, pero no votar.
- Si una persona quiere ser admin Y votante, debe usar wallets distintas.
- La separación está garantizada por el contrato, no solo por la UI.

---

## ADR-004: Persistencia local de comprobantes y configuraciones

**Estado:** Aceptado.
**Fecha:** Mayo 2026.

### Contexto

Tras votar, el usuario debe recibir un comprobante. ¿Dónde se almacena?

### Alternativas consideradas

**Opción A — Solo blockchain**
- ✅ Verdad única
- ❌ Requiere consultar RPC para ver historial
- ❌ El usuario no tiene "su lista de comprobantes"

**Opción B — Backend con DB**
- ✅ Historial centralizado
- ❌ Requiere backend (rechazado en ADR-001)

**Opción C — localStorage por wallet (ELEGIDA)**
- ✅ Cero infraestructura
- ✅ Privacidad: solo el dueño del navegador los ve
- ✅ Rápido (< 50 ms)
- ⚠️ No sincroniza entre dispositivos

### Decisión

Se almacenan los comprobantes en `localStorage` con clave `voting-receipts-<address>`. Misma estrategia para configuración del chatbot editable (`chatbot-custom-questions`).

### Consecuencias

- Los comprobantes pueden recrearse desde blockchain si se pierden (el hash existe siempre on-chain).
- Para sincronización multi-dispositivo se requeriría backend.

---

## ADR-005: Identificación visual única (HashVisual)

**Estado:** Aceptado.
**Fecha:** Mayo 2026.

### Contexto

La memoria solicita "sistema de identificación visual única" donde cada transacción tenga una representación visual única basada en su hash.

### Alternativas consideradas

**Opción A — Librería externa (jdenticon, blockies)**
- ✅ Probadas
- ❌ Dependencia adicional (~50KB minified)
- ❌ Estilo no controlable

**Opción B — Implementación propia con SVG (ELEGIDA)**
- ✅ Sin dependencias
- ✅ Estilo coherente con la plataforma
- ✅ Determinístico
- ✅ Educativo: el código revela cómo se construye

### Decisión

Se implementa `HashVisual.jsx` que genera un patrón 5×5 simétrico (mirror izquierda/derecha) con colores HSL derivados de los primeros bytes del hash.

### Consecuencias

- Mismo hash siempre produce la misma figura.
- Diferentes hashes producen figuras distintas con alta probabilidad.
- Cero peso adicional en el bundle.

---

## ADR-006: Chatbot sin IA real

**Estado:** Aceptado.
**Fecha:** Mayo 2026.

### Contexto

La memoria menciona un "chatbot asistente". Existen dos enfoques:

### Alternativas consideradas

**Opción A — Integración con LLM real (OpenAI, Claude, etc.)**
- ✅ Respuestas dinámicas
- ❌ Costo recurrente por consulta
- ❌ Posibles alucinaciones (responde incorrectamente)
- ❌ Requiere backend para proteger API key
- ❌ Latencia 1-5s por respuesta

**Opción B — FAQ estructurado, sin IA (ELEGIDA)**
- ✅ Respuestas verificadas y controladas por el equipo
- ✅ Cero alucinaciones
- ✅ Cero costo recurrente
- ✅ Latencia instantánea
- ✅ Editable por el admin (Opción C de la memoria)
- ⚠️ Requiere mantenimiento manual de contenido

### Decisión

Se implementa **Opción B**:
- Base de conocimiento curada en `frontend/src/data/chatbotKnowledge.js`
- 3 ejes: uso, educación blockchain, contexto cívico
- Admin puede agregar preguntas adicionales desde `SectionChatbot.jsx`
- UI tipo chat con animaciones y huellas visuales

### Consecuencias

- Garantía de no alucinación.
- El contenido se versiona en git como código.
- Si en el futuro se decide integrar LLM, la base estructural ya está lista (basta cambiar la fuente de las respuestas).

---

## Trabajos futuros documentados

Las siguientes funcionalidades quedan documentadas como mejoras posibles fuera del alcance académico actual:

| Funcionalidad | Razón de aplazamiento |
|---------------|----------------------|
| Backend con API REST y DB | ADR-001: no requerido para demo académica |
| zk-SNARKs para anonimato completo | Complejidad fuera de alcance |
| Sincronización multi-dispositivo de comprobantes | Requiere backend |
| LLM real en chatbot | Requiere backend para proteger API keys |
| Despliegue en L2 (Polygon, Arbitrum) | Sepolia es suficiente para validar |
| Pruebas de carga 100 usuarios concurrentes | Solo aplica con backend |
| Auditoría formal de seguridad con Slither/Echidna | Out of scope académico |
| Soporte para múltiples redes en runtime | Configuración estática suficiente |
| Sistema de notificaciones push | Requiere backend |

---

**Documento generado para la Memoria de Trabajo de Grado.**
