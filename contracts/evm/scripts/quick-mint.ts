require('dotenv').config();
import { ethers } from 'hardhat'

function getCollectionId(collectionRx: any) {
  const event = collectionRx.events.findIndex(ev => ev.event === 'CollectionCreated')
  const collectionId = collectionRx.events[event].args[1]
  return collectionId
}

async function main() {
  const provider = ethers.provider;
  const deployerWallet = new ethers.Wallet(process.env.AURORA_PRIVATE_KEY, provider);

  const Hashies = await ethers.getContractFactory("Hashies")
  const hashies = Hashies.connect(deployerWallet).attach("0x8d2bd8c2B963289674A922447c857D5938C1B05c")
  const collectionTx = await hashies.createCollection('Token Name', 'ipfs://fubar')
  const collectionId = getCollectionId(await collectionTx.wait())
  console.log('Collection:', collectionId.toString())

  const mintTx = await hashies.mint(collectionId)
  const mintRx = await mintTx.wait()
  console.log('minted')
  console.log(deployerWallet.address)

  const transferTx = await hashies.safeTransferFrom(
    deployerWallet.address, "0x352aBe22d01AC782bbe79A042B79964f770B91e2", collectionId, 1, '0x'
  )
  const transferRx = transferTx.wait()
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



