import React, {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useCallback,
  useState
} from 'react'
import { ethers, BigNumber } from 'ethers'
import HashiesContract from '../contracts/Hashies.json'
import {
  registerCallback,
  unregisterCallback,
  initProvider,
  getAccountAddress,
  getProvider,
  connectToWallet,
  getSigner
} from '../contracts/metamask'

const CONTRACT_ADDRESS = '0x8d2bd8c2B963289674A922447c857D5938C1B05c'
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

  const createCollection = async (name, uri) => {
    const tx = await contract.createCollection(name, uri)
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
  return (
    <AuroraContext.Provider
      value={{
        handleConnect,
        handleDisconnect,
        account,
        getBalance,
        mint,
        createCollection
      }}
    >
      {children}
    </AuroraContext.Provider>
  )
}

export default AuroraProvider
