import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import HashieConfig from '../settings.json'
import { useAurora } from './AuroraProvider'

interface HederaProviderProps {
  children: ReactNode
}

interface HederaAccessContextType {
  nfts: [] | null
  loadNFTs: () => Promise<[]>
  getMintedTokens: (collectionID: string) => number
  hasToken: (collectionID: string, accountID: string) => boolean
}

const Context = createContext<HederaAccessContextType>({
  nfts: [],
  loadNFTs: async () =>
    new Promise<[]>(() => {
      return []
    }),
  getMintedTokens: () => 0,
  hasToken: () => false
})

export const HederaAPIProvider = ({ children }: HederaProviderProps) => {
  const [nfts, setNFTs] = useState<[] | null>([])
  const { account, getBalance } = useAurora()
  useEffect(() => {
    ;(async () => {
      console.log('init')
      // await getBalance('0x8d2bd8c2B963289674A922447c857D5938C1B05c')
      const nfts = await loadNFTs()
      setNFTs(nfts)
    })()
  }, [])

  const loadNFTs = async (): Promise<[]> => {
    const response = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/tokens/${HashieConfig.token_id}/nfts`
    )
    const data = await response.json()

    return data.nfts
  }

  const getMintedTokens = (collectionID: string): number => {
    if (!nfts) return 0

    const meta = `https://ipfs.io/ipfs/${collectionID}/metadata.json`
    return nfts.filter((l: { metadata: string }) => {
      return atob(l.metadata) === meta
    }).length
  }

  const hasToken = (collectionID: string, accountID: string): boolean => {
    if (!nfts) return false

    const meta = `https://ipfs.io/ipfs/${collectionID}/metadata.json`
    return (
      nfts.filter((l: { metadata: string; account_id: string }) => {
        return atob(l.metadata) === meta && l.account_id === accountID
      }).length > 0
    )
  }

  const value = useMemo(
    () => ({
      nfts,
      loadNFTs,
      getMintedTokens,
      hasToken
    }),
    [nfts]
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useHeaderAPI = () => useContext(Context)
