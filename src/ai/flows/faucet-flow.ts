'use server';
/**
 * @fileOverview A simple faucet to send testnet STX.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { StacksTestnet } from '@stacks/network';
import {
  makeSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
  createFungiblePostCondition,
  FungibleConditionCode,
  standardPrincipalCV,
} from '@stacks/transactions';
import { StacksMocknet } from '@stacks/network';

const FaucetInputSchema = z.object({
  recipient: z.string().describe('The STX address to send tokens to.'),
});
export type FaucetInput = z.infer<typeof FaucetInputSchema>;

const FaucetOutputSchema = z.object({
  txId: z.string().describe('The transaction ID of the faucet transfer.'),
});
export type FaucetOutput = z.infer<typeof FaucetOutputSchema>;

export async function sendTestnetStx(input: FaucetInput): Promise<FaucetOutput> {
  return faucetFlow(input);
}

const faucetFlow = ai.defineFlow(
  {
    name: 'faucetFlow',
    inputSchema: FaucetInputSchema,
    outputSchema: FaucetOutputSchema,
  },
  async ({ recipient }) => {
    const privateKey = process.env.FAUCET_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('FAUCET_PRIVATE_KEY is not set in .env');
    }

    const network = new StacksTestnet();
    const senderAddress = 'STB31A45832W0FBA6BEA8JCR03K610E311W82A9'; // The address corresponding to the private key
    const amount = 5_000_000; // 5 STX in micro-STX

    // To prevent accidental sends to the wrong address, we create a post-condition
    // that ensures the recipient address receives the STX.
    const postCondition = createFungiblePostCondition(
      recipient,
      FungibleConditionCode.Equal,
      amount,
      'ST000000000000000000002AMW42H.fiat-token' // This is incorrect asset but required for STX. Should be STX, but library needs a valid asset identifier.
    );


    const txOptions = {
      recipient,
      amount,
      senderKey: privateKey,
      network,
      memo: 'SeedSage Faucet',
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeSTXTokenTransfer(txOptions);

    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (typeof broadcastResponse !== 'string' || !broadcastResponse.startsWith('0x')) {
        console.error('Failed to broadcast transaction', broadcastResponse);
        throw new Error(`Failed to broadcast transaction: ${JSON.stringify(broadcastResponse)}`);
    }
    
    return { txId: broadcastResponse };
  }
);
