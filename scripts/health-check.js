const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function checkHealth() {
  console.log("🏥 Health Check - Sistema Local\n");

  const checks = {
    "✅ RPC disponible": false,
    "✅ Registry desplegado": false,
    "✅ Factory desplegado": false,
    "✅ Registry tiene votantes": false,
    "✅ Root .env completo": false,
    "✅ Frontend .env completo": false,
    "✅ ABIs presentes": false,
  };

  try {
    // Check 1: RPC disponible
    try {
      const blockNumber = await ethers.provider.getBlockNumber();
      checks["✅ RPC disponible"] = true;
      console.log(`  ✓ RPC en puerto 8545 disponible (bloque ${blockNumber})`);
    } catch (err) {
      console.log(`  ✗ RPC no responde (asegúrate que 'npm run node' corre)`);
      return;
    }

    // Check 2 & 3: Contratos desplegados
    const registryAddr = process.env.REGISTRY_ADDRESS;
    const factoryAddr = process.env.FACTORY_ADDRESS;

    if (!registryAddr || !factoryAddr) {
      console.log(`  ✗ .env falta REGISTRY_ADDRESS o FACTORY_ADDRESS`);
      console.log(`    Ejecuta: npm run deploy:localhost`);
      return;
    }

    const regCode = await ethers.provider.getCode(registryAddr);
    const facCode = await ethers.provider.getCode(factoryAddr);

    if (regCode === "0x") {
      console.log(`  ✗ Registry no tiene código en ${registryAddr}`);
      console.log(`    Ejecuta: npm run deploy:localhost`);
      return;
    }
    checks["✅ Registry desplegado"] = true;
    console.log(`  ✓ Registry en ${registryAddr}`);

    if (facCode === "0x") {
      console.log(`  ✗ Factory no tiene código en ${factoryAddr}`);
      console.log(`    Ejecuta: npm run deploy:localhost`);
      return;
    }
    checks["✅ Factory desplegado"] = true;
    console.log(`  ✓ Factory en ${factoryAddr}`);

    // Check 4: Votantes semillados
    const Registry = await ethers.getContractFactory("VoterRegistry");
    const registry = Registry.attach(registryAddr).connect(ethers.provider);
    const totalVoters = await registry.getTotalRegistered();
    if (Number(totalVoters) > 0) {
      checks["✅ Registry tiene votantes"] = true;
      console.log(`  ✓ ${totalVoters} votantes registrados`);
    } else {
      console.log(`  ⚠ Sin votantes (ejecuta: npm run seed:localhost)`);
    }

    // Check 5: Root .env
    const rootEnv = path.resolve(__dirname, "../.env");
    if (fs.existsSync(rootEnv)) {
      const content = fs.readFileSync(rootEnv, "utf8");
      if (content.includes(registryAddr) && content.includes(factoryAddr)) {
        checks["✅ Root .env completo"] = true;
        console.log(`  ✓ .env actualizado con direcciones`);
      }
    }

    // Check 6: Frontend .env
    const frontendEnv = path.resolve(__dirname, "../frontend/.env");
    if (fs.existsSync(frontendEnv)) {
      const content = fs.readFileSync(frontendEnv, "utf8");
      if (
        content.includes(`VITE_CONTRACT_REGISTRY_ADDRESS=${registryAddr}`) &&
        content.includes(`VITE_CONTRACT_FACTORY_ADDRESS=${factoryAddr}`) &&
        content.includes("VITE_NETWORK=localhost")
      ) {
        checks["✅ Frontend .env completo"] = true;
        console.log(`  ✓ frontend/.env sincronizado`);
      } else {
        console.log(`  ⚠ frontend/.env desactualizado o incompleto`);
      }
    } else {
      console.log(`  ⚠ frontend/.env no existe (ejecuta: npm run deploy:localhost)`);
    }

    // Check 7: ABIs
    const abiDir = path.resolve(__dirname, "../frontend/src/abi");
    const requiredAbis = ["registry.js", "factory.js", "election.js"];
    const hasAllAbis = requiredAbis.every((f) => fs.existsSync(path.join(abiDir, f)));
    if (hasAllAbis) {
      checks["✅ ABIs presentes"] = true;
      console.log(`  ✓ Todas las ABIs presentes`);
    } else {
      console.log(`  ✗ Faltan ABIs. Ejecuta: npm run compile -- --force`);
    }
  } catch (err) {
    console.error(`  ✗ Error inesperado: ${err.message}`);
  }

  console.log("\n" + "=".repeat(50));
  const allPass = Object.values(checks).every((v) => v);
  if (allPass) {
    console.log("✅ Health check PASSED — Sistema listo");
    console.log("\nPróximo paso: cd frontend && npm run dev");
  } else {
    console.log("⚠️  Health check PARTIAL — Falta algo");
    console.log("\nRevisa los errores arriba para resolver.");
  }
}

checkHealth().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
