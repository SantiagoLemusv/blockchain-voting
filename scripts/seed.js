const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const registryAddress =
    process.env.REGISTRY_ADDRESS || process.env.VITE_CONTRACT_REGISTRY_ADDRESS;
  const factoryAddress =
    process.env.FACTORY_ADDRESS || process.env.VITE_CONTRACT_FACTORY_ADDRESS;

  if (!registryAddress || !factoryAddress) {
    throw new Error(
      "Faltan direcciones de contrato. Define REGISTRY_ADDRESS y FACTORY_ADDRESS en .env"
    );
  }

  const [owner, voter1, voter2] = await ethers.getSigners();

  const Registry = await ethers.getContractFactory("VoterRegistry");
  const registry = Registry.attach(registryAddress);

  const Factory = await ethers.getContractFactory("ElectionFactory");
  const factory = Factory.attach(factoryAddress);

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
  const endTime = startTime + 3600;
  const options = ["Opcion A", "Opcion B"];

  const tx = await factory.createElection(
    "Eleccion Demo",
    "Creada por script seed",
    options,
    startTime,
    endTime
  );
  const receipt = await tx.wait();

  // obtener dirección de la elección creada
  const event = receipt.logs
    .map((l) => factory.interface.parseLog(l))
    .find((e) => e && e.name === "ElectionCreated");
  const electionAddress = event?.args?.electionAddress;

  console.log("✅ Elección demo creada:", electionAddress);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
