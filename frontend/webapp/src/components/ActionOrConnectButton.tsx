import React from 'react'
import { Button } from 'primereact/button'
import { useHashies } from '../context/HashiesProvider'

type ComponentProperties = {
  actionLabel: string
  className: string
  isLoading: boolean
  action: () => unknown
  disabled: boolean
}

function ActionOrConnectButton({
  actionLabel,
  className,
  isLoading,
  action,
  disabled
}: ComponentProperties) {
  const { account, handleConnect } = useHashies()
  return (
    <>
      {account ? (
        <Button
          label={actionLabel}
          className={className}
          loading={isLoading}
          onClick={action}
          disabled={disabled}
        />
      ) : (
        <Button
          label="Connect Wallet"
          className={className}
          loading={isLoading}
          onClick={handleConnect}
        />
      )}
    </>
  )
}

export default ActionOrConnectButton
