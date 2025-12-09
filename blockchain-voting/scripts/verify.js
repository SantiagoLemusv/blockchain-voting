const hre = require("hardhat");

async function main() {
  console.log(" Verificando contratos...");
  
  // Aquí iría la lógica de verificación
  console.log("✅ Script de verificación listo");
  console.log("📌 Ejecuta: npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>");
}

main().catch(console.error);