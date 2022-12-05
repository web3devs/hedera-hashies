require('dotenv').config();
import { ethers, upgrades } from 'hardhat'

async function main() {
  const provider = ethers.provider;
  const deployerWallet = new ethers.Wallet(process.env.AURORA_PRIVATE_KEY, provider);

  const Hashies = await ethers.getContractFactory("Hashies");
  const implementation = await upgrades.deployProxy(Hashies, {})
  await implementation.deployed();

  console.log(`Hashies contract deployed to ${implementation.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



