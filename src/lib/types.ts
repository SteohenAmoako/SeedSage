export interface User {
  address: string;
  network: 'testnet' | 'mainnet';
  balance: Balance;
}

export interface Balance {
  stx: {
    balance: number;
    usd_balance: number;
  };
}

export interface Transaction {
  txid: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  timestamp: number;
  memo?: string;
  type: 'send' | 'receive' | 'contract_call';
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  meta?: any;
}
