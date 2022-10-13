// Import the NFTStorage class and File constructor from the 'nft.storage' package
import { NFTStorage, File } from 'nft.storage'

const NFT_STORAGE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGM1MWVkZjMyRTU5ODcxNUZjOTQxMmNiOTE1MTVmN2RmZDMxQzFDNzMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NTQ3NzU5MjAzOSwibmFtZSI6Imhhc2hpZXMifQ.jZNdhVW6OY2mdG-laDSxa2Tcd4pTztofmyI-mywPJUk'

class HashieToken {
  name!: string
  url!: string
  description!: string
  image!: File
  quantity!: number
  timeLimitFrom!: string
  timeLimitTo!: string
  secretCode!: string
  price!: string
  createdAt!: string
}

// const storeNFT = async (image: File, name: string, description: string) => {
const storeNFT = async (t: HashieToken) => {
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

  return nftstorage.store(t)
}

export { storeNFT, HashieToken }
