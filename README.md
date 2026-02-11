Sistema de Votación Blockchain - Plataforma de votación descentralizada con Ethereum

\## Características:
\- ✅ Registro seguro de votantes
\- ✅ Plataforma adaptable, segura, confiable.
\- ✅ Voto único verificable con Sistema de Auditoría Transparente y Participativa (SATP)
\- ✅ Resultados en tiempo real con panel de Resultados con Métricas de Confianza y Participación
\- ✅ Asistente inteligente para facilitar la comprensión del proceso de votación y la información sobre las opciones, sin influir en la decisión del votante.


\##  Tecnologías

\- \*\*Blockchain\*\*: Ethereum (Sepolia Testnet)

\- \*\*Smart Contracts\*\*: Solidity 0.8.21

\- \*\*Desarrollo\*\*: Hardhat, Ethers.js

\- \*\*Frontend\*\*: React 18, Vite, Tailwind CSS

\- \*\*Wallet\*\*: MetaMask

\## Estructura del Proyecto
blockchain-voting/
├── contracts/ # Contratos inteligentes
├── scripts/ # Scripts de despliegue
├── test/ # Pruebas unitarias
├── frontend/ # Aplicación web React
├── docs/ # Documentación técnica
└── docker/ # Configuración Docker


\##  Inicio Rápido


\### 1. Instalar dependencias

```bash
npm install

2\. Configurar variables

bash
cp .env.example .env

\# Edita .env con tus claves

3\. Compilar contratos

bash
npm run compile

4\. Ejecutar pruebas

bash
npm test

5\. Desplegar localmente

bash
npm run node

\# En otra terminal:

npm run deploy:localhost

6\. Iniciar frontend

bash

cd frontend
npm install
npm run dev

Redes
&nbsp;   Local: http://localhost:3000
&nbsp;   Sepolia: https://sepolia.etherscan.io

📄 Licencia
MIT © 2026 Proyecto de Grado

