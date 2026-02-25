const hre = require("hardhat");

async function main() {
  // Desplegar Registry
  const Registry = await hre.ethers.deployContract("Registry");
  await Registry.waitForDeployment();
  const registryAddress = await Registry.getAddress();
  console.log("✅ Registry:", registryAddress);
  
  // Desplegar Voting
  const Voting = await hre.ethers.deployContract("Voting", [registryAddress]);
  await Voting.waitForDeployment();
  const votingAddress = await Voting.getAddress();
  console.log("✅ Voting:", votingAddress);
  console.log(`REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`VOTING_ADDRESS=${votingAddress}`);

  return { registryAddress, votingAddress };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
