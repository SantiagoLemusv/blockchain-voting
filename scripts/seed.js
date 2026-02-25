const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const registryAddress =
    process.env.REGISTRY_ADDRESS || process.env.VITE_CONTRACT_REGISTRY_ADDRESS;
  const votingAddress =
    process.env.VOTING_ADDRESS || process.env.VITE_CONTRACT_VOTING_ADDRESS;

  if (!registryAddress || !votingAddress) {
    throw new Error(
      "Faltan direcciones de contrato. Define REGISTRY_ADDRESS y VOTING_ADDRESS en .env"
    );
  }

  const [owner, voter1, voter2] = await ethers.getSigners();

  const Registry = await ethers.getContractFactory("Registry");
  const registry = Registry.attach(registryAddress);

  const Voting = await ethers.getContractFactory("Voting");
  const voting = Voting.attach(votingAddress);

  // Registrar votantes
  for (const v of [voter1.address, voter2.address]) {
    if (!(await registry.isRegistered(v))) {
      const tx = await registry.registerVoter(v);
      await tx.wait();
      console.log("✅ Registrado:", v);
    }
  }

  // Crear elección de ejemplo
  const latest = await ethers.provider.getBlock("latest");
  const startTime = Number(latest.timestamp) + 120;
  const duration = 3600;
  const options = ["Opcion A", "Opcion B"];

  const tx = await voting.createElection(
    "Eleccion Demo",
    "Creada por script seed",
    options,
    startTime,
    duration
  );
  await tx.wait();
  console.log("✅ Elección demo creada (ID 1)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
