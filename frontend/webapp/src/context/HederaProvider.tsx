import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import {HashConnect, HashConnectTypes} from 'hashconnect';
import {HashConnectSigner} from "hashconnect/dist/esm/provider/signer";

export type NetworkStage = 'testnet' | 'mainnet' | 'previewnet';

export interface Metadata {
  appName: string;
  appDescription: string;
  appIcon: string;
  network: NetworkStage;
}

interface HederaAccessContextType {
  accountId: string | null;
  isConnected: boolean;
  connect: () => unknown;
  disconnect: () => Promise<unknown>;
  signer: HashConnectSigner,
}

const HeaderAccessContext = createContext<HederaAccessContextType>({
  accountId: null,
  isConnected: false,
  connect: () => {
    // NOOP
  },
  disconnect: () => new Promise<void>(() => {}),
  signer: null,
});

export const useHeaderAccess = () => useContext(HeaderAccessContext);

interface HederaProviderProps {
  children: ReactNode;
  meta: Metadata;
  nftAddress: string;
}

let hashConnect = new HashConnect(false);

let topic: string | null = null;
let state: string | null = null;
// let pairingData: HashConnectTypes.SavedPairingData | null = null;
// let network = null;

export const connect = () => {
  hashConnect.connectToLocalWallet();
};

export const clearPairings = () => {
  hashConnect.clearConnectionsAndData();
};

export const HederaProvider = ({ meta, children }: HederaProviderProps) => {
  const [pairingData, setPairingData] =
    useState<HashConnectTypes.SavedPairingData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [signer, setSigner] = useState(null);
  useEffect(() => {
    (async () => {
      let initData = await hashConnect.init(
        {
          name: 'Hashes',
          description: 'Proof of attendance app',
          icon: 'https://hashie.net/logo.svg'
        },
        'testnet',
        true
      );
      topic = initData.topic;
      const pairingString = initData.pairingString;
      setPairingData(initData.savedPairings[0]);
      state = await hashConnect.connect();
      const hcProvider = hashConnect.getProvider('testnet', topic, accountId);
      const hcSigner = hashConnect.getSigner(hcProvider);
      setSigner(hcSigner)
    })();
  }, [meta]);

  const disconnect = async () => {
    if (!pairingData?.topic) {
      throw 'no pairing data';
    }
    console.log('init disconnect');
    await hashConnect.disconnect(pairingData.topic);
    console.log('disconnect');
    setPairingData(null);
    setIsConnected(false);
    setSigner(null)
  };

  hashConnect.connectionStatusChangeEvent.on(async (connectionStatus) => {
    setIsConnected(connectionStatus === 'Connected');
    if (connectionStatus === 'Disconnected') {
    }
    setPairingData(hashConnect.hcData);
    if (hashConnect.hcData.pairingData[0]) {
      setIsConnected(true);
      const accountId = hashConnect.hcData.pairingData[0].accountIds[0];
      setAccountId(accountId);
      const hcProvider = hashConnect.getProvider('testnet', topic, accountId);
      const hcSigner = hashConnect.getSigner(hcProvider);
      setSigner(hcSigner)

    } else {
      setIsConnected(false);
      setSigner(null)
    }
  });

  const value = useMemo(
    () => ({
      accountId,
      isConnected,
      connect,
      disconnect,
      signer
    }),
    [isConnected]
  );
  return (
    <HeaderAccessContext.Provider value={value}>
      {children}
    </HeaderAccessContext.Provider>
  );
};
