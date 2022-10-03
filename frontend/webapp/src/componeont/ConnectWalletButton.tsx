import React from 'react';
import { useHeaderAccess } from '../context/HederaProvider';
import { formatAddress } from '../helpers';
import './ConnectWalletButton.scss';

export default () => {
  const { connect, isConnected, accountId, disconnect } = useHeaderAccess();
  const handleConnect = () => connect();
  const hadnleDisconnect = () => {
    console.log('disconnect');
    disconnect();
  };
  return (
    <div
      className="connect-wallet-button"
      onClick={() => {
        if (!isConnected) {
          handleConnect();
        } else {
          hadnleDisconnect();
        }
      }}
    >
      <span className="text-white text-sm">
        {!isConnected ? 'Connect Wallet' : `${formatAddress(accountId || '')}`}
      </span>

      {isConnected && <span className="text-sm ml-2">Connected</span>}
    </div>
  );
};
