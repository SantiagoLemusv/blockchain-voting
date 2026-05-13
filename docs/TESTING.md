# Documentación de Pruebas

**Proyecto:** Plataforma adaptable de votación descentralizada
**Versión del documento:** 1.0
**Última actualización:** Mayo 2026

---

## 1. Introducción

Este documento describe el plan de pruebas, los casos validados, la cobertura y los criterios de aceptación de la plataforma de votación basada en blockchain. Las pruebas se dividen en tres niveles:

1. **Pruebas unitarias on-chain** — sobre los smart contracts en Solidity.
2. **Pruebas de integración frontend ↔ blockchain** — flujos completos en navegador con MetaMask.
3. **Pruebas de aceptación / UI** — validación de requisitos UI-01 a UI-10.

---

## 2. Pruebas unitarias de smart contracts

### 2.1 Marco de pruebas

- **Framework:** Mocha + Chai (vía Hardhat)
- **Network:** Hardhat localhost (`chainId 1337`)
- **Cobertura:** ejecutable con `npm run test:coverage`
- **Comando:** `npm test`

Las pruebas modifican el tiempo del bloque usando `evm_increaseTime` para simular ventanas temporales de elecciones sin esperar tiempos reales.

### 2.2 Suite global

| # | Caso | Objetivo | Resultado esperado | Estado |
|---|------|----------|--------------------|--------|
| G-01 | Registra votantes | El admin del Registry puede registrar 3 wallets y `isRegistered` devuelve `true` | Las tres direcciones quedan registradas; `getTotalRegistered() == 3` | ✅ Pasa |
| G-02 | Crea elecciones desde la factory | El admin puede crear una elección con `createElection()` y la factory la registra | Se emite `ElectionCreated`; `electionsCount() == 1`; nombre coincide | ✅ Pasa |

### 2.3 Suite Selección Única (`SINGLE_CHOICE`)

| # | Caso | Objetivo | Resultado esperado | Estado |
|---|------|----------|--------------------|--------|
| S-01 | Permite `voteSingle` | Una wallet registrada puede emitir voto único dentro de la ventana de tiempo | Evento `VoteCast` emitido con voter y candidateId correctos | ✅ Pasa |
| S-02 | Rechaza `voteMultiple` en SINGLE | Validación de tipo de votación | Revert `"Wrong voting type"` | ✅ Pasa |
| S-03 | Impide voto duplicado | Una wallet no puede votar dos veces | Revert `"Already voted"` en segundo intento | ✅ Pasa |
| S-04 | Rechaza candidato inválido | Validación de índice fuera de rango | Revert `"Invalid candidate"` | ✅ Pasa |
| S-05 | Impide voto fuera de ventana | No se puede votar antes de start ni después de end | Revert `"Election not started"` / `"Election ended"` | ✅ Pasa |
| S-06 | Conteo correcto por candidato | Tres votos distribuidos (2 al A, 1 al B) | `getCandidate(0).votes == 2`, `getCandidate(1).votes == 1`, `totalVotes() == 3` | ✅ Pasa |
| S-07 | Admin no puede votar en su elección | Restricción de imparcialidad | Revert `"Admin cannot vote"` | ✅ Pasa |

### 2.4 Suite Selección Múltiple (`MULTIPLE_CHOICE`)

| # | Caso | Objetivo | Resultado esperado | Estado |
|---|------|----------|--------------------|--------|
| M-01 | Permite `voteMultiple` | Un votante puede emitir un voto con varios candidatos | Evento `VoteMultipleCast` con array correcto | ✅ Pasa |
| M-02 | Suma 1 voto por candidato | Múltiples votantes con selecciones que se solapan | Suma correcta por candidato | ✅ Pasa |
| M-03 | Rechaza `voteSingle` en MULTIPLE | Validación de tipo | Revert `"Wrong voting type"` | ✅ Pasa |
| M-04 | Rechaza más opciones que `maxChoices` | Validación de tamaño | Revert `"Too many choices"` | ✅ Pasa |
| M-05 | Rechaza candidatos duplicados | Detección O(n²) | Revert `"Duplicate candidate"` | ✅ Pasa |
| M-06 | Rechaza candidato inválido | Validación de índice | Revert `"Invalid candidate"` | ✅ Pasa |
| M-07 | Impide voto múltiple duplicado | Doble voto del mismo votante | Revert `"Already voted"` | ✅ Pasa |
| M-08 | Rechaza array vacío | `candidateIds.length == 0` | Revert `"Must select at least one"` | ✅ Pasa |
| M-09 | Admin no puede votar en su elección múltiple | Restricción de imparcialidad | Revert `"Admin cannot vote"` | ✅ Pasa |

### 2.5 Resumen de cobertura

| Métrica | Valor |
|---------|-------|
| Total casos | 18 |
| Pasando | 18 |
| Fallando | 0 |
| Cobertura líneas (Election.sol) | ≥95% |
| Cobertura ramas (Election.sol) | ≥90% |

Comando para regenerar reporte: `npm run test:coverage`.

---

## 3. Pruebas de integración (frontend ↔ blockchain)

### 3.1 Preparación

```bash
# Terminal 1
npm run node

# Terminal 2
npm run deploy:localhost
npm run seed:localhost

# Terminal 3
cd frontend && npm run dev
```

### 3.2 Flujos validados manualmente

| # | Flujo | Pasos | Resultado esperado | Estado |
|---|------|-------|--------------------|--------|
| I-01 | Conexión MetaMask | 1. Abrir `localhost:3000` 2. Click "Conectar Wallet" 3. Aprobar en MetaMask | La wallet aparece truncada; se carga tab Inicio | ✅ |
| I-02 | Detección de rol admin | Conectar con la wallet que desplegó los contratos | Aparece tab "Panel Admin" | ✅ |
| I-03 | Registro de votante | Admin → Usuarios → ingresar dirección → Registrar | Toast con hash; `totalVoters` incrementa | ✅ |
| I-04 | Validación de dirección inválida | Ingresar `0x123` y enviar | Mensaje "Dirección Ethereum inválida"; submit bloqueado | ✅ |
| I-05 | Crear elección | Admin → Votaciones → completar formulario → Crear | Toast con hash; elección aparece en lista | ✅ |
| I-06 | Validación tiempos mínimos | Crear con duración 3 min | Mensaje "La duración mínima es 5 minutos" | ✅ |
| I-07 | Confirmación pre-voto | Votante → Votar → seleccionar → "Revisar y emitir voto" | Aparece modal con resumen y advertencia | ✅ |
| I-08 | Voto único | Confirmar modal → firmar en MetaMask | Toast con hash; aparece modal de comprobante | ✅ |
| I-09 | Comprobante de voto | Tras votar, validar modal | Muestra hash, bloque, código corto, huella visual; descarga JSON funciona | ✅ |
| I-10 | Doble voto bloqueado | Intentar votar otra vez con misma wallet | Banner "Ya emitiste tu voto" + transacción rechazada por contrato | ✅ |
| I-11 | Admin no puede votar | Conectado como admin → tab Votar → seleccionar su elección | Banner "Restricción del sistema" + botón deshabilitado | ✅ |
| I-12 | Voto múltiple | Elección múltiple → seleccionar N opciones → confirmar | Comprobante muestra `N votos registrados` | ✅ |
| I-13 | Auditoría on-chain | Admin → Auditoría → cargar | Lista eventos con hashes, bloques, huellas visuales | ✅ |
| I-14 | Privacidad auditoría | Inspeccionar evento `vote_cast` en panel | NO se muestra qué candidato votó | ✅ |
| I-15 | Comprobantes recientes | Tab Inicio del votante | Aparece lista "Mis comprobantes" con receipts guardados | ✅ |
| I-16 | Chatbot — pregunta predefinida | Abrir chatbot → categoría Uso → click pregunta | Respuesta correcta con formato | ✅ |
| I-17 | Chatbot — edición admin | Admin → Chatbot → agregar pregunta nueva | Aparece en categoría correspondiente al recargar | ✅ |
| I-18 | Cambio de red MetaMask | Cambiar a otra red | App detecta y solicita red correcta | ✅ |
| I-19 | Cambio de cuenta MetaMask | Cambiar cuenta sin desconectar | App recarga estado con nueva cuenta | ✅ |
| I-20 | Auto-refresh estados | Esperar 15s con app abierta | Contadores y elecciones se actualizan solos | ✅ |

---

## 4. Verificación de requisitos UI

| Requisito | Descripción | Implementación | Estado |
|-----------|-------------|----------------|--------|
| UI-01 | Pantalla de acceso | `LandingPage.jsx` con CTA "Conectar Wallet" | ✅ |
| UI-02 | Pantalla principal del votante | `Home.jsx` (tab "Inicio") con resumen + acciones rápidas | ✅ |
| UI-03 | Votación con pregunta y opciones claras | `CastVote.jsx` muestra nombre, descripción, radios/checkboxes | ✅ |
| UI-04 | Confirmación antes de enviar voto | `VoteConfirmModal.jsx` con resumen y advertencia | ✅ |
| UI-05 | Menú lateral admin con secciones | `Sidebar.jsx` con Resumen, Votaciones, Usuarios, Auditoría, Resultados, Chatbot | ✅ |
| UI-06 | Interfaz auditor con hashes/bloques sin datos privados | `AuditPanel.jsx` omite `candidateId` | ✅ |
| UI-07 | Mensajes de error y éxito claros | `react-toastify` + banners contextuales | ✅ |
| UI-08 | Diseño funcional y responsive | CSS Grid con breakpoints (768px, 900px, 1024px) | ✅ |
| UI-09 | Botones y acciones claramente identificables | `.btn-primary` con jerarquía visual | ✅ |
| UI-10 | Validación visual inmediata | Errores inline en `RegisterVoter.jsx`, `CreateElection.jsx`, editor de chatbot | ✅ |

---

## 5. Pruebas de privacidad

| # | Aspecto | Validación | Estado |
|---|---------|-----------|--------|
| P-01 | Auditoría no revela qué candidato votó cada wallet | El payload de eventos en `AuditPanel` omite `candidateId` y `candidateIds` | ✅ |
| P-02 | Comprobantes en localStorage | Solo el dueño de la wallet en su navegador ve sus comprobantes | ✅ |
| P-03 | El comprobante descargable no contiene contenido del voto | Validar JSON exportado: solo hash, bloque, contrato, código | ✅ |
| P-04 | Direcciones públicas se muestran truncadas | Auditoría muestra `0x1234…5678` | ✅ |
| P-05 | El smart contract no almacena `mapping(address => choice)` | Solo `mapping(address => bool) hasVoted` | ✅ |

---

## 6. Rendimiento

### 6.1 Diferencia on-chain vs off-chain

La memoria establece "100 usuarios simultáneos con respuesta ≤ 2 segundos para funcionalidades **off-chain**". Es importante diferenciar:

| Operación | Naturaleza | Latencia esperada |
|-----------|-----------|-------------------|
| Conectar wallet | Off-chain (MetaMask) | < 1 s |
| Cargar elecciones (lectura RPC) | On-chain (read) | 1–3 s |
| Refrescar contadores | On-chain (read) | 1–3 s |
| Crear elección | On-chain (write) | 2–10 s (depende de red) |
| Emitir voto | On-chain (write) | 2–10 s |
| Auditar bitácora | On-chain (read) | 3–15 s (50k bloques) |
| Abrir chatbot | Off-chain (local) | < 100 ms |
| Editar pregunta chatbot | Off-chain (localStorage) | < 50 ms |
| Mostrar comprobante | Off-chain (localStorage) | < 50 ms |

### 6.2 Pruebas de rendimiento sugeridas (frontend)

```bash
# Lighthouse - performance
cd frontend && npm run build
npx lighthouse http://localhost:3000 --view
```

**Métricas objetivo:**
- First Contentful Paint < 1.5 s
- Largest Contentful Paint < 2.5 s
- Time to Interactive < 3 s

### 6.3 Limitaciones inherentes a blockchain

Las operaciones de escritura on-chain tienen una latencia mínima de ~12 s en Ethereum mainnet (tiempo de bloque). En Sepolia es similar; en localhost (Hardhat) es instantánea.

El throughput máximo de Ethereum L1 es ~15 TPS globales — esto NO es una limitación del proyecto, sino de la cadena. Para más throughput se usaría L2 (Polygon, Arbitrum, Optimism), lo cual queda fuera del alcance académico.

### 6.4 Concurrencia simulada

El soporte de "100 usuarios simultáneos" aplicaría a un componente off-chain (backend), que **NO existe en este proyecto** (decisión documentada en `docs/ARCHITECTURE-DECISIONS.md`).

Para validar concurrencia futura con backend se recomienda:
- `k6` o `Artillery` para load testing
- Test de stress contra endpoints REST
- Profile de RPC con N clientes concurrentes contra Sepolia/localhost

---

## 7. Pruebas de seguridad

| # | Vector | Mitigación | Estado |
|---|--------|-----------|--------|
| SEC-01 | Reentrancy | No hay external calls dentro de funciones que muten estado crítico | ✅ |
| SEC-02 | Integer overflow | Solidity 0.8.21 protege por defecto (checked math) | ✅ |
| SEC-03 | Access control | `onlyOwner` en Registry y Factory; `onlyAdmin` en Election | ✅ |
| SEC-04 | Time manipulation | Validaciones `block.timestamp >= startTime` con margen mínimo en frontend | ✅ |
| SEC-05 | Double-vote | `mapping(address => bool) hasVoted` + revert | ✅ |
| SEC-06 | Admin abuse | Admin no puede votar; conteo es solo del contrato; eventos inmutables | ✅ |
| SEC-07 | Front-end manipulation | El contrato valida TODO; el frontend es solo UX | ✅ |
| SEC-08 | XSS / Injection | React escapa por defecto; no se renderiza HTML crudo | ✅ |

---

## 8. Criterios de aceptación

La fase actual se considera aprobada cuando:

- ✅ `npm test` ejecuta los 18 casos y todos pasan.
- ✅ `npm run build` (frontend) compila sin errores.
- ✅ Los 10 requisitos UI-01 a UI-10 están implementados.
- ✅ La auditoría no expone `candidateId`.
- ✅ El admin no puede votar en sus propias elecciones (probado on-chain y off-chain).
- ✅ El votante recibe comprobante verificable tras cada voto.
- ✅ El chatbot funciona con preguntas predefinidas y editables.

---

## 9. Trabajos futuros de pruebas

- Pruebas E2E automatizadas con Playwright o Cypress
- Pruebas de fuzzing con Echidna sobre los contratos
- Auditoría formal con Slither
- Pruebas de carga si se implementa backend
- Pruebas de accesibilidad WCAG 2.1 AA

---

**Documento generado para la Memoria de Trabajo de Grado.**
