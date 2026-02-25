const hre = require("hardhat");

async function main() {
  // Desplegar VoterRegistry
  const Registry = await hre.ethers.deployContract("VoterRegistry");
  await Registry.waitForDeployment();
  const registryAddress = await Registry.getAddress();
  console.log("✅ Registry:", registryAddress);

  // Desplegar ElectionFactory
  const Factory = await hre.ethers.deployContract("ElectionFactory", [registryAddress]);
  await Factory.waitForDeployment();
  const factoryAddress = await Factory.getAddress();
  console.log("✅ ElectionFactory:", factoryAddress);

  console.log(`REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`FACTORY_ADDRESS=${factoryAddress}`);

  return { registryAddress, factoryAddress };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
