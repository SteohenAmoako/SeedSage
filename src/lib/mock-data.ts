import type { User, Transaction, Mission } from './types';

export const mockUser: User = {
  address: 'ST1PQEEMQ3ZGQ0B1P9P22A2VTK2C9404090ET002P',
  network: 'testnet',
  balance: {
    stx: {
      balance: 124.58,
      usd_balance: 249.16,
    },
  },
};

export const mockTransactions: Transaction[] = [
  {
    txid: '0x123abcde...',
    from: 'ST3G...7W9',
    to: mockUser.address,
    amount: 50,
    fee: 0.003,
    timestamp: Date.now() - 1 * 60 * 60 * 1000,
    type: 'receive',
    memo: 'hackathon prize'
  },
  {
    txid: '0x456fghij...',
    from: mockUser.address,
    to: 'ST1...E03',
    amount: 10,
    fee: 0.005,
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    type: 'send',
  },
  {
    txid: '0x789klmno...',
    from: mockUser.address,
    to: 'ST2...J4V',
    amount: 0,
    fee: 0.01,
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    type: 'contract_call',
    memo: 'Claiming badge'
  },
];

export const mockMissions: Mission[] = [
  {
    id: '1',
    title: 'First Transaction',
    description: 'Send 1 test STX to a friend or a demo address.',
    reward: 50,
    completed: true,
  },
  {
    id: '2',
    title: 'Explore a dApp',
    description: 'Connect your wallet to a Stacks dApp like Gamma.io.',
    reward: 50,
    completed: false,
  },
  {
    id: '3',
    title: 'AI Explanation',
    description: 'Use SeedSage to explain one of your past transactions.',
    reward: 25,
    completed: false,
  },
];
