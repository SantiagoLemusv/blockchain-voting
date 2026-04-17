const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const registryAddress =
    process.env.REGISTRY_ADDRESS || process.env.VITE_CONTRACT_REGISTRY_ADDRESS;
  const factoryAddress =
    process.env.FACTORY_ADDRESS || process.env.VITE_CONTRACT_FACTORY_ADDRESS;
  const [owner, voter1, voter2] = await ethers.getSigners();

  const Registry = await ethers.getContractFactory("VoterRegistry");
  const Factory = await ethers.getContractFactory("ElectionFactory");

  // Si no hay direcciones o la dirección no tiene código, desplegar de cero
  let registry, factory;
  const provider = ethers.provider;

  const hasCode = async (addr) => {
    if (!addr) return false;
    const code = await provider.getCode(addr);
    return code && code !== "0x";
  };

  let regAddr = registryAddress;
  if (!(await hasCode(regAddr))) {
    const regDep = await Registry.deploy();
    await regDep.waitForDeployment();
    regAddr = await regDep.getAddress();
    console.log("🚀 Desplegado Registry:", regAddr);
  }
  registry = Registry.attach(regAddr);

  let facAddr = factoryAddress;
  if (!(await hasCode(facAddr))) {
    const facDep = await Factory.deploy(regAddr);
    await facDep.waitForDeployment();
    facAddr = await facDep.getAddress();
    console.log("🚀 Desplegado Factory:", facAddr);
  }
  factory = Factory.attach(facAddr);

  console.log(`Usando REGISTRY_ADDRESS=${regAddr}`);
  console.log(`Usando FACTORY_ADDRESS=${facAddr}`);

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
