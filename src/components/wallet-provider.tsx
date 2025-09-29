
"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect, openContractCall } from '@stacks/connect';
import type { StacksTransaction, User, Mission } from '@/lib/types';
import { StacksTestnet } from '@stacks/network';
import { AnchorMode, PostConditionMode, stringUtf8CV } from '@stacks/transactions';
import { missionDefs } from '@/lib/missions';

export interface WalletContextType {
  user: User | null;
  transactions: StacksTransaction[] | null;
  missions: Mission[] | null;
  isLoading: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  connect: (onFinish?: () => void) => void;
  disconnect: () => void;
  claimBadge: () => Promise<{ success: boolean; txId?: string; error?: string }>;
  refreshData: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

const HIRO_API_URL = 'https://api.testnet.hiro.so';
const BADGE_CONTRACT_ADDRESS = 'ST1PQEEMQ3ZGQ0B1P9P22A2VTK2C9404090ET002P';
const BADGE_CONTRACT_NAME = 'seedsage-badge';
const NETWORK = new StacksTestnet({ url: HIRO_API_URL });

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<StacksTransaction[] | null>(null);
  const [missions, setMissions] = useState<Mission[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchWalletData = useCallback(async (stxAddress: string) => {
    setIsLoading(true);
    try {
      // The /v2/accounts endpoint needs the chain parameter
      const balanceResponse = await fetch(`${HIRO_API_URL}/v2/accounts/${stxAddress}?chain=testnet`);
      const balanceData = await balanceResponse.json();

      // The /extended/v1/... endpoint knows the network from the URL subdomain
      const txsResponse = await fetch(`${HIRO_API_URL}/extended/v1/address/${stxAddress}/transactions`);
      const txsData = await txsResponse.json();
      const fetchedTransactions = txsData.results || [];

      const userData: User = {
        address: stxAddress,
        network: 'testnet',
        balance: balanceData,
      };
      
      const verifiedMissions = missionDefs.map(mission => ({
        ...mission,
        completed: mission.verify(fetchedTransactions, userData.address),
      }));

      setUser(userData);
      setTransactions(fetchedTransactions);
      setMissions(verifiedMissions);

    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      setUser(null);
      setTransactions(null);
      setMissions(missionDefs.map(m => ({...m, completed: false})));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSessionState = useCallback(async () => {
    setIsConnecting(true);
    if (userSession.isSignInPending()) {
      try {
        await userSession.handlePendingSignIn();
      } catch (e) {
        console.error("Pending sign-in handling failed:", e);
      }
    }

    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const stxAddress = userData.profile?.stxAddress?.testnet;
      if (stxAddress) {
        await fetchWalletData(stxAddress);
      }
    } else {
        setUser(null);
        setTransactions(null);
        setMissions(missionDefs.map(m => ({...m, completed: false})));
        setIsLoading(false);
    }
    setIsConnecting(false);
  }, [fetchWalletData]);

  useEffect(() => {
    handleSessionState();
  }, [handleSessionState]);

  const refreshData = useCallback(async () => {
    if (user) {
      await fetchWalletData(user.address);
    }
  }, [user, fetchWalletData]);

  const connect = (onFinishCallback?: () => void) => {
    setIsConnecting(true);
    showConnect({
      userSession,
      appDetails: {
        name: 'SeedSage',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: async () => {
        await handleSessionState();
        if (onFinishCallback) onFinishCallback();
      },
      onCancel: () => {
        console.log("Connection cancelled.");
        setIsConnecting(false);
      },
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setUser(null);
    setTransactions(null);
    setMissions(missionDefs.map(m => ({...m, completed: false})));
  };

  const claimBadge = async (): Promise<{ success: boolean, txId?: string, error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not connected' };
    }

    return new Promise((resolve) => {
        const txOptions = {
          contractAddress: BADGE_CONTRACT_ADDRESS,
          contractName: BADGE_CONTRACT_NAME,
          functionName: 'claim',
          functionArgs: [stringUtf8CV("Claiming my SeedSage badge!")],
          network: NETWORK,
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Deny,
          onFinish: (data: { txId: string; }) => {
            resolve({ success: true, txId: data.txId });
            setTimeout(() => refreshData(), 5000);
          },
          onCancel: () => {
            resolve({ success: false, error: 'Transaction was cancelled by user.' });
          },
        };
        openContractCall(txOptions);
    });
  };

  const value: WalletContextType = {
    user,
    transactions,
    missions,
    isLoading: isLoading,
    isConnecting: isConnecting,
    isConnected: !!user && !isLoading,
    connect,
    disconnect,
    claimBadge,
    refreshData,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
