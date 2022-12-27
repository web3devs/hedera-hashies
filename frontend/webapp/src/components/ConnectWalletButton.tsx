import React, { useEffect } from 'react'
import { useHashies } from '../context/HashiesProvider'
import { formatAddress } from '../helpers'
import './ConnectWalletButton.scss'
const ConnectWalletButton = () => {
  const { account, handleConnect, handleDisconnect } = useHashies()
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
