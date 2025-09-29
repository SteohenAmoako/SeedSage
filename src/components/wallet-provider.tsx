"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  AppConfig,
  UserSession,
  showConnect,
  openContractCall,
} from "@stacks/connect";
import type { StacksTransaction, User, Mission, StacksBalance } from "@/lib/types";
import { StacksTestnet, StacksMainnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
} from "@stacks/transactions";
import { missionDefs } from "@/lib/missions";

// ------------------ Types ------------------

export interface WalletContextType {
  user: User | null;
  transactions: StacksTransaction[] | null;
  missions: Mission[] | null;
  isLoading: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  connect: (onFinish?: () => void) => void;
  disconnect: () => void;
  claimBadge: () => Promise<{
    success: boolean;
    txId?: string;
    error?: string;
  }>;
  refreshData: () => Promise<void>;
}

// ------------------ Constants ------------------

const TESTNET_API = "https://api.testnet.hiro.so";
const MAINNET_API = "https://api.hiro.so";

const BADGE_CONTRACT_ADDRESS = "ST1PQEEMQ3ZGQ0B1P9P22A2VTK2C9404090ET002P";
const BADGE_CONTRACT_NAME = "seedsage-badge";

const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });

// ------------------ Context ------------------

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
);

// ------------------ Provider ------------------

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<StacksTransaction[] | null>(
    null
  );
  const [missions, setMissions] = useState<Mission[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchWalletData = useCallback(async (stxAddress: string) => {
    setIsLoading(true);
    try {
      // For this app, we are only concerned with testnet.
      const network = "testnet";
      const apiUrl = TESTNET_API;

      // Fetch balance
      const balanceUrl = new URL(`${apiUrl}/extended/v1/address/${stxAddress}/balances`);
      if (network === 'testnet') {
          balanceUrl.searchParams.set('chain', 'testnet');
      }
      const balanceRes = await fetch(balanceUrl.toString());
      if (!balanceRes.ok) throw new Error(`Failed to fetch balance: ${balanceRes.statusText}`);
      const balanceData: StacksBalance = await balanceRes.json();

      // Fetch transactions
      const txsUrl = new URL(`${apiUrl}/extended/v1/address/${stxAddress}/transactions`);
      txsUrl.searchParams.set('limit', '50');
      if (network === 'testnet') {
          txsUrl.searchParams.set('chain', 'testnet');
      }
      const txsRes = await fetch(txsUrl.toString());
       if (!txsRes.ok) throw new Error(`Failed to fetch transactions: ${txsRes.statusText}`);
      const txsJson = await txsRes.json();
      const fetchedTransactions: StacksTransaction[] = txsJson.results || [];

      // Build user object
      const userData: User = {
        address: stxAddress,
        network: network,
        balance: balanceData,
      };

      // Verify missions based on real activity
      const verifiedMissions = missionDefs.map((mission) => ({
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
      setMissions(missionDefs.map((m) => ({ ...m, completed: false })));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSessionState = useCallback(async () => {
    if (userSession.isSignInPending()) {
      setIsConnecting(true);
      try {
        await userSession.handlePendingSignIn();
      } catch (e) {
        console.error("Pending sign-in failed:", e);
      } finally {
        setIsConnecting(false);
      }
    }

    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const stxAddress = userData.profile?.stxAddress?.testnet || userData.profile?.stxAddress?.mainnet;
      
      if (stxAddress) {
        if (!user || user.address !== stxAddress) {
           await fetchWalletData(stxAddress);
        } else {
            setIsLoading(false);
        }
      } else {
        userSession.signUserOut();
        setUser(null);
        setTransactions(null);
        setMissions([]);
        setIsLoading(false);
      }
    } else {
      setUser(null);
      setTransactions(null);
      setMissions([]);
      setIsLoading(false);
    }
  }, [fetchWalletData, user]);

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
        name: "SeedSage",
        icon: window.location.origin + "/logo.png",
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
    setMissions([]);
  };

  const claimBadge = async (): Promise<{ success: boolean; txId?: string; error?: string; }> => {
    if (!user) return { success: false, error: "User not connected" };

    const network = new StacksTestnet({ url: TESTNET_API });

    return new Promise((resolve) => {
      const txOptions = {
        contractAddress: BADGE_CONTRACT_ADDRESS,
        contractName: BADGE_CONTRACT_NAME,
        functionName: "claim",
        functionArgs: [stringUtf8CV("Claiming my SeedSage badge!")],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data: { txId: string }) => {
          resolve({ success: true, txId: data.txId });
          setTimeout(() => refreshData(), 5000);
        },
        onCancel: () => {
          resolve({ success: false, error: "Transaction cancelled by user." });
        },
      };
      openContractCall(txOptions);
    });
  };

  const value: WalletContextType = {
    user,
    transactions,
    missions,
    isLoading,
    isConnecting,
    isConnected: !!user && !isLoading,
    connect,
    disconnect,
    claimBadge,
    refreshData,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
