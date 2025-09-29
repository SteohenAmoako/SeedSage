"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import type { StacksTransaction, User, Mission } from '@/lib/types';
import { StacksTestnet } from '@stacks/network';
import { AnchorMode, PostConditionMode, stringUtf8 } from '@stacks/transactions';
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
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

const HIRO_API_URL = 'https://api.testnet.hiro.so';
const BADGE_CONTRACT_ADDRESS = 'ST1PQEEMQ3ZGQ0B1P9P22A2VTK2C9404090ET002P';
const BADGE_CONTRACT_NAME = 'seedsage-badge';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnecting, setIsConnecting] = useState(true);
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

  const onFinish = (payload: any) => {
    const profile = payload.userSession.loadUserData();
    const stxAddress = profile.profile.stxAddress.testnet;
    if (stxAddress) {
      fetchWalletData(stxAddress);
    }
    setIsConnecting(false);
  };

  const onCancel = () => {
    setIsConnecting(false);
    setWalletData(prev => ({...prev, hasInitialised: true, isLoading: false}));
  };

  const connectWallet = () => {
    setIsConnecting(true);
    showConnect({
      userSession,
      onFinish,
      onCancel,
      appDetails: {
        name: 'SeedSage',
        icon: window.location.origin + '/logo.png',
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
        },
        onCancel: () => {
          resolve({ success: false, error: 'Transaction was cancelled by user.' });
        },
        txOptions: {
          contractAddress: BADGE_CONTRACT_ADDRESS,
          contractName: BADGE_CONTRACT_NAME,
          functionName: 'claim',
          functionArgs: [stringUtf8("Claiming my SeedSage badge!")],
          network: new StacksTestnet(),
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Deny,
        },
      });
    });
  };

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        if (userData.profile?.stxAddress?.testnet) {
          fetchWalletData(userData.profile.stxAddress.testnet);
        }
         setIsConnecting(false);
      });
    } else if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      if (userData.profile?.stxAddress?.testnet) {
        fetchWalletData(userData.profile.stxAddress.testnet);
      }
       setIsConnecting(false);
    } else {
        setIsConnecting(false);
        setWalletData(prev => ({...prev, isLoading: false, hasInitialised: true}));
    }
  }, [fetchWalletData]);

  const value: WalletContextType = {
    ...walletData,
    isConnected: !!walletData.user,
    isConnecting,
    connect: connectWallet,
    disconnect: disconnectWallet,
    claimBadge,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
