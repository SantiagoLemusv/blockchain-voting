# 🗳️ Plataforma de Votación Blockchain

**Proyecto de Grado** — Sistema de votación descentralizado, seguro y verificable construido sobre Ethereum. Permite registrar participantes, crear elecciones (única o múltiple), emitir votos de forma inmutable y consultar resultados en tiempo real con plena auditabilidad on-chain.

---

## 📑 Tabla de contenido

1. [Características principales](#-características-principales)
2. [Stack tecnológico](#️-stack-tecnológico)
3. [Arquitectura](#️-arquitectura)
4. [Estructura del proyecto](#-estructura-del-proyecto)
5. [Modelo de contratos](#-modelo-de-contratos)
6. [Requisitos previos](#-requisitos-previos)
7. [Instalación](#-instalación)
8. [Configuración de variables de entorno](#-configuración-de-variables-de-entorno)
9. [Flujo de desarrollo local](#-flujo-de-desarrollo-local)
10. [Despliegue a Sepolia](#-despliegue-a-sepolia)
11. [Configuración de MetaMask](#-configuración-de-metamask)
12. [Comandos disponibles](#-comandos-disponibles)
13. [Suite de pruebas](#-suite-de-pruebas)
14. [Flujo de usuario](#-flujo-de-usuario)
15. [Modelo de privacidad](#-modelo-de-privacidad)
16. [Solución de problemas](#-solución-de-problemas)
17. [Documentación adicional](#-documentación-adicional)
18. [Licencia](#-licencia)

---

## ✨ Características principales

- **Registro controlado de participantes** — solo el administrador autoriza nuevos votantes mediante una lista pública verificable (whitelist on-chain).
- **Dos modalidades de votación**:
  - **Selección Única** — una sola opción por participante (1 voto = 1 candidato).
  - **Selección Múltiple** — N opciones por participante, con tope configurable por elección.
- **Ventanas de tiempo configurables** — cada elección define un `startTime` y `endTime` que limitan cuándo se aceptan votos.
- **Prevención de doble voto** — el contrato bloquea cualquier intento de votar dos veces con la misma billetera.
- **Restricción de imparcialidad** — el administrador no puede votar en elecciones que él mismo creó.
- **Resultados en tiempo real** — el conteo por candidato se actualiza automáticamente cada 15 segundos leyendo directamente del contrato.
- **Comprobante de voto** — al votar, el usuario recibe un recibo con hash de transacción, número de bloque y nombre de elección, almacenado localmente.
- **Panel de auditoría pública** — bitácora de eventos blockchain (registros y votos) con modo de privacidad para ocultar identificadores.
- **Asistente virtual integrado** — chatbot configurable que responde dudas sobre la plataforma, privacidad y proceso.
- **Reconexión silenciosa de billetera** — si el usuario ya autorizó la app, se reconecta sin mostrar popup.
- **Mensajes amigables** — todos los errores del contrato (`revert`) se traducen a lenguaje natural en español.
- **Modo administrador** — la UI detecta al `owner` del registro y habilita el panel de gestión.

---

## 🛠️ Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Blockchain** | Ethereum (Sepolia Testnet · Localhost Hardhat) |
| **Smart Contracts** | Solidity 0.8.21, optimizer 200 runs, `viaIR: true` |
| **Framework de contratos** | Hardhat 2.22 + Ethers.js v6 |
| **Testing contratos** | Mocha + Chai + Hardhat Network Helpers |
| **Frontend** | React 18, Vite 5, JavaScript (JSX) |
| **Estilos** | CSS custom (tokens semánticos en `:root`) + Tailwind utilities |
| **Web3 client** | Ethers.js v6 |
| **Wallet** | MetaMask (cualquier proveedor EIP-1193) |
| **Notificaciones** | react-toastify v10 |
| **Fechas** | date-fns v3 (locale `es`) |
| **Verificación** | Etherscan API + `@nomicfoundation/hardhat-verify` |
| **Cobertura** | solidity-coverage |
| **Gas reporter** | hardhat-gas-reporter |

---

## 🏛️ Arquitectura

Sistema de **factory pattern** con tres contratos principales coordinados:

```
                    ┌──────────────────────┐
                    │   VoterRegistry      │
                    │  (whitelist única)   │◄──────┐
                    └──────────────────────┘       │
                              ▲                    │
                              │ consulta           │
                              │ isRegistered()     │
                              │                    │
                    ┌─────────┴────────────┐       │
                    │   ElectionFactory    │       │
                    │  (despliega elecc.)  │───────┤
                    └──────────────────────┘       │
                              │                    │
                              │ deploys            │
                              ▼                    │
                ┌─────────────────────────────┐    │
                │   Election (instancia N)    │────┘
                │  - candidatos               │
                │  - votos                    │
                │  - ventana de tiempo        │
                │  - votingType + maxChoices  │
                └─────────────────────────────┘
```

**Por qué factory:** cada elección vive en su propio contrato, completamente aislada. Los votos, candidatos y ventana de tiempo de una elección no pueden afectar a otra. La factory simplemente mantiene un índice (`address[]`) de las elecciones creadas.

**Frontend ↔ Blockchain:**

- `App.jsx` es el contenedor de estado: maneja la conexión de billetera, instancia los contratos, refresca datos cada 15 segundos y orquesta las transacciones.
- Los componentes hijos son presentacionales: reciben datos vía props y disparan handlers (`onVote`, `onCreate`, `onRegister`).
- `utils/web3.js` encapsula la conexión Ethers y la conmutación de red (Sepolia 11155111 o localhost 31337).
- Las ABIs de los contratos viven en `frontend/src/abi/*.js` como strings (formato human-readable de Ethers v6).

---

## 📁 Estructura del proyecto

```
blockchain-voting/
├── contracts/                          # Contratos Solidity
│   ├── interfaces/
│   │   └── IRegistry.sol               # Interfaz del registro de votantes
│   ├── VoterRegistry.sol               # Whitelist de votantes (owner-controlled)
│   ├── ElectionFactory.sol             # Factory que despliega elecciones
│   ├── Election.sol                    # Instancia individual de elección
│   ├── Registry.sol                    # (Legacy — no usado)
│   └── Voting.sol                      # (Legacy — no usado)
│
├── scripts/                            # Scripts Hardhat
│   ├── deploy.js                       # Despliegue de Registry + Factory
│   ├── seed.js                         # Pobla el nodo local con datos demo
│   ├── verify.js                       # Verifica contratos en Etherscan
│   └── health-check.js                 # Diagnóstico rápido del estado del nodo
│
├── test/
│   └── Voting.test.js                  # Suite Mocha/Chai (18 tests)
│
├── frontend/                           # Aplicación React + Vite
│   ├── src/
│   │   ├── abi/                        # ABIs de los contratos (strings Ethers)
│   │   │   ├── election.js
│   │   │   ├── factory.js
│   │   │   └── registry.js
│   │   ├── components/
│   │   │   ├── admin/                  # Subcomponentes del panel admin
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── SectionResumen.jsx
│   │   │   │   ├── SectionUsuarios.jsx
│   │   │   │   ├── SectionVotaciones.jsx
│   │   │   │   ├── SectionResultados.jsx
│   │   │   │   └── DashboardChart.jsx
│   │   │   ├── App.jsx (lógica principal)
│   │   │   ├── LandingPage.jsx         # Pantalla previa a conectar billetera
│   │   │   ├── ConnectWallet.jsx       # Chip + identicon de cuenta activa
│   │   │   ├── Home.jsx                # Inicio post-login con accesos rápidos
│   │   │   ├── CastVote.jsx            # Emisión de votos (radio / checkbox)
│   │   │   ├── VoteConfirmModal.jsx    # Confirmación pre-firma
│   │   │   ├── VoteReceipt.jsx         # Comprobante de voto post-tx
│   │   │   ├── ElectionViewer.jsx      # Resultados con barras de progreso
│   │   │   ├── ElectionStatus.jsx      # Badge de estado (próxima/activa/finalizada)
│   │   │   ├── ElectionDetailModal.jsx # Detalle expandido de una elección
│   │   │   ├── CreateElection.jsx      # Formulario para crear elecciones
│   │   │   ├── RegisterVoter.jsx       # Autorización de participantes
│   │   │   ├── AuditPanel.jsx          # Bitácora pública con modo privado
│   │   │   ├── ActivityFeed.jsx        # Feed de actividad del admin
│   │   │   ├── HashVisual.jsx          # Identicon SVG determinístico
│   │   │   ├── ChatBot.jsx             # Asistente virtual
│   │   │   ├── ChatBotButton.jsx       # FAB del chatbot
│   │   │   └── ErrorBoundary.jsx       # Captura errores de render
│   │   ├── data/                       # Datos estáticos (FAQ del chatbot, etc.)
│   │   ├── styles/
│   │   │   └── globals.css             # Tokens, layout, temas por sección
│   │   ├── utils/
│   │   │   ├── web3.js                 # Conexión Ethers + ensureNetwork
│   │   │   ├── electionUtils.js        # Helpers de estado/ganador
│   │   │   ├── auditEvents.js          # Lectura de eventos on-chain
│   │   │   ├── chatbotStorage.js       # Persistencia de configuración FAQ
│   │   │   └── receiptStorage.js       # localStorage de comprobantes
│   │   └── main.jsx                    # Entry point (monta <App />)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── docs/                               # Documentación técnica
│   ├── PRIVACY.md                      # Modelo de privacidad y trade-offs
│   ├── ARCHITECTURE-DECISIONS.md       # ADR (Architecture Decision Records)
│   ├── TESTING.md                      # Estrategia de pruebas
│   ├── arquitectura.md                 # Diagrama de arquitectura
│   ├── endpoints_api.md                # Catálogo de funciones públicas
│   └── modelo_dominio.md               # Modelo de dominio
│
├── hardhat.config.js                   # Configuración Hardhat (redes, solc)
├── package.json                        # Scripts de contratos
├── .env.example
├── frontend/.env.example
└── README.md
```

---

## 🔐 Modelo de contratos

### `VoterRegistry.sol`
Whitelist controlada por el `owner`. Implementa `IRegistry`.

- `registerVoter(address)` — solo owner; agrega un votante al registro.
- `isRegistered(address) → bool` — consulta pública.
- `getTotalRegistered() → uint256` — contador total.
- Eventos: `VoterRegistered(address indexed voter)`.

### `ElectionFactory.sol`
Despliega instancias de `Election` y mantiene un índice.

- `createElection(name, description, candidates[], startTime, endTime, votingType, maxChoices) → address`
  - `votingType: 0` (SINGLE_CHOICE) → fuerza `maxChoices = 1`
  - `votingType: 1` (MULTIPLE_CHOICE) → exige `maxChoices ≥ 2` y `≤ candidates.length`
- `getElections() → address[]` — lista de todas las elecciones creadas.
- Eventos: `ElectionCreated(address indexed electionAddress, string name, uint256 startTime, uint256 endTime)`.

### `Election.sol`
Una elección individual. Estado y lógica autónomos.

**Variables clave:**
- `enum VotingType { SINGLE_CHOICE, MULTIPLE_CHOICE }`
- `Candidate { string name; uint256 votes }`
- `mapping(address => bool) hasVoted`
- `startTime`, `endTime`, `closed`, `votingType`, `maxChoices`

**Funciones de votación:**
- `voteSingle(uint256 candidateId)` — solo para elecciones SINGLE_CHOICE.
- `voteMultiple(uint256[] candidateIds)` — solo para MULTIPLE_CHOICE; valida longitud `[1, maxChoices]`, rechaza duplicados.

**Validaciones (todos los `require`):**
- `Election not started` / `Election ended` — fuera de ventana.
- `Already voted` — doble voto bloqueado.
- `Not authorized` — votante no registrado.
- `Invalid candidate` — índice fuera de rango.
- `Wrong voting type` — usar `voteSingle` en elección múltiple o viceversa.
- `Too many choices` — más opciones que `maxChoices`.
- `Duplicate candidate` — mismo candidato repetido en voto múltiple.
- `Admin cannot vote` — el administrador no puede votar en su propia elección.

**Lectura pública:**
- `getCandidates() → Candidate[]`
- `totalVotes() → uint256`
- `isActive() → bool`

**Eventos:**
- `VoteCast(address indexed voter, uint256 indexed candidateId)`
- `VoteMultipleCast(address indexed voter, uint256[] candidateIds)`
- `ElectionClosed(address indexed executor, uint256 totalVotes)`

---

## 📋 Requisitos previos

- **Node.js** ≥ 18 ([descargar](https://nodejs.org))
- **npm** ≥ 9 (incluido con Node)
- **Git**
- **MetaMask** instalado en el navegador ([metamask.io](https://metamask.io))
- (Opcional) **Etherscan API key** para verificar contratos en Sepolia
- (Opcional) **Infura/Alchemy API key** para RPC de Sepolia

Verifica las versiones:
```bash
node --version    # debe imprimir v18 o superior
npm --version     # debe imprimir 9 o superior
```

---

## 📦 Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/tomasof7/blockchain-voting.git
cd blockchain-voting

# 2. Instala dependencias del backend (Hardhat + contratos)
npm install

# 3. Instala dependencias del frontend
cd frontend
npm install
cd ..
```

---

## 🔑 Configuración de variables de entorno

### Raíz del proyecto

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

Edita `.env`:
```env
# RPC endpoint de Sepolia (Infura, Alchemy, etc.)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/TU_API_KEY

# Llave privada de la cuenta deployer (SIN comillas, SIN 0x si Hardhat lo agrega)
PRIVATE_KEY=tu_llave_privada_aqui

# API key de Etherscan (opcional, solo para verificación)
ETHERSCAN_API_KEY=tu_api_key_etherscan

# Direcciones de contratos ya desplegados (opcional, las usa seed.js)
REGISTRY_ADDRESS=
FACTORY_ADDRESS=

# Habilita gas reporter en tests (opcional)
REPORT_GAS=false
```

### Frontend

```bash
cp frontend/.env.example frontend/.env
```

Edita `frontend/.env`:
```env
# Direcciones de los contratos desplegados
VITE_CONTRACT_REGISTRY_ADDRESS=0x...
VITE_CONTRACT_FACTORY_ADDRESS=0x...

# Red por defecto: "localhost" o "sepolia"
VITE_NETWORK=localhost
```

> ⚠️ **Nunca subas tu `.env` al repositorio.** Ya está incluido en `.gitignore`.

---

## 🏃 Flujo de desarrollo local

Necesitas **3 terminales** abiertas en el directorio raíz del proyecto.

### Terminal 1 — Nodo Hardhat local

```bash
npm run node
```

Espera hasta ver el mensaje:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

Esto te entrega 20 cuentas de prueba con 10000 ETH cada una. La primera cuenta (`Account #0`) será el **administrador** (owner del Registry).

### Terminal 2 — Desplegar contratos + sembrar datos demo

```bash
npm run deploy:localhost
npm run seed:localhost
```

`deploy.js` despliega `VoterRegistry` y `ElectionFactory`, y **actualiza automáticamente** `frontend/.env` con las nuevas direcciones.

`seed.js` registra dos votantes (Account #1 y Account #2) y crea dos elecciones demo:
- **"Elección Demo - Única"** — selección única, 2 opciones.
- **"Elección Demo - Múltiple"** — selección múltiple (hasta 2), 3 opciones.

### Terminal 3 — Servidor de desarrollo del frontend

```bash
cd frontend
npm run dev
```

Abre en el navegador: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Despliegue a Sepolia

### Pre-requisitos
1. Una cuenta en Sepolia con ETH de prueba ([faucet Alchemy](https://sepoliafaucet.com))
2. `SEPOLIA_RPC_URL` y `PRIVATE_KEY` configuradas en `.env`

### Despliegue
```bash
npm run deploy:sepolia
```

El script imprimirá las direcciones de los contratos. Copia ambas a `frontend/.env`:
```env
VITE_CONTRACT_REGISTRY_ADDRESS=0x...
VITE_CONTRACT_FACTORY_ADDRESS=0x...
VITE_NETWORK=sepolia
```

### Verificación en Etherscan (opcional)
```bash
npm run verify
```

Esto publica el código fuente verificado de tus contratos en [sepolia.etherscan.io](https://sepolia.etherscan.io).

---

## 🦊 Configuración de MetaMask

### Para usar el nodo local (Hardhat)

1. Abre MetaMask → click en el selector de red → **"Add network"** → **"Add a network manually"**.
2. Completa:
   - **Network name:** Hardhat Localhost
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337` (algunos clientes esperan `1337`; la app conmuta automáticamente)
   - **Currency symbol:** ETH
3. **Importar cuenta admin:**
   - En Terminal 1, copia la llave privada de `Account #0` que imprime Hardhat al iniciar.
   - MetaMask → cuenta → **"Import account"** → pega la llave privada.
   - Esa cuenta será el administrador (owner del Registry).

### Para Sepolia

MetaMask ya incluye Sepolia. Si no la ves: Settings → Advanced → **"Show test networks"**.

> 💡 La aplicación detecta la red automáticamente y solicita el cambio si estás en una red incorrecta.

---

## ⚙️ Comandos disponibles

### Raíz del proyecto (contratos)

| Comando | Descripción |
|---------|-------------|
| `npm run compile` | Compila los contratos Solidity |
| `npm test` | Ejecuta la suite de pruebas completa (18 tests) |
| `npm run test:coverage` | Genera reporte de cobertura de contratos |
| `npm run node` | Inicia un nodo Hardhat local (chainId 1337, puerto 8545) |
| `npm run deploy:localhost` | Despliega contratos al nodo local |
| `npm run deploy:sepolia` | Despliega contratos a Sepolia |
| `npm run seed:localhost` | Pobla el nodo local con votantes y elecciones demo |
| `npm run verify` | Verifica los contratos en Etherscan |

### Frontend (`cd frontend`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Build de producción a `dist/` |
| `npm run preview` | Sirve el build de producción para inspección local |

---

## 🧪 Suite de pruebas

La suite cubre **18 tests** distribuidos así:

- **Registro y factory** (2 tests):
  - Registra votantes correctamente
  - Crea elecciones desde la factory

- **Selección Única — SINGLE_CHOICE** (7 tests):
  - Permite `voteSingle` en elección single
  - Rechaza `voteMultiple` en elección single
  - Impide votar dos veces
  - Rechaza candidato inválido
  - Bloquea voto fuera de ventana de tiempo
  - Conteo correcto por candidato
  - Impide al admin votar en su propia elección

- **Selección Múltiple — MULTIPLE_CHOICE** (9 tests):
  - Permite `voteMultiple` en elección multiple
  - Suma un voto a cada candidato seleccionado
  - Rechaza `voteSingle` en elección multiple
  - Rechaza más opciones que `maxChoices`
  - Rechaza candidatos duplicados
  - Rechaza candidato inválido
  - Impide votar dos veces
  - Rechaza array vacío
  - Impide al admin votar en su propia elección

```bash
npm test
# ✔ 18 passing (~450ms)
```

---

## 👤 Flujo de usuario

### Como administrador
1. Abre la plataforma → click en **"Iniciar sesión segura"** (conecta MetaMask con la cuenta admin).
2. La app detecta que eres `owner` del Registry → habilita la pestaña **"Panel Admin"**.
3. **Autorizar participantes:** pestaña **Usuarios** → ingresa una dirección Ethereum → click en **"Registrar"** → confirma en MetaMask.
4. **Crear elección:** pestaña **Votaciones** → completa nombre, descripción, opciones (separadas por coma), tipo (única/múltiple), tiempos → **"Crear elección"** → confirma en MetaMask.
5. **Consultar:**
   - **Resumen** — dashboard con gráficas y stats.
   - **Resultados** — conteo en tiempo real.
   - **Bitácora pública** (`AuditPanel`) — todos los eventos blockchain con modo privado.

### Como votante
1. Click en **"Iniciar sesión segura"** (con una cuenta previamente autorizada por el admin).
2. **Inicio** — accesos rápidos a votar y ver resultados.
3. **Votar:** selecciona una elección → marca opción(es) → **"Revisar y emitir voto"** → confirma en modal → confirma en MetaMask.
4. Recibe **comprobante de voto** con hash de transacción + número de bloque.
5. **Resultados** — consulta el conteo en cualquier momento (también post-elección).

---

## 🔒 Modelo de privacidad

La plataforma usa un **modelo de pseudo-anonimato**:

- ✅ **Lo que es público (necesario para auditoría):**
  - Las direcciones (wallets) registradas como votantes válidos.
  - El hecho de que una wallet emitió un voto en una elección específica.
  - El conteo total por candidato.
  - El timestamp y número de bloque de cada voto.

- 🔐 **Lo que NO es público (privacidad razonable):**
  - La **identidad real** detrás de cada wallet (la app no almacena nombres, cédulas ni correos asociados a las direcciones).
  - **Por candidato no se expone el votante en la UI** — el panel de auditoría incluye un toggle para ocultar direcciones a usuarios no-admin, sustituyendo por un identicon SVG determinístico.

> Para detalles completos del modelo, riesgos conocidos y mejoras futuras (commit-reveal schemes, zk-SNARKs), ver [`docs/PRIVACY.md`](docs/PRIVACY.md).

---

## 🐛 Solución de problemas

### "Pantalla en blanco al registrar/votar"
Asegúrate de tener una sola instancia de `<ToastContainer />` (corregido en este repo). Si recientemente hiciste pull y el bug persiste, hard-refresh con `Cmd+Shift+R` / `Ctrl+Shift+R`.

### "MetaMask muestra Insufficient funds"
En localhost: importaste una cuenta incorrecta. Usa una de las 20 cuentas que imprime Hardhat al iniciar (cada una tiene 10000 ETH).
En Sepolia: pide ETH en un faucet ([sepoliafaucet.com](https://sepoliafaucet.com)).

### "La elección aparece como finalizada inmediatamente"
El nodo Hardhat tiene un reloj que avanza por bloque, no por tiempo real. Si reinicias el nodo, vuelve a ejecutar `seed:localhost` para crear elecciones con tiempos frescos.

### "Faltan VITE_CONTRACT_..."
No copiaste las direcciones del deploy al `frontend/.env`. `deploy.js` lo hace automáticamente — si no, edítalo manualmente.

### "Already voted" al intentar votar
Esa cuenta ya votó en esa elección. El contrato bloquea doble voto. Importa otra cuenta autorizada o autoriza una nueva como admin.

### "Wrong network"
La app intentará conmutar la red automáticamente. Si MetaMask rechaza, agrégala manualmente (ver sección [Configuración de MetaMask](#-configuración-de-metamask)).

### Health check
Hay un script de diagnóstico rápido:
```bash
node scripts/health-check.js
```

---

## 📚 Documentación adicional

- [`docs/PRIVACY.md`](docs/PRIVACY.md) — Modelo de privacidad detallado, riesgos y mejoras futuras (commit-reveal, zk-SNARKs).
- [`docs/ARCHITECTURE-DECISIONS.md`](docs/ARCHITECTURE-DECISIONS.md) — ADRs (decisiones de arquitectura registradas).
- [`docs/TESTING.md`](docs/TESTING.md) — Estrategia y cobertura de pruebas.
- [`docs/arquitectura.md`](docs/arquitectura.md) — Diagrama de arquitectura.
- [`docs/endpoints_api.md`](docs/endpoints_api.md) — Catálogo de funciones públicas de los contratos.
- [`docs/modelo_dominio.md`](docs/modelo_dominio.md) — Modelo de dominio del sistema.
- [`CLAUDE.md`](CLAUDE.md) — Guía de comandos y arquitectura para asistentes de código.

---

## 📄 Licencia

MIT © 2026 — Proyecto de Grado · Tomás Ortega Fernández
