import React, { useEffect } from 'react'
import { useAurora } from '../context/AuroraProvider'
import { formatAddress } from '../helpers'
import './ConnectWalletButton.scss'
const ConnectWalletButton = () => {
  const { account, handleConnect, handleDisconnect } = useAurora()
  return (
    <div
      className="connect-wallet-button"
      onClick={() => {
        if (!account) {
          handleConnect()
        } else {
          handleDisconnect()
        }
      }}
    >
      <span className="text-white text-sm">
        {!account ? 'Connect Wallet' : `${formatAddress(account || '')}`}
      </span>

      {account && <span className="text-sm ml-2">Connected</span>}
    </div>
  )
}

export default ConnectWalletButton
