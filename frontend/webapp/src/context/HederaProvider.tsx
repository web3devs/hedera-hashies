import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback
} from 'react';
import {HashConnect, HashConnectTypes} from 'hashconnect';
import {HashConnectProvider} from "hashconnect/dist/provider";
import {HashConnectSigner} from "hashconnect/dist/provider/signer";
import {Contract, hethers} from "@hashgraph/hethers";
import HashieConfig from "../settings.json";

export type Network = 'testnet' | 'mainnet' | 'previewnet';

export interface Metadata {
  appName: string;
  appDescription: string;
  appIcon: string;
  network: Network;
}

interface HederaAccessContextType {
  accountId: string | null;
  isConnected: boolean;
  connect: () => unknown;
  disconnect: () => Promise<unknown>;
  provider: HashConnectProvider,
  contract: Contract
}

const HeaderAccessContext = createContext<HederaAccessContextType>({
  accountId: null,
  isConnected: false,
  connect: () => {
    // NOOP
  },
  disconnect: () => new Promise<void>(() => {}),
  provider: null,
  contract: null
});

export const useHeaderAccess = () => useContext(HeaderAccessContext);

interface HederaProviderProps {
  children: ReactNode;
  meta: Metadata;
  nftAddress: string;
}

let hashConnect = new HashConnect(false);

// let topic: string | null = null;
// let state: string | null = null;
// let pairingData: HashConnectTypes.SavedPairingData | null = null;
// let network = null;

export const connect = () => {
  hashConnect.connectToLocalWallet();
};

export const clearPairings = () => {
  hashConnect.clearConnectionsAndData();
};

const contractWithSigner = (signer: HashConnectSigner): Contract => {
  const contract = new Contract(HashieConfig.address, HashieConfig.abi)
  console.log(contract)
  return contract
}

export const HederaProvider = ({ meta, children }: HederaProviderProps) => {
  const [pairingData, setPairingData] =
    useState<HashConnectTypes.SavedPairingData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState<Contract | null>(null);
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
      // topic = initData.topic;
      // const pairingString = initData.pairingString;
      setPairingData(initData.savedPairings[0]);
      await hashConnect.connect();
      const hcProvider = hashConnect.getProvider('testnet', topic, accountId);
      const hcSigner = hashConnect.getSigner(hcProvider);
      const hcContract = contractWithSigner(hcSigner);
      setProvider(hcProvider);
      console.log('setting contract', hcContract)
      setContract(hcContract)
    })();
  }, [meta]);

  const disconnect = useCallback(async () => {
    if (!pairingData?.topic) {
      throw new Error('no pairing data');
    }
    await hashConnect.disconnect(pairingData.topic);
    setPairingData(null);
    setIsConnected(false);
    setProvider(null);
    setContract(null);
  }, [pairingData?.topic]);

  hashConnect.connectionStatusChangeEvent.on(async (connectionStatus) => {
    setIsConnected(connectionStatus === 'Connected');
    if (connectionStatus === 'Disconnected') {
    }
    setPairingData(hashConnect.hcData.pairingData[0]);
    if (hashConnect.hcData.pairingData[0]) {
      setIsConnected(true);
      const accountId = hashConnect.hcData.pairingData[0].accountIds[0];
      setAccountId(accountId);
      const hcProvider = hashConnect.getProvider('testnet', topic, accountId);
      const hcSigner = hashConnect.getSigner(hcProvider);
      const hcContract = contractWithSigner(hcSigner);
      setProvider(hcProvider);
      console.log('setting contract', hcContract)
      setContract(hcContract)

    } else {
      setIsConnected(false);
      setProvider(null);
      setContract(null);

    }
  });

  const value = useMemo(
    () => ({
      accountId,
      isConnected,
      connect,
      disconnect,
      provider,
      contract,
    }), [
      accountId,
      isConnected,
      connect,
      disconnect,
      provider,
      contract
    ]
  );
  return (
    <HeaderAccessContext.Provider value={value}>
      {children}
    </HeaderAccessContext.Provider>
  );
};
