export interface User {
  address: string;
  network: 'testnet' | 'mainnet';
  balance: StacksBalance;
}

export interface StacksBalance {
  stx: {
    balance: string;
    total_sent: string;
    total_received: string;
    total_fees_sent: string;
    total_miner_rewards_received: string;
    lock_tx_id: any;
    locked: string;
    lock_height: number;
    burnchain_lock_height: number;
    burnchain_unlock_height: number;
  };
  fungible_tokens: Record<string, any>;
  non_fungible_tokens: Record<string, any>;
}

export interface StacksTransaction {
  tx_id: string;
  nonce: number;
  fee_rate: string;
  sender_address: string;
  sponsored: boolean;
  post_condition_mode: string;
  post_conditions: any[];
  anchor_mode: string;
  is_unanchored: boolean;
  block_hash: string;
  parent_block_hash: string;
  block_height: number;
  burn_block_time: number;
  parent_burn_block_time: number;
  canonical: boolean;
  tx_index: number;
  tx_status: string;
  tx_result: {
    hex: string;
    repr: string;
  };
  microblock_hash: string;
  microblock_sequence: number;
  microblock_canonical: boolean;
  parent_microblock_hash: string;
  tx_type: 'contract_call' | 'token_transfer' | 'smart_contract';
  token_transfer: {
    recipient_address: string;
    amount: string;
    memo: string;
  };
  contract_call: {
    contract_id: string;
    function_name: string;
    function_signature: string;
    function_args: any[];
  };
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  verify: (transactions: StacksTransaction[], userAddress: string) => boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  meta?: any;
}
