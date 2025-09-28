// This file is used to explain Stacks transactions in simple terms.

'use server';

/**
 * @fileOverview Explains Stacks transactions in simple terms.
 *
 * - explainTransaction - A function that explains a Stacks transaction.
 * - ExplainTransactionInput - The input type for the explainTransaction function.
 * - ExplainTransactionOutput - The return type for the explainTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTransactionInputSchema = z.object({
  address: z.string().describe('The user address.'),
  network: z.string().describe('The network (testnet/mainnet).'),
  balance_before: z.number().describe('The balance before the transaction.'),
  balance_after: z.number().describe('The balance after the transaction.'),
  txid: z.string().describe('The transaction ID.'),
  from: z.string().describe('The sender address.'),
  to: z.string().describe('The recipient address.'),
  amount: z.number().describe('The transaction amount.'),
  fee: z.number().describe('The transaction fee.'),
  memo: z.string().optional().describe('The transaction memo.'),
});
export type ExplainTransactionInput = z.infer<typeof ExplainTransactionInputSchema>;

const ExplainTransactionOutputSchema = z.object({
  human: z.string().describe('User-facing friendly text explanation.'),
  meta: z.object({
    summary: z.string().describe('A one-sentence summary of the transaction.'),
    risk_level: z.enum(['Low', 'Medium', 'High']).describe('The risk level associated with the transaction.'),
    recommended_actions: z.string().array().describe('An array of recommended actions.'),
    references: z.string().array().describe('An array of reference URLs.'),
  }).describe('A compact JSON object containing summary, risk, actions, and references.'),
});
export type ExplainTransactionOutput = z.infer<typeof ExplainTransactionOutputSchema>;

export async function explainTransaction(input: ExplainTransactionInput): Promise<ExplainTransactionOutput> {
  return explainTransactionFlow(input);
}

const explainTransactionPrompt = ai.definePrompt({
  name: 'explainTransactionPrompt',
  input: {schema: ExplainTransactionInputSchema},
  output: {schema: ExplainTransactionOutputSchema},
  prompt: `You are SeedSage — a concise, friendly AI onboarding assistant for Stacks. See the SeedSage rules: do not ask for or repeat seed phrases; answer in plain English; output both a short user-facing answer and a META JSON with {summary, risk_level, actions[], references[]}. Assume testnet unless network says mainnet.

Context:
{
  "address":"{{address}}",
  "network":"{{network}}",
  "balance_before":{{balance_before}},
  "balance_after":{{balance_after}},
  "last_tx": { "txid":"{{txid}}", "from":"{{from}}", "to":"{{to}}", "amount":{{amount}}, "fee":{{fee}}, "memo":"{{memo}}" },
  "intent":"explain_tx"  // intent_type ∈ {explain_tx, ask_question, generate_missions, safety_check}
}
Instruction:
produce a 1-sentence summary, 3-bullet explanation of what happened, a clear risk level (Low/Medium/High) and 3 actions the user can take (one safety action). Then output META JSON.

Always return two parts: HUMAN section (plain text) and META section (JSON).`,
});

const explainTransactionFlow = ai.defineFlow(
  {
    name: 'explainTransactionFlow',
    inputSchema: ExplainTransactionInputSchema,
    outputSchema: ExplainTransactionOutputSchema,
  },
  async input => {
    const {output} = await explainTransactionPrompt(input);
    return output!;
  }
);
