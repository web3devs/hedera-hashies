import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { HashConnectSigner } from 'hashconnect/dist/esm/provider/signer'
import { HashConnect, MessageTypes } from 'hashconnect'
import { HashConnectTypes } from 'hashconnect/dist/types'

export type NetworkStage = 'testnet' | 'mainnet' | 'previewnet'

export interface Metadata {
  appName: string
  appDescription: string
  appIcon: string
  network: NetworkStage
}

interface HederaAccessContextType {
  accountId: string | null
  isConnected: boolean
  connect: () => unknown
  disconnect: () => Promise<unknown>
  signer: HashConnectSigner | null
  hashConnect: HashConnect | null
}

const HeaderAccessContext = createContext<HederaAccessContextType>({
  accountId: null,
  isConnected: false,
  connect: () => {
    // NOOP
  },
  disconnect: () =>
    new Promise<void>(() => {
      // NOOP
    }),
  signer: null,
  hashConnect: null
})

export const useHeaderAccess = () => useContext(HeaderAccessContext)

interface HederaProviderProps {
  children: ReactNode
  meta: Metadata
  nftAddress: string
}

const hashConnect = new HashConnect(false)

// TODO Begin debugging code
hashConnect.foundExtensionEvent.on((data) => {
  console.log('Found extension', data)
})

hashConnect.pairingEvent.on((data) => {
  console.log('>>>>>Paired with wallet', data)
})

hashConnect.connectionStatusChangeEvent.on((state) => {
  console.log('>>>>>status change event', state)
})

hashConnect.transactionEvent.on((data: MessageTypes.Transaction) => {
  console.log('********transaction event', data)
})

hashConnect.signRequestEvent.on((data: MessageTypes.SigningRequest) => {
  console.log('>>>>>sign request', data)
})

hashConnect.authRequestEvent.on((data: MessageTypes.AuthenticationRequest) => {
  console.log('>>>>>auth request', data)
})

hashConnect.acknowledgeMessageEvent.on((data: MessageTypes.Acknowledge) => {
  console.log('>>>>>ack message request', data)
})
// End debugging code

export const connect = () => {
  hashConnect.connectToLocalWallet()
}

export const clearPairings = () => {
  hashConnect.clearConnectionsAndData()
}

export const HederaProvider = ({ meta, children }: HederaProviderProps) => {
  const [pairingData, setPairingData] =
    useState<HashConnectTypes.SavedPairingData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [signer, setSigner] = useState<HashConnectSigner | null>(null)

  useEffect(() => {
    ;(async () => {
      const initData = await hashConnect.init(
        {
          name: 'hashie',
          description: 'Proof of attendance app',
          icon: 'https://hashie.net/logo.svg'
        },
        'testnet',
        true
      )
      setPairingData(initData.savedPairings[0])
      await hashConnect.connect()
    })()
  }, [meta])

  const disconnect = async () => {
    if (!pairingData?.topic) {
      throw new Error('no pairing data')
    }
    await hashConnect.disconnect(pairingData.topic)
    setPairingData(null)
    setIsConnected(false)
    setSigner(null)
  }

  hashConnect.connectionStatusChangeEvent.on(async (connectionStatus) => {
    setIsConnected(connectionStatus === 'Connected')
    setPairingData(hashConnect.hcData.pairingData[0])
    if (hashConnect.hcData.pairingData[0]) {
      setIsConnected(true)
      const accountId = hashConnect.hcData.pairingData[0].accountIds[0]
      setAccountId(accountId)
      const hcProvider = hashConnect.getProvider(
        'testnet',
        hashConnect.hcData.topic,
        accountId
      )
      const hcSigner = hashConnect.getSigner(hcProvider)
      if (!hcSigner) {
        throw new Error('No hcSigner')
      }
      setSigner(hcSigner)
    } else {
      setIsConnected(false)
      setSigner(null)
    }
  })

  const value = useMemo(
    () => ({
      accountId,
      isConnected,
      connect,
      disconnect,
      signer,
      hashConnect
    }),
    [accountId, isConnected, connect, disconnect, signer, hashConnect]
  )
  return (
    <HeaderAccessContext.Provider value={value}>
      {children}
    </HeaderAccessContext.Provider>
  )
}
