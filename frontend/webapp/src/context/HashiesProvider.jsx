import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { BigNumber, ethers } from 'ethers'
import HashiesAbi from '../contracts/Hashies.json'
import {
  chainConfig,
  connectToWallet,
  disconnect,
  getAccountAddress,
  getSigner,
  initProvider,
  registerCallback,
  unregisterCallback
} from '../contracts/metamask'

const contractAddress = chainConfig?.contractAddress

export const TRANSFERABLE_FLAG_BIT = 1 << 0
export const BURNABLE_FLAG_BIT = 1 << 1
export const SECRET_WORD_TOKEN_REQUIRED_BIT = 1 << 2
export const MINTING_DISABLED_BIT = 1 << 3

const CONTRACT_VERSION = '0.1.0'

const context = createContext()
export const useHashies = () => useContext(context)

const HashiesProvider = ({ children }) => {
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState(null)
  const handleConnect = connectToWallet

  useEffect(() => {
    // TODO Refactor this ugliness
    registerCallback('auth', () => {
      if (contract) return
      const address = getAccountAddress()
      if (address) {
        setAccount(address)
        const _contract = new ethers.Contract(
          contractAddress,
          HashiesAbi.abi,
          getSigner()
        )
        setContract(_contract)
      } else {
        setAccount(null)
      }
    })
    ;(async () => {
      try {
        if (contract) {
          const contractVersion = await contract.getVersion()
          console.assert(
            contractVersion === CONTRACT_VERSION,
            `Wrong contract version, expected ${CONTRACT_VERSION}, deployed: ${contractVersion}`
          )
        }
        await initProvider()
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      unregisterCallback('auth')
    }
  }, [contract])

  const handleDisconnect = () => {
    console.log('disconnect')
    disconnect()
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
    if (!contract) throw new Error('Contract not set')
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
    const res = await tx.wait()

    const event = res.events.findIndex((ev) => ev.event === 'CollectionCreated')
    const collectionId = res.events[event].args[1]
    return BigNumber.from(collectionId).toString()
  }

  const mint = async (collectionId) => {
    if (!contract) throw new Error('Contract not set')
    const tx = await contract.mint(collectionId)
    await tx.wait()
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

  const getTotalSupply = async (collectionId) => {
    if (!contract) {
      return -1
    }
    const ts = await contract.totalSupply(collectionId)
    return BigNumber.from(ts).toNumber()
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

  const getChainConfig = () => chainConfig

  return (
    <context.Provider
      value={{
        handleConnect,
        handleDisconnect,
        account,
        getChainConfig,
        getBalance,
        mint,
        createCollection,
        getOwnedTokens,
        getOwnedCollections,
        getCollectionById,
        getTotalSupply
      }}
    >
      {children}
    </context.Provider>
  )
}

export default HashiesProvider
