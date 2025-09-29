
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

  /**
   * Detects if the address belongs to testnet or mainnet by trying both APIs
   */
  const detectNetworkAndFetch = useCallback(async (address: string) => {
    try {
      // Try testnet first
      const testnetRes = await fetch(
        `${TESTNET_API}/v2/accounts/${address}?chain=testnet`
      );
      if (testnetRes.ok) {
        const data = await testnetRes.json();
        return { data, apiUrl: TESTNET_API, network: "testnet" };
      }

      // Fallback to mainnet
      const mainnetRes = await fetch(`${MAINNET_API}/v2/accounts/${address}`);
      if (mainnetRes.ok) {
        const data = await mainnetRes.json();
        return { data, apiUrl: MAINNET_API, network: "mainnet" };
      }

      throw new Error("Unable to detect network for given address.");
    } catch (err) {
      console.error("Network detection failed:", err);
      throw err;
    }
  }, []);

  /**
   * Fetch balance + transactions + verify missions
   */
  const fetchWalletData = useCallback(
    async (stxAddress: string) => {
      setIsLoading(true);
      try {
        const { data: balanceData, apiUrl, network } =
          await detectNetworkAndFetch(stxAddress);

        // Fetch transactions
        const txsRes = await fetch(
          `${apiUrl}/extended/v1/address/${stxAddress}/transactions${network === 'testnet' ? '?chain=testnet' : ''}`
        );
        const txsJson = await txsRes.json();
        const fetchedTransactions: StacksTransaction[] = txsJson.results || [];

        // Build user object
        const userData: User = {
          address: stxAddress,
          network: network as 'testnet' | 'mainnet',
          balance: balanceData as StacksBalance,
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
    },
    [detectNetworkAndFetch]
  );

  /**
   * Handle wallet session (sign in / sign out)
   */
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
      const stxAddress =
        userData.profile?.stxAddress?.testnet ||
        userData.profile?.stxAddress?.mainnet;

      if (stxAddress) {
        if (!user || user.address !== stxAddress) {
          await fetchWalletData(stxAddress);
        } else {
          setIsLoading(false);
        }
      } else {
        // Invalid state → force sign out
        userSession.signUserOut();
        setUser(null);
        setTransactions(null);
        setMissions(missionDefs.map((m) => ({ ...m, completed: false })));
        setIsLoading(false);
      }
    } else {
      setUser(null);
      setTransactions(null);
      setMissions(missionDefs.map((m) => ({ ...m, completed: false })));
      setIsLoading(false);
    }
  }, [fetchWalletData, user]);

  useEffect(() => {
    handleSessionState();
  }, [handleSessionState]);

  /**
   * Refresh wallet data
   */
  const refreshData = useCallback(async () => {
    if (user) {
      await fetchWalletData(user.address);
    }
  }, [user, fetchWalletData]);

  /**
   * Connect wallet
   */
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
        setIsConnecting(false);
      },
      onCancel: () => {
        console.log("Connection cancelled.");
        setIsConnecting(false);
      },
    });
  };

  /**
   * Disconnect wallet
   */
  const disconnect = () => {
    userSession.signUserOut();
    setUser(null);
    setTransactions(null);
    setMissions(missionDefs.map((m) => ({ ...m, completed: false })));
  };

  /**
   * Claim on-chain badge
   */
  const claimBadge = async (): Promise<{
    success: boolean;
    txId?: string;
    error?: string;
  }> => {
    if (!user) return { success: false, error: "User not connected" };

    const network =
      user.network === "testnet"
        ? new StacksTestnet({ url: TESTNET_API })
        : new StacksMainnet({ url: MAINNET_API });

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

  // ------------------ Context Value ------------------

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
