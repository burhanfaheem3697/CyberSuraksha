const hre = require("hardhat");

async function main() {
  const DocumentVerifier = await hre.ethers.getContractFactory("DocumentVerifier");
  console.log("Deploying DocumentVerifier...");

  const contract = await DocumentVerifier.deploy();
  await contract.waitForDeployment();

  console.log(`DocumentVerifier deployed to: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
