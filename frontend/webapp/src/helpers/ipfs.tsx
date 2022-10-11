// Import the NFTStorage class and File constructor from the 'nft.storage' package
import { NFTStorage, File } from 'nft.storage'

// The 'mime' npm package helps us set the correct file type on our File objects
import mime from 'mime'

// // The 'fs' builtin module on Node.js provides access to the file system
// import fs from 'fs'

const NFT_STORAGE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGM1MWVkZjMyRTU5ODcxNUZjOTQxMmNiOTE1MTVmN2RmZDMxQzFDNzMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NTQ3NzU5MjAzOSwibmFtZSI6Imhhc2hpZXMifQ.jZNdhVW6OY2mdG-laDSxa2Tcd4pTztofmyI-mywPJUk'

/**
 * Reads an image file from `imagePath` and stores an NFT with the given name and description.
 * @param {string} imagePath the path to an image file
 * @param {string} name a name for the NFT
 * @param {string} description a text description for the NFT
 */
const storeNFT = async (
  imagePath: string,
  name: string,
  description: string
) => {
  // load the file from disk
  const image = await fileFromPath(imagePath)

  // create a new NFTStorage client using our API key
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

  // call client.store, passing in the image & metadata
  return nftstorage.store({
    image,
    name,
    description
  })
}

/**
 * A helper to read a file from a location on disk and return a File object.
 * Note that this reads the entire file into memory and should not be used for
 * very large files.
 * @param {string} filePath the path to a file to store
 * @returns {File} a File object containing the file content
 */
const fileFromPath = async (filePath: string) => {
  const pts = filePath.split('/')
  const bname = pts[pts.length - 1]
  const response = await fetch(filePath)
  const content = await response.blob()
  const type = mime.getType(filePath)

  return new File([content], bname, {
    type: type ? type : undefined
  })
}

export { storeNFT, fileFromPath }
