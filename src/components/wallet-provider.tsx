
"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import type { StacksTransaction, User, Mission } from '@/lib/types';
import { StacksTestnet } from '@stacks/network';
import { AnchorMode, PostConditionMode, stringUtf8CV } from '@stacks/transactions';
import { missionDefs } from '@/lib/missions';

interface WalletData {
  user: User | null;
  transactions: StacksTransaction[] | null;
  missions: Mission[];
}

export interface WalletContextType extends WalletData {
  isConnected: boolean;
  isConnecting: boolean;
  hasInitialised: boolean;
  isLoading: boolean;
  connect: () => void;
  disconnect: () => void;
  claimBadge: () => Promise<{ success: boolean, txId?: string, error?: string }>;
  refreshData: () => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

const HIRO_API_URL = 'https://api.testnet.hiro.so';
const BADGE_CONTRACT_ADDRESS = 'ST1PQEEMQ3ZGQ0B1P9P22A2VTK2C9404090ET002P';
const BADGE_CONTRACT_NAME = 'seedsage-badge';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<StacksTransaction[] | null>(null);
  const [missions, setMissions] = useState<Mission[]>(missionDefs);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialised, setHasInitialised] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchWalletData = useCallback(async (stxAddress: string) => {
    setIsLoading(true);
    try {
      const balanceResponse = await fetch(`${HIRO_API_URL}/v2/accounts/${stxAddress}`);
      const balanceData = await balanceResponse.json();

      const txsResponse = await fetch(`${HIRO_API_URL}/extended/v1/address/${stxAddress}/transactions`);
      const txsData = await txsResponse.json();
      const fetchedTransactions = txsData.results;

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
      setTransactions([]);
      setMissions(missionDefs);
    } finally {
      setIsLoading(false);
      setHasInitialised(true);
    }
  }, []);
  
  const refreshData = useCallback(() => {
    if (user) {
      fetchWalletData(user.address);
    }
  }, [user, fetchWalletData]);


  const connectWallet = () => {
    setIsConnecting(true);
    showConnect({
      userSession,
      appDetails: {
        name: 'SeedSage',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: (data) => {
        const stxAddress = data.stacksAddress.testnet;
        if (stxAddress) {
          fetchWalletData(stxAddress);
        }
        setIsConnecting(false);
      },
      onCancel: () => {
        setIsConnecting(false);
        setHasInitialised(true);
        setIsLoading(false);
      },
    });
  };

  const disconnectWallet = () => {
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut();
    }
    setUser(null);
    setTransactions([]);
    setMissions(missionDefs);
    setHasInitialised(true);
  };

  const claimBadge = async (): Promise<{ success: boolean, txId?: string, error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not connected' };
    }

    return new Promise((resolve) => {
      showConnect({
        userSession,
        appDetails: { name: 'SeedSage', icon: window.location.origin + '/logo.png' },
        onFinish: (data) => {
          resolve({ success: true, txId: data.txId });
          setTimeout(() => refreshData(), 3000);
        },
        onCancel: () => {
          resolve({ success: false, error: 'Transaction was cancelled by user.' });
        },
        txOptions: {
          contractAddress: BADGE_CONTRACT_ADDRESS,
          contractName: BADGE_CONTRACT_NAME,
          functionName: 'claim',
          functionArgs: [stringUtf8CV("Claiming my SeedSage badge!")],
          network: new StacksTestnet(),
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Deny,
        },
      });
    });
  };

  useEffect(() => {
    const handleUserSession = async () => {
      setIsLoading(true);

      if (userSession.isSignInPending()) {
        setIsConnecting(true);
        try {
          const userData = await userSession.handlePendingSignIn();
          if (userData?.profile?.stxAddress?.testnet) {
            await fetchWalletData(userData.profile.stxAddress.testnet);
          }
        } catch (error) {
          console.error("Error handling pending sign in:", error);
          setHasInitialised(true);
        } finally {
           setIsConnecting(false);
        }
      } else if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        if (userData.profile?.stxAddress?.testnet) {
          await fetchWalletData(userData.profile.stxAddress.testnet);
        } else {
           setIsLoading(false);
           setHasInitialised(true);
        }
      } else {
        setIsLoading(false);
        setHasInitialised(true);
      }
    };

    handleUserSession();
  }, [fetchWalletData]);

  const value: WalletContextType = {
    user,
    transactions,
    missions,
    isLoading,
    hasInitialised,
    isConnected: !!user,
    isConnecting,
    connect: connectWallet,
    disconnect: disconnectWallet,
    claimBadge,
    refreshData,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
