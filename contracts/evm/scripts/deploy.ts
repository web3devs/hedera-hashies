import { ethers, upgrades } from 'hardhat'

async function main() {
  const Hashies = await ethers.getContractFactory("Hashies");
  const implementation = await upgrades.deployProxy(Hashies, [])
  await implementation.deployed();

  console.log(`Hashies contract deployed to ${implementation.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
