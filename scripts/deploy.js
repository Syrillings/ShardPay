// scripts/deploy.js
import hre from "hardhat";

async function main() {
  // Get the contract factory
  const Vault = await hre.ethers.getContractFactory("Vault");
  
  // Deploy the contract
  const vault = await Vault.deploy();
  await vault.deployed(); // wait for deployment

  console.log("Vault deployed to:", vault.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
