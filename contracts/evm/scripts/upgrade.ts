require('dotenv').config();
import { ethers, upgrades } from 'hardhat'

const HASHIES_PROXY_ADDRESS = process.env.HASHIES_PROXY_ADDRESS
const AURORA_PRIVATE_KEY = process.env.AURORA_PRIVATE_KEY

async function main() {
  const provider = ethers.provider;
  const deployerWallet = new ethers.Wallet(AURORA_PRIVATE_KEY, provider);

  const Hashies = await ethers.getContractFactory("Hashies");
  const implementation = await upgrades.upgradeProxy(HASHIES_PROXY_ADDRESS, Hashies)
  await implementation.deployed();

  console.log(`Hashies contract upgraded`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



