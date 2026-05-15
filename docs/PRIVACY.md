# Privacidad, Anonimato y Auditabilidad

**Proyecto:** Plataforma adaptable de votación descentralizada
**Versión:** 1.0
**Última actualización:** Mayo 2026

---

## 1. Introducción

Este documento detalla el modelo de privacidad de la plataforma: qué información se hace pública, qué permanece oculta, qué riesgos existen y cómo se mitigan. Sirve de complemento a `docs/ARCHITECTURE-DECISIONS.md` (ADR-002).

El objetivo central es resolver una tensión inherente al voto en blockchain pública:

> **Auditabilidad** (cualquiera puede verificar el conteo) ↔ **Privacidad del voto** (nadie puede saber qué eligió cada persona)

---

## 2. Modelo de privacidad adoptado

La plataforma implementa un esquema de **pseudo-anonimato con privacidad de contenido**:

| Atributo | Pública | Privada | Notas |
|----------|---------|---------|-------|
| Wallets registradas como votantes | ✅ | — | Inherente a blockchain (`VoterRegistered` events) |
| Wallets que emitieron un voto | ✅ | — | Inherente a blockchain (firma de tx) |
| **Qué opción votó cada wallet** | — | ✅ | **Garantizado por diseño** (no se emite `candidateId` con `voter` indexed en evento atómico revelador) |
| Identidad real detrás de la wallet | — | ✅ | Depende del proceso off-chain de registro |
| Conteo total por candidato | ✅ | — | Verificable on-chain |
| Hash de transacción y bloque | ✅ | — | Necesario para verificación |

### Qué significa "pseudo-anónimo"

La wallet `0x1234…5678` es pública. Pero esa wallet **no contiene** una identidad real a menos que exista un mapeo externo (off-chain) que la asocie. En el modelo actual, ese mapeo lo custodia el **administrador del registro**, no la plataforma.

---

## 3. Información expuesta vs. ocultada

### 3.1 Información que SÍ es pública (inherente a Ethereum)

- Dirección de cada wallet registrada
- Dirección de cada wallet que votó
- Bloque, timestamp y hash de cada transacción
- Direcciones de los smart contracts
- Conteo total por candidato

**Por qué no se puede ocultar:** Ethereum es una blockchain pública. Cualquier cliente RPC puede leer los eventos. Ocultar esto requeriría zk-SNARKs o un mixer.

### 3.2 Información que NO se expone (decisión deliberada)

- **`candidateId` asociado al `voter`**: Los eventos blockchain `VoteCast(voter, candidateId)` incluyen ambos. **Nuestra UI omite `candidateId` en el AuditPanel** (`auditEvents.js`). Aún así, un cliente RPC custom podría leerlo. **Esta es una limitación conocida del esquema actual** (ver §5).
- **Contenido del comprobante de voto**: El comprobante (`VoteReceipt.jsx`) muestra hash, bloque, código corto y huella visual — **nunca la opción elegida**.
- **Lista de votantes con detalle en UI no-admin**: Solo el admin ve direcciones; el resto ve "Participante autenticado" + huella visual.

---

## 4. Mecanismos de mitigación implementados

### 4.1 Auditoría con `candidateId` oculto

En `frontend/src/utils/auditEvents.js`, cuando construimos el payload del evento `VoteCast`, **omitimos deliberadamente** `candidateId`:

```javascript
events.push({
  type: "vote_cast",
  txHash: ev.transactionHash,
  payload: {
    voter: ev.args?.voter,
    electionName: name,
    // ⚠️ candidateId omitido por privacidad
  },
});
```

**Limitación:** un usuario técnico con acceso al RPC puede leer el evento crudo y ver `candidateId`. La protección es a nivel UI, no a nivel protocolo.

### 4.2 Huella visual como sustituto de la dirección

El componente `HashVisual.jsx` genera un patrón SVG 5×5 determinístico a partir del hash. Esto permite **reconocer transacciones similares** (mismo hash = misma figura) sin exponer la dirección bruta. Es lo único visible para usuarios no-admin en el AuditPanel.

### 4.3 Toggle "Mostrar direcciones técnicas" (solo admin)

El admin puede activar/desactivar la visualización de direcciones en la bitácora. Por defecto **están ocultas** incluso para él, mostrándose solo huella visual + "Participante autenticado". Esto previene exposición accidental durante demos.

### 4.4 Comprobantes en localStorage

Los comprobantes de voto se guardan en `localStorage` del navegador, indexados por dirección del votante (`voting-receipts-<address>`). **Nadie más en otro dispositivo ve esos comprobantes**, ni siquiera el admin. Los comprobantes pueden reconstruirse desde blockchain si se pierden.

### 4.5 Truncado consistente de direcciones

Todas las direcciones en UI se muestran como `0x1234…5678`. Esto es legibilidad UX, no privacidad real (la dirección completa sigue en DOM/RPC), pero reduce el ruido visual.

### 4.6 Smart contract no almacena la opción por wallet

El contrato `Election.sol` mantiene `mapping(address => bool) hasVoted` (solo si votó) y `votes[]` por candidato (conteos agregados). **No existe ningún `mapping(address => uint256 choice)` accesible**. La única forma de derivar `voter→choice` es escuchando los eventos emitidos en la transacción de voto.

---

## 5. Riesgos residuales conocidos

### 5.1 Correlación por eventos blockchain

**Riesgo:** Un observador con acceso RPC puede ejecutar:
```
election.queryFilter(election.filters.VoteCast(walletObjetivo))
```
y obtener `candidateId` directamente del log del evento. La protección frontend no es suficiente.

**Mitigación posible (FASE 2 — fuera de alcance académico):**
- **Commit-reveal**: el votante envía `keccak256(choice + nonce)` durante la votación. Tras finalizar, revela `choice` y `nonce`. El contrato verifica el commit y suma el voto. Durante la fase de votación, nadie sabe qué votó nadie. Requiere reescribir `Election.sol` y agregar fase de revelación.

### 5.2 Análisis temporal

**Riesgo:** Si solo 5 personas votaron en la última hora y el orden de las transacciones es público, alguien puede correlacionar "la transacción de las 14:32 fue de X persona" con un voto específico si conoce sus hábitos.

**Mitigación posible:**
- Mixer o batch de votos via meta-transactions con relayer
- zk-SNARKs (Semaphore, ZKVote) — fuera de alcance

### 5.3 Dependencia del proceso de registro

**Riesgo:** El admin custodia el mapeo wallet ↔ persona real (off-chain). Si ese mapeo se filtra, todas las votaciones quedan deanonimizadas retroactivamente.

**Mitigación:**
- El mapeo NO se almacena en blockchain ni en este proyecto
- Para producción, debe ser custodiado por una autoridad confiable (RA — Registry Authority)
- Procesos de borrado/rotación de claves

### 5.4 Análisis del navegador

**Riesgo:** El navegador del votante ve la opción elegida en claro antes de firmar la transacción. Malware local podría capturar esto.

**Mitigación:**
- Cliente confiable + MetaMask como capa de firma
- No usar dispositivos compartidos
- Fuera del alcance del protocolo

---

## 6. Auditoría sin exposición — cómo funciona

Un auditor externo puede:

1. ✅ **Verificar que el conteo total es correcto** llamando a `election.totalVotes()` y comparándolo con la suma de `getCandidate(i).votes`.
2. ✅ **Verificar que ninguna wallet votó dos veces** consultando `hasVoted(addr)` para cada wallet en el registro.
3. ✅ **Verificar que solo wallets registradas votaron** comparando emisores de `VoteCast` contra `VoterRegistered`.
4. ✅ **Verificar la integridad temporal** confirmando que todos los `VoteCast` ocurren entre `startTime` y `endTime`.

Un auditor **no puede** (con las protecciones UI):

- ❌ Identificar qué votó cada wallet (debe leer eventos crudos vía RPC — limitación admitida)
- ❌ Vincular una wallet con su dueño real (depende del proceso de registro custodiado)

---

## 7. Trade-offs de diseño UX

### Decisión: Auto-reconnect silencioso

**Antes:** En cada recarga, el usuario veía el popup de MetaMask pidiendo permiso para conectar.

**Después:** Usamos `eth_accounts` para auto-reconectar si la sesión previa fue autorizada. El popup `eth_requestAccounts` se muestra solo en click explícito a "Iniciar sesión segura".

**Razón:** Reducir fricción visual sin perder seguridad. MetaMask sigue siendo el guardian de la firma; solo evitamos preguntar permiso ya concedido.

### Decisión: Mostrar huella visual en lugar de dirección bruta

**Antes:** AuditPanel mostraba `0x1234…5678` para cada votante.

**Después:** Por defecto se muestra solo el HashVisual (SVG) + "Participante autenticado". El admin puede activar un toggle para ver direcciones.

**Razón:** La huella visual permite **reconocer patrones** (¿el mismo participante volvió a votar?) sin exponer la dirección. Cumple el propósito de auditoría sin alimentar la trazabilidad casual.

### Decisión: Textos no técnicos

**Antes:** "Conectar Wallet", "Hash de transacción", "Requiere MetaMask u otra wallet compatible con EVM".

**Después:** "Iniciar sesión segura", "Sesión activa", "Te pediremos autenticarte de forma segura con tu billetera digital".

**Razón:** Usuarios no técnicos no necesitan saber qué es una blockchain, una wallet ni MetaMask para usar la plataforma. La complejidad sigue ahí, pero invisible.

---

## 8. Comparación con sistemas tradicionales

| Propiedad | Voto papel | Voto electrónico centralizado | Este sistema (blockchain pública) | Sistema ideal (commit-reveal + zk) |
|-----------|-----------|------------------------------|-----------------------------------|-----------------------------------|
| Anonimato del voto | Alto (urna) | Depende del proveedor | Medio (pseudo-anónimo) | Alto |
| Auditabilidad | Manual y limitada | Cerrada al proveedor | Total y pública | Total y pública |
| Inmutabilidad | Alta si urna no se pierde | Baja (DB editable) | Total | Total |
| Resistencia a censura | Media | Baja | Alta | Alta |
| Verificabilidad individual | Baja | Baja | Alta | Alta |
| Complejidad técnica | Baja | Media | Alta | Muy alta |

---

## 9. Limitaciones del modelo actual (transparencia académica)

Para una memoria honesta de trabajo de grado, se documentan las siguientes limitaciones:

1. **No es voto verdaderamente anónimo.** Es pseudo-anónimo. Un atacante con (a) acceso al mapeo identidad↔wallet y (b) acceso RPC puede derivar quién votó qué.

2. **El admin tiene poder limitado pero existente.** Aunque no puede votar ni cambiar resultados, sí controla quién está registrado. Podría excluir votantes deliberadamente.

3. **No hay sistema de recuperación de wallet.** Si un votante pierde el acceso a su wallet, no puede votar. No hay forma de transferir derecho de voto sin re-registro.

4. **Coste por transacción.** En Sepolia es gratis (testnet). En mainnet, cada voto cuesta gas — esto puede convertirse en barrera de participación. La plataforma asume gas patrocinado o uso académico/testnet.

5. **Dependencia de MetaMask.** Si MetaMask falla o el usuario lo desinstala, no puede votar. No hay flujo alternativo (custodial backend) deliberadamente.

---

## 10. Trabajos futuros para mejorar privacidad

| Mejora | Esfuerzo | Beneficio | Estado |
|--------|---------|-----------|--------|
| Commit-reveal en `Election.sol` | Medio | Oculta `voter→choice` durante la votación | Documentado, no implementado |
| Eliminar `voter indexed` en evento `VoteCast` | Bajo (rompe auditoría parcial) | Reduce trazabilidad casual | Trade-off: dificulta detección de doble voto en auditoría |
| Integración con [Semaphore](https://semaphore.appliedzkp.org/) | Alto | Anonimato criptográfico real | Fuera de alcance |
| Backend custodial con cuentas email/SSO | Medio | Usuario no toca wallet | Contradice ADR-001 |
| Mixer / relayer de votos | Alto | Rompe correlación temporal | Fuera de alcance |
| Auditoría con árbol de Merkle del registro | Bajo-Medio | Verificación selectiva sin exponer todo el registro | Posible |

---

## 11. Conclusión

El modelo actual prioriza **simplicidad académica + auditabilidad total + privacidad razonable**. No es perfecto: cualquier sistema de voto en blockchain pública tiene que negociar entre estos tres ejes.

Las decisiones tomadas:

- ✅ **Privacidad del contenido del voto:** garantizada en UI, frágil contra atacantes con RPC + paciencia
- ✅ **Auditabilidad pública:** total, sin compromisos
- ✅ **UX no-técnica:** lograda mediante auto-reconnect, identicons, lenguaje simple, sin sacrificar seguridad
- ⚠️ **Anonimato fuerte:** no garantizado — requiere commit-reveal o zk-proofs (trabajo futuro)

Para un proyecto académico, este es un equilibrio honesto. Para producción real con votaciones políticas, se recomienda implementar la FASE 2 (commit-reveal) como mínimo.

---

**Documento generado para la Memoria de Trabajo de Grado.**
