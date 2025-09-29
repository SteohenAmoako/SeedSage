import { useContext } from 'react';
import { WalletContext, WalletContextType } from '@/components/wallet-provider';

export const useWallet = (): Omit<WalletContextType, 'hasInitialised'> => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
