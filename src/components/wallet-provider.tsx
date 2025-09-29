
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
  isLoading: boolean;
  hasInitialised: boolean;
}

export interface WalletContextType extends WalletData {
  isConnected: boolean;
  isConnecting: boolean;
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletData, setWalletData] = useState<WalletData>({
    user: null,
    transactions: [],
    missions: missionDefs,
    isLoading: true,
    hasInitialised: false,
  });

  const fetchWalletData = useCallback(async (stxAddress: string) => {
    setWalletData(prev => ({ ...prev, isLoading: true }));
    try {
      const balanceResponse = await fetch(`${HIRO_API_URL}/v2/accounts/${stxAddress}`);
      const balanceData = await balanceResponse.json();

      const txsResponse = await fetch(`${HIRO_API_URL}/extended/v1/address/${stxAddress}/transactions`);
      const txsData = await txsResponse.json();
      const transactions = txsData.results;

      const user: User = {
        address: stxAddress,
        network: 'testnet',
        balance: balanceData,
      };
      
      const verifiedMissions = missionDefs.map(mission => ({
        ...mission,
        completed: mission.verify(transactions, user.address),
      }));

      setWalletData({
        user,
        transactions,
        missions: verifiedMissions,
        isLoading: false,
        hasInitialised: true,
      });

    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      setWalletData(prev => ({ ...prev, isLoading: false, hasInitialised: true, user: null, transactions: [], missions: missionDefs }));
    }
  }, []);
  
  const refreshData = useCallback(() => {
    if (walletData.user) {
      fetchWalletData(walletData.user.address);
    }
  }, [walletData.user, fetchWalletData]);


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
        setWalletData(prev => ({...prev, hasInitialised: true, isLoading: false}));
      },
    });
  };

  const disconnectWallet = () => {
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut();
    }
    setWalletData({
      user: null,
      transactions: [],
      missions: missionDefs,
      isLoading: false,
      hasInitialised: true,
    });
  };

  const claimBadge = async (): Promise<{ success: boolean, txId?: string, error?: string }> => {
    if (!walletData.user) {
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
      setWalletData(prev => ({ ...prev, isLoading: true }));
      setIsConnecting(true);

      if (userSession.isSignInPending()) {
        try {
          const userData = await userSession.handlePendingSignIn();
          if (userData?.profile?.stxAddress?.testnet) {
            await fetchWalletData(userData.profile.stxAddress.testnet);
          }
        } catch (error) {
          console.error("Error handling pending sign in:", error);
        } finally {
           setWalletData(prev => ({...prev, isLoading: false, hasInitialised: true}));
           setIsConnecting(false);
        }
      } else if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        if (userData.profile?.stxAddress?.testnet) {
          await fetchWalletData(userData.profile.stxAddress.testnet);
        } else {
           setWalletData(prev => ({...prev, isLoading: false, hasInitialised: true}));
           setIsConnecting(false);
        }
      } else {
        setWalletData(prev => ({...prev, isLoading: false, hasInitialised: true}));
        setIsConnecting(false);
      }
    };

    handleUserSession();
  }, [fetchWalletData]);

  const value: WalletContextType = {
    ...walletData,
    isConnected: !!walletData.user,
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
