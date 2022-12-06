import { ethers } from 'ethers'
// import contracts from '../settings/contracts.json'
// import NotaryContractABI from '../settings/Notary.json'
// import NotaryNftContractABI from '../settings/NotaryNft.json'
// import NotarizedDocumentNftABI from '../settings/NotarizedDocumentNft.json'
// import Settings from '../settings/contracts.json'

import auroraCfg from './aurora.config.json'

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
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
    const accounts = await provider.listAccounts()
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainName: 'Aurora testnet',
          chainId: ethers.utils.hexlify(auroraCfg.chainId),
          // nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
          rpcUrls: [auroraCfg.url]
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

// function getNotaryContract() {
//   return new ethers.Contract(
//     contracts.Notary.address,
//     NotaryContractABI.abi,
//     signer
//   )
// }

// function getNotaryNftContract() {
//   return new ethers.Contract(
//     contracts.NotaryNft.address,
//     NotaryNftContractABI.abi,
//     signer
//   )
// }

// function getNotarizedDocumentNftContract() {
//   return new ethers.Contract(
//     contracts.NotarizedDocumentNft.address,
//     NotarizedDocumentNftABI.abi,
//     signer
//   )
// }

// /**
//  * Checks whether the connected account has a notary token
//  * @returns {Promise<boolean>}
//  */
// export const hasNotaryToken = async () => {
//   const contract = getNotaryNftContract()
//   const balance = (await contract.balanceOf(accountAddress)).toNumber()
//   return !!balance
// }

// /**
//  * Checks whether a NotarizedDocument has been minted into an NFT
//  * @param metadataURI
//  * @returns {Promise<boolean>}
//  */
// export const isDocumentTokenMinted = async ({ metadataURI }) => {
//   const contract = getNotarizedDocumentNftContract()
//   const tokenId = contract.tokenByUri(metadataURI)
//   return !!tokenId
// }

// /**
//  * Mint a NotaryNft for a verified notary
//  * @param idNumber notary id number
//  * @param metadataURL
//  * @returns {Promise<void>}
//  */
// export const signUpNotary = async ({ idNumber, metadataURL }) => {
//   const notaryContract = getNotaryContract()
//   const tx = await notaryContract.issueNotaryToken(
//     accountAddress,
//     idNumber,
//     metadataURL
//   )
//   await tx.wait()
// }

// /**
//  * Create a notarized document record, designate who can mint it, and how much must be paid
//  * MUST be called by an account that has a NotaryNft
//  * @param authorizedMinter address that is allowed to mint the nft
//  * @param price price in ether
//  * @param metadataURI
//  * @returns {Promise<void>}
//  */
// export const createNotarizedDocument = async ({
//   authorizedMinter,
//   price,
//   metadataURI
// }) => {
//   const notaryContract = getNotaryContract()
//   const tx = await notaryContract.createNotarizedDocument(
//     authorizedMinter,
//     ethers.utils.parseUnits(price.toString(), 'ether'),
//     metadataURI
//   )
//   await tx.wait()
// }

// /**
//  * Mint a notarized document nft
//  * MUST be called by the authorized minter designated when the notarized document was created
//  * MUST include a payment exactly equal to the amount specified when the notarized document was created
//  * @param metadataURI
//  * @param price amount to send in ether
//  * @returns {Promise<tokenId>}
//  */
// export const mintNotarizedDocumentNft = async ({ metadataURI, price }) => {
//   const notaryContract = getNotaryContract()
//   const tx = await notaryContract.mint(metadataURI, {
//     value: ethers.utils.parseUnits(price.toString(), 'ether')
//   })
//   const rx = await tx.wait()
//   const ev = rx.events.find((ev) => ev.event === 'NotarizedDocumentNftMinted')
//   const [minter, value, metadata, tokenId] = ev.args

//   return tokenId
// }

// /**
//  * Authorize another account to view a notarized document. An DocumentPermissionNft is delivered to
//  * the grantee's account.
//  * MUST be called by the owner for the NotarizedDocumentNft
//  * @param granteeAddress
//  * @param tokenId
//  * @returns {Promise<void>}
//  */
// export const shareNotarizedDocument = async ({ granteeAddress, tokenId }) => {
//   const notaryContract = getNotaryContract()
//   const tx = await notaryContract.grantDocumentViewPermission(
//     granteeAddress,
//     tokenId
//   )
//   await tx.wait()
// }

// const addNftToMetamask = async ({ address, symbol, image }) => {
//   try {
//     const wasAdded = await ethereum.request({
//       method: 'wallet_watchAsset',
//       params: {
//         type: 'ERC20',
//         options: {
//           address: address,
//           symbol: symbol,
//           decimals: 0,
//           image: image
//         }
//       }
//     })
//     return wasAdded
//   } catch (error) {
//     console.log(error)
//     return false
//   }
// }
