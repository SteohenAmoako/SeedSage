"use server";

import { explainTransaction, ExplainTransactionInput } from '@/ai/flows/explain-stacks-transactions';
import { contextualAIChatAssistant, ContextualAIChatAssistantInput } from '@/ai/flows/contextual-ai-chat-assistant';
import { saveProfile as saveProfileToDb, UserProfile } from '@/services/profile';

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

export async function saveProfileAction(userId: string, profile: UserProfile) {
    try {
        const success = await saveProfileToDb(userId, profile);
        return { success };
    } catch (error) {
        console.error("Error in saveProfileAction:", error);
        return { success: false, error: "Failed to save profile on the server." };
    }
}
