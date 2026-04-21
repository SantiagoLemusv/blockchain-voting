const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function updateEnvFile(filePath, updates) {
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}=${value}`;
    if (regex.test(content)) {
      content = content.replace(regex, line);
    } else {
      content += (content.endsWith("\n") || content === "" ? "" : "\n") + line + "\n";
    }
  }
  fs.writeFileSync(filePath, content);
}

async function main() {
  const Registry = await hre.ethers.deployContract("VoterRegistry");
  await Registry.waitForDeployment();
  const registryAddress = await Registry.getAddress();
  console.log("✅ VoterRegistry:", registryAddress);

  const Factory = await hre.ethers.deployContract("ElectionFactory", [registryAddress]);
  await Factory.waitForDeployment();
  const factoryAddress = await Factory.getAddress();
  console.log("✅ ElectionFactory:", factoryAddress);

  // Actualizar root .env
  const rootEnv = path.resolve(__dirname, "../.env");
  updateEnvFile(rootEnv, {
    REGISTRY_ADDRESS: registryAddress,
    FACTORY_ADDRESS: factoryAddress,
  });

  // Actualizar frontend/.env
  const frontendEnv = path.resolve(__dirname, "../frontend/.env");
  updateEnvFile(frontendEnv, {
    VITE_CONTRACT_REGISTRY_ADDRESS: registryAddress,
    VITE_CONTRACT_FACTORY_ADDRESS: factoryAddress,
    VITE_NETWORK: "localhost",
  });

  console.log("\n📝 .env y frontend/.env actualizados automáticamente.");
  console.log(`REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`FACTORY_ADDRESS=${factoryAddress}`);

  return { registryAddress, factoryAddress };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
