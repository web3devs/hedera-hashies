import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { BigNumber, ethers } from 'ethers'
import HashiesContract from '../contracts/Hashies.json'
import {
  connectToWallet,
  getAccountAddress,
  getProvider,
  getSigner,
  initProvider,
  registerCallback,
  unregisterCallback
} from '../contracts/metamask'

const CONTRACT_ADDRESS = '0x464e97B5E2598D2CCEb1d186B35ACe2363fD11cb'

const TRANSFERABLE_FLAG_BIT = 1 << 0
const BURNABLE_FLAG_BIT = 1 << 1
const SECRET_WORD_TOKEN_REQUIRED_BIT = 1 << 2
const MINTING_DISABLED_BIT = 1 << 3

const AuroraContext = createContext({
  account: null,
  handleConnect: () => {
    //NOOP
  },
  handleDisconnect: () => {
    //NOOP
  },
  getBalance: async (collectionId) => {
    return 0
  },
  mint: async (collectionId) => {
    //NOOP
  },
  createCollection: async (name, uri) => {
    //NOOP
    return ''
  },
  getOwnedTokens: async () => {
    return []
  },
  getOwnedCollections: async () => {
    return []
  },
  getCollectionById: async (collectionId) => {
    return {}
  }
})
export const useAurora = () => useContext(AuroraContext)

const AuroraProvider = ({ children }) => {
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const handleConnect = () => {
    connectToWallet()
  }

  useEffect(() => {
    registerCallback('auth', async () => {
      const addres = getAccountAddress()

      if (addres) {
        setAccount(getAccountAddress())
        setProvider(getProvider())
        const signer = getSigner()
        setSigner(signer)
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          HashiesContract.abi,
          signer
        )
        setContract(contract)
      } else {
        setAccount(null)
      }
    })
    ;(async () => {
      try {
        await initProvider()
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      unregisterCallback('auth')
    }
  }, [])

  const handleDisconnect = () => {
    console.log('disconnect')
    // disconnect()
  }

  const createCollection = async (
    name,
    uri,
    maxSupply,
    earliestMintTimestamp,
    latestMintTimestamp,
    requiredPayment,
    transferable = false,
    burnable = false,
    disabled = false
    // , secretWord = ''
  ) => {
    // TODO The secret word bit is unavailable until a secret word token lambda is created
    const flags =
      (transferable ? TRANSFERABLE_FLAG_BIT : 0) +
      (burnable ? BURNABLE_FLAG_BIT : 0) +
      (disabled ? MINTING_DISABLED_BIT : 0)
    // + (secretWord ? SECRET_WORD_TOKEN_REQUIRED_BIT : 0)
    const tx = await contract.createCollection(
      name,
      uri,
      maxSupply,
      earliestMintTimestamp,
      latestMintTimestamp,
      requiredPayment,
      flags
    )
    console.log(tx)
    const res = await tx.wait()
    console.log(res)

    const event = res.events.findIndex((ev) => ev.event === 'CollectionCreated')
    const collectionId = res.events[event].args[1]
    console.log('collectionId', collectionId)
    return BigNumber.from(collectionId).toString()
  }

  const mint = async (collectionId) => {
    console.log(collectionId)
    const tx = await contract.mint(collectionId)
    console.log(tx)
    const res = await tx.wait()
    console.log(res)
  }

  const getBalance = useCallback(
    async (id) => {
      if (!contract || !account) {
        return
      }
      const a = await contract.balanceOf(account, id)
      return BigNumber.from(a).toNumber()
    },
    [contract, account]
  )

  const getOwnedTokens = async () => {
    if (!contract || !account) {
      return []
    }
    return await contract.ownedTokens(account)
  }

  const getOwnedCollections = async () => {
    if (!contract || !account) {
      return []
    }
    return await contract.ownedCollections(account)
  }

  const getCollectionById = async (collectionId) => {
    if (!contract || !account) {
      return
    }
    return await contract.collections(collectionId)
  }

  return (
    <AuroraContext.Provider
      value={{
        handleConnect,
        handleDisconnect,
        account,
        getBalance,
        mint,
        createCollection,
        getOwnedTokens,
        getOwnedCollections,
        getCollectionById
      }}
    >
      {children}
    </AuroraContext.Provider>
  )
}

export default AuroraProvider
