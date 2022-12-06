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
import {
  HashConnectConnectionState,
  HashConnectTypes
} from 'hashconnect/dist/types'

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

  const [state, setState] = useState({})

  const onFoundExtension = (data: HashConnectTypes.WalletMetadata) => {
    console.log('Found extension', data)
    setState((exState) => ({ ...exState, availableExtension: data }))
  }

  const onParingEvent = (data: MessageTypes.ApprovePairing) => {
    console.log('Paired with wallet', data)
    setState((exState) => ({ ...exState, pairingData: data.pairingData }))
  }

  const onConnectionChange = (state: HashConnectConnectionState) => {
    console.log('hashconnect state change event', state)
    setState((exState) => ({ ...exState, state }))
  }

  useEffect(() => {
    console.log(state)
  }, [state])
  //register events
  useEffect(() => {
    hashConnect.foundExtensionEvent.on(onFoundExtension)
    hashConnect.pairingEvent.on(onParingEvent)
    hashConnect.connectionStatusChangeEvent.on(onConnectionChange)
    return () => {
      hashConnect.foundExtensionEvent.off(onFoundExtension)
      hashConnect.pairingEvent.on(onParingEvent)
      hashConnect.connectionStatusChangeEvent.off(onConnectionChange)
    }
  }, [])
  useEffect(() => {
    ;(async () => {
      // setTimeout(async () => {

      const initData = await hashConnect.init(
        {
          name: 'Hashie',
          description: 'Proof of attendance app',
          icon: 'https://hashie.net/logo.svg'
        },
        'testnet',
        true
      )
      const topic = initData.topic
      const pairingString = initData.pairingString
      //Saved pairings will return here, generally you will only have one unless you are doing something advanced
      const pairingData = initData.savedPairings[0]

      setState((exState) => ({
        ...exState,
        topic,
        pairingData,
        pairingString,
        state: HashConnectConnectionState.Disconnected
      }))

      setPairingData(initData.savedPairings[0])
      // await hashConnect.connect()
      // const hcProvider = hashConnect.getProvider(
      //   'testnet',
      //   hashConnect.hcData.topic,
      //   hashConnect.hcData.pairingData[0].accountIds[0]
      // )
      // const hcSigner = hashConnect.getSigner(hcProvider)
      // setSigner(hcSigner)
      // }, 2000)
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
