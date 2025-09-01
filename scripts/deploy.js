const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying Vault contract to Shardeum Unstablenet...")

  // Get the deployer account
  const [deployer] = await ethers.getSigners()
  console.log("Deploying with account:", deployer.address)

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address)
  console.log("Account balance:", ethers.formatEther(balance), "SHM")

  // Deploy the Vault contract
  const Vault = await ethers.getContractFactory("Vault")
  const vault = await Vault.deploy()

  await vault.waitForDeployment()
  const contractAddress = await vault.getAddress()

  console.log("Vault deployed to:", contractAddress)
  console.log("Transaction hash:", vault.deploymentTransaction().hash)

  // Verify deployment
  console.log("Verifying deployment...")
  let deployerBalance
  try {
    deployerBalance = await vault.balances(deployer.address)
    console.log("Deployer's initial balance in Vault:", deployerBalance.toString())
  } catch (err) {
    console.log("Vault contract has no balances() view or deployer balance is 0")
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: "shardeum-unstablenet",
    chainId: 8080,
    deploymentHash: vault.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
  }

  console.log("\n=== Deployment Complete ===")
  console.log("Contract Address:", contractAddress)
  console.log("Add this to your frontend environment variables:")
  console.log(`NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=${contractAddress}`)

  return deploymentInfo
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error)
    process.exit(1)
  })
