# 🗳️ Sistema de Votación Blockchain  
**Proyecto de Grado** — Plataforma de votación descentralizada sobre Ethereum (Sepolia Testnet)

## 🚀 Características
- Registro seguro de votantes
- Elecciones con múltiples opciones
- Voto único verificable
- Resultados en tiempo real
- Auditoría completa on-chain

## 🛠️ Stack
- **Blockchain:** Ethereum (Sepolia)
- **Smart Contracts:** Solidity 0.8.21
- **Framework:** Hardhat + Ethers.js
- **Frontend:** React 18, Vite, Tailwind CSS
- **Wallet:** MetaMask

## 📁 Estructura
```
blockchain-voting/
├── contracts/       # Contratos inteligentes
├── scripts/         # Scripts de despliegue/verificación
├── test/            # Pruebas unitarias
├── frontend/        # Aplicación web React
├── docs/            # Documentación técnica (SRS, arquitectura)
├── docker/          # Configuración Docker (pendiente)
└── hardhat.config.js
```

## ⚙️ Requisitos
- Node.js ≥ 18
- npm ≥ 9
- MetaMask instalado (para pruebas en Sepolia)
- Variables de entorno configuradas (ver siguiente sección)

## 🔐 Variables de entorno
1) Copia los ejemplos:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```
2) Completa en `.env`:
- `SEPOLIA_RPC_URL` — endpoint de Infura/Alchemy
- `PRIVATE_KEY` — llave de la cuenta deployer (sin comillas)
- `ETHERSCAN_API_KEY` — opcional para verificación
- `REPORT_GAS` — opcional (`true`) para habilitar gas reporter
3) Completa en `frontend/.env` las direcciones una vez desplegados:
- `VITE_CONTRACT_REGISTRY_ADDRESS`
- `VITE_CONTRACT_FACTORY_ADDRESS`

## 🏃‍♂️ Pasos para reproducir
### Backend (Hardhat)
```bash
npm install
npm run compile
npm test
npm run node                      # nodo local
# nueva terminal
npm run deploy:localhost          # despliega VoterRegistry y ElectionFactory
npm run seed:localhost            # registra 2 votantes y crea elección demo
```

### Despliegue a Sepolia
```bash
npm run deploy:sepolia
# opcional: npm run verify  (requiere ETHERSCAN_API_KEY)
```
Guarda las direcciones que imprime `scripts/deploy.js` y colócalas en `frontend/.env`.

### Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```
En `frontend/.env` define `VITE_CONTRACT_REGISTRY_ADDRESS` y `VITE_CONTRACT_FACTORY_ADDRESS` (de tu despliegue). La UI detecta si eres admin (owner del Registry) y habilita registrar votantes / crear elecciones.

## 🔄 Flujo de ramas
- `main`: estable, listo para presentación.
- `develop`: integración continua. Crea branches de feature desde aquí y abre PRs.

## ✅ Checklist previo a subir al remoto
- [ ] `.env.example` y `frontend/.env.example` con placeholders actualizados
- [ ] `README` con pasos reproducibles (este archivo)
- [ ] `hardhat.config.js` válido y sin llaves privadas
- [ ] `node_modules` ignorado en `.gitignore`
- [ ] Pruebas locales: `npm test`
- [ ] Direcciones de contratos copiadas al frontend tras despliegue

## 📄 Licencia
MIT © 2024 Proyecto de Grado
