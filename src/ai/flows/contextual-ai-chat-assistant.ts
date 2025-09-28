'use server';
/**
 * @fileOverview An AI chat assistant that provides personalized assistance to users, answering questions about Stacks wallets and transactions.
 *
 * - contextualAIChatAssistant - A function that handles the chat assistant process.
 * - ContextualAIChatAssistantInput - The input type for the contextualAIChatAssistant function.
 * - ContextualAIChatAssistantOutput - The return type for the contextualAIChatAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualAIChatAssistantInputSchema = z.object({
  address: z.string().describe('The user address.'),
  network: z.string().describe('The network (testnet or mainnet).'),
  balance_before: z.number().describe('The user balance before the transaction.'),
  balance_after: z.number().describe('The user balance after the transaction.'),
  txid: z.string().optional().describe('The transaction ID.'),
  from: z.string().optional().describe('The sender address.'),
  to: z.string().optional().describe('The recipient address.'),
  amount: z.number().optional().describe('The transaction amount.'),
  fee: z.number().optional().describe('The transaction fee.'),
  memo: z.string().optional().describe('The transaction memo.'),
  intent_type: z
    .enum(['explain_tx', 'ask_question', 'generate_missions', 'safety_check'])
    .describe('The intent type.'),
  message: z.string().describe('The user message.'),
});
export type ContextualAIChatAssistantInput = z.infer<
  typeof ContextualAIChatAssistantInputSchema
>;

const ContextualAIChatAssistantOutputSchema = z.object({
  human: z.string().describe('User-facing friendly text.'),
  meta: z.any().describe('A compact JSON object containing summary, risk, actions, and references.'),
});
export type ContextualAIChatAssistantOutput = z.infer<
  typeof ContextualAIChatAssistantOutputSchema
>;

export async function contextualAIChatAssistant(
  input: ContextualAIChatAssistantInput
): Promise<ContextualAIChatAssistantOutput> {
  return contextualAIChatAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualAIChatAssistantPrompt',
  input: {schema: ContextualAIChatAssistantInputSchema},
  output: {schema: ContextualAIChatAssistantOutputSchema},
  prompt: `You are SeedSage — a concise, friendly AI onboarding assistant for Stacks. See the SeedSage rules: do not ask for or repeat seed phrases; answer in plain English; output both a short user-facing answer and a META JSON with {summary, risk_level, actions[], references[]}. Assume testnet unless network says mainnet.\n\nUSER (single combined template):\nContext:\n{\n  "address":"{{{address}}}",\n  "network":"{{{network}}}",\n  "balance_before":{{{balance_before}}},\n  "balance_after":{{{balance_after}}},\n  "last_tx": { "txid":"{{{txid}}}", "from":"{{{from}}}", "to":"{{{to}}}", "amount":{{{amount}}}, "fee":{{{fee}}}, "memo":"{{{memo}}}" },
  "intent":"{{{intent_type}}}"  // intent_type ∈ {explain_tx, ask_question, generate_missions, safety_check}
  "message":"{{{message}}}"\n}\nInstruction:\nIf intent == \"explain_tx\": produce a 1-sentence summary, 3-bullet explanation of what happened, a clear risk level (Low/Medium/High) and 3 actions the user can take (one safety action). Then output META JSON.\n\nIf intent == \"generate_missions\": return a JSON array of 3 missions with {title, description, acceptance_criteria, reward_points, onchain_claim_boolean}.\n\nIf intent == \"ask_question\": answer as a teacher for grade-8, up to 3 short paragraphs, then give 3 follow-up links (official docs first).\n\nIf intent == \"safety_check\": provide immediate step-by-step remediation (4 steps) without echoing any secrets.\n\nAlways return two parts: HUMAN section (plain text) and META section (JSON).`,
});

const contextualAIChatAssistantFlow = ai.defineFlow(
  {
    name: 'contextualAIChatAssistantFlow',
    inputSchema: ContextualAIChatAssistantInputSchema,
    outputSchema: ContextualAIChatAssistantOutputSchema,
  },
  async input => {
    const {
      address,
      network,
      balance_before,
      balance_after,
      txid,
      from,
      to,
      amount,
      fee,
      memo,
      intent_type,
      message,
    } = input;

    const {output} = await prompt({
      address,
      network,
      balance_before,
      balance_after,
      txid,
      from,
      to,
      amount,
      fee,
      memo,
      intent_type,
      message,
    });
    return output!;
  }
);
