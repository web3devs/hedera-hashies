import React from 'react';
import { useHeaderAccess } from '../context/HederaProvider';
import { formatAddress } from '../helpers';
import './ConnectWalletButton.scss';

export default () => {
  const { connect, isConnected, accountId } = useHeaderAccess();
  const handleConnect = () => connect();
  return (
    <div className="connect-wallet-button">
      <span
        className="text-white text-sm"
        onClick={() => {
          !isConnected && handleConnect();
        }}
      >
        {!isConnected ? 'Connect Wallet' : `${formatAddress(accountId || '')}`}
      </span>

      {isConnected && <span className="text-sm ml-2">Connected</span>}
    </div>
  );
};
