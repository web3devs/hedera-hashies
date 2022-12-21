// Import the NFTStorage class and File constructor from the 'nft.storage' package
import { NFTStorage, File } from 'nft.storage'

const NFT_STORAGE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGM1MWVkZjMyRTU5ODcxNUZjOTQxMmNiOTE1MTVmN2RmZDMxQzFDNzMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NTQ3NzU5MjAzOSwibmFtZSI6Imhhc2hpZXMifQ.jZNdhVW6OY2mdG-laDSxa2Tcd4pTztofmyI-mywPJUk'

class HashieToken {
  name!: string
  url!: string
  description!: string
  image!: File | Blob
  quantity!: number
  timeLimitFrom!: string | undefined
  timeLimitTo!: string | undefined
  secretCode!: string
  price!: string
  createdAt!: string
  fee?: number
}

// const storeNFT = async (image: File, name: string, description: string) => {
const storeNFT = async (t: HashieToken) => {
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })
  if (t.image instanceof File) {
    return nftstorage.store(t)
  } else {
    return nftstorage.storeBlob(t.image)
  }
}

function webifyUri(uri: string): string {
  return uri.startsWith('ipfs://')
    ? `https://ipfs.io/ipfs/${uri.slice(7)}`
    : uri
}

export { storeNFT, HashieToken, webifyUri }
