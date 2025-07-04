const hre = require("hardhat");

async function main() {
  const ConsentRegistry = await hre.ethers.getContractFactory("ConsentRegistry");
  console.log("Deploying ConsentRegistry...");
  
  const contract = await ConsentRegistry.deploy();
  // In ethers v6, the contract is already deployed at this point, just need to wait for it
  await contract.waitForDeployment();

  console.log(`ConsentRegistry deployed to: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
