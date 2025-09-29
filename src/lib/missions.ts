import type { StacksTransaction } from "./types";

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  verify: (transactions: StacksTransaction[], userAddress: string) => boolean;
}


export const missionDefs: MissionDef[] = [
  {
    id: '1',
    title: 'First Transaction',
    description: 'Send at least 0.000001 test STX to any other address.',
    reward: 50,
    completed: false,
    verify: (transactions: StacksTransaction[], userAddress: string): boolean => {
      return transactions.some(tx => 
        tx.tx_status === 'success' && 
        tx.tx_type === 'token_transfer' &&
        tx.sender_address === userAddress &&
        tx.token_transfer.recipient_address !== userAddress
      );
    }
  },
  {
    id: '2',
    title: 'Use a Contract',
    description: 'Interact with any smart contract on the testnet.',
    reward: 50,
    completed: false,
    verify: (transactions: StacksTransaction[], userAddress: string): boolean => {
        return transactions.some(tx => 
          tx.tx_status === 'success' && 
          tx.tx_type === 'contract_call' &&
          tx.sender_address === userAddress
        );
    }
  },
  {
    id: '3',
    title: 'Receive Tokens',
    description: 'Receive some testnet STX from the faucet or a friend.',
    reward: 25,
    completed: false,
    verify: (transactions: StacksTransaction[], userAddress: string): boolean => {
        return transactions.some(tx => 
            tx.tx_status === 'success' && 
            tx.tx_type === 'token_transfer' &&
            tx.token_transfer.recipient_address === userAddress &&
            tx.sender_address !== userAddress
       );
    }
  },
];
