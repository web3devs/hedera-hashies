// Import the NFTStorage class and File constructor from the 'nft.storage' package
import { NFTStorage, File } from 'nft.storage'

const NFT_STORAGE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGM1MWVkZjMyRTU5ODcxNUZjOTQxMmNiOTE1MTVmN2RmZDMxQzFDNzMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NTQ3NzU5MjAzOSwibmFtZSI6Imhhc2hpZXMifQ.jZNdhVW6OY2mdG-laDSxa2Tcd4pTztofmyI-mywPJUk'

/**
 * Reads an image file from `imagePath` and stores an NFT with the given name and description.
 * @param {File} image the path to an image file
 * @param {string} name a name for the NFT
 * @param {string} description a text description for the NFT
 */
const storeNFT = async (image: File, name: string, description: string) => {
  // create a new NFTStorage client using our API key
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

  // call client.store, passing in the image & metadata
  return nftstorage.store({
    image,
    name,
    description
  })
}

export { storeNFT }
