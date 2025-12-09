\# Arquitectura del Sistema



\## Diagrama de Componentes



┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐

│ Frontend │ │ Smart │ │ Blockchain │

│ React App │◄──►│ Contracts │◄──►│ Ethereum │

│ │ │ │ │ Sepolia │

└─────────────────┘ └─────────────────┘ └─────────────────┘

│ │ │

│ │ │

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐

│ MetaMask │ │ Hardhat │ │ Infura/Alchemy│

│ Wallet │ │ Dev Tools │ │ RPC Nodes │

└─────────────────┘ └─────────────────┘ └─────────────────┘

text





\## Stack Tecnológico



\### Capa Blockchain

\- \*\*Ethereum Sepolia\*\*: Red de pruebas

\- \*\*Solidity 0.8.21\*\*: Lenguaje de contratos

\- \*\*Hardhat\*\*: Entorno de desarrollo

\- \*\*Ethers.js\*\*: Biblioteca Web3



\### Frontend

\- \*\*React 18 + Vite\*\*: Framework y bundler

\- \*\*Tailwind CSS\*\*: Estilos

\- \*\*React Toastify\*\*: Notificaciones



\### Infraestructura

\- \*\*MetaMask\*\*: Wallet y proveedor

\- \*\*GitHub Actions\*\*: CI/CD

\- \*\*Docker\*\*: Contenedorización

