import React from 'react'
import ConnectWalletButton from './ConnectWalletButton'
import Logo from './Logo'

const NavBar = () => {
  return (
    <div className="flex justify-content-between align-items-center z-1 p-4">
      <div
        className="flex align-items-center cursor-pointer"
        onClick={() => {
          window.location.href = '/'
        }}
      >
        <Logo />
        <span className="text-white font-bold ml-2">hashies</span>
      </div>
      <ConnectWalletButton />
    </div>
  )
}

export default NavBar
