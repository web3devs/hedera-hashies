import { ethers } from 'ethers'
import configs from './blockchains.config.json'

function getChainConfigFromHostName() {
  const domains = window.location.hostname.split('.')
  for (let i = 0; i < domains.length; i++) {
    const config = configs.find((c) => c.name === domains[i])
    if (config) {
      return config
    }
  }
  return undefined
}

export const chainConfig = getChainConfigFromHostName()

export const chainList = configs.map((ch) => ch.name)

let provider = null
let signer = null
let accountAddress = null
const callbacks = {}

export const signMessage = async () => {
  const sig = await signer.signMessage(accountAddress)
  return sig
}

export const sign = async (message) => {
  const sig = await signer.signMessage(message)
  return sig
}

export const unregisterCallback = (key) => {
  delete callbacks[key]
}
export const registerCallback = (key, fn) => {
  callbacks[key] = fn
}
const notifyCallbacks = () => {
  Object.values(callbacks).map((fn) => fn())
}

export const getAccountAddress = () => accountAddress.toLowerCase()

export const getProvider = () => provider

export const getSigner = () => signer

export const connectToWallet = async () => {
  await provider.send('eth_requestAccounts', [])
  signer = provider.getSigner()
  const accounts = await provider.listAccounts()
  if (accounts.length > 0) {
    accountAddress = accounts[0]
    notifyCallbacks()
  }
  return signer
}

export const disconnect = () => {
  signer = null
  accountAddress = null
  console.log('disconnect')
  notifyCallbacks()
}

export const initProvider = async () => {
  if (window.ethereum && chainConfig) {
    provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
    const accounts = await provider.listAccounts()
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainName: 'Aurora testnet',
          chainId: ethers.utils.hexlify(chainConfig.chainId),
          // nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
          rpcUrls: [chainConfig.url]
        }
      ]
    })
    if (accounts.length > 0) {
      signer = provider.getSigner()
      accountAddress = accounts[0]
      notifyCallbacks()
    }
    window.ethereum.on('accountsChanged', function (accounts) {
      accountAddress = accounts[0]
      notifyCallbacks()
    })
  } else {
    console.error('this browser does not support ethereum')
  }
}
