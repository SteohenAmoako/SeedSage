"use server";

import { explainTransaction, ExplainTransactionInput } from '@/ai/flows/explain-stacks-transactions';
import { contextualAIChatAssistant, ContextualAIChatAssistantInput } from '@/ai/flows/contextual-ai-chat-assistant';

export async function explainTransactionAction(input: ExplainTransactionInput) {
  try {
    const output = await explainTransaction(input);
    return { success: true, data: output };
  } catch (error) {
    console.error("Error in explainTransactionAction:", error);
    return { success: false, error: "Failed to get explanation from AI." };
  }
}

export async function getChatResponseAction(input: ContextualAIChatAssistantInput) {
  try {
    const output = await contextualAIChatAssistant(input);
    return { success: true, data: output };
  } catch (error) {
    console.error("Error in getChatResponseAction:", error);
    return { success: false, error: "Failed to get response from AI assistant." };
  }
}

interface FaucetInput {
  recipient: string;
}

export async function getFaucetStxAction(input: FaucetInput) {
    try {
        const response = await fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/faucets/stx?address=${input.recipient}&stacking=false`, {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Faucet API Error:", errorData);
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }
        
        const data = await response.json();

        if (!data.txId) {
            throw new Error("Transaction ID not found in faucet response.");
        }

        return { success: true, data: { txId: data.txId } };
    } catch (error: any) {
        console.error("Error in getFaucetStxAction:", error);
        return { success: false, error: error.message || "Failed to send testnet STX." };
    }
}
