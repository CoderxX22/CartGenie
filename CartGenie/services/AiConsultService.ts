// services/AiConsultService.ts
import { API_URL } from '../src/config/api';

export interface AIResponse {
  allowed: boolean;
  recommendation: 'SAFE' | 'CAUTION' | 'AVOID';
  reason: string; // ההסבר של ה-AI
}

export interface AIResponse {
  allowed: boolean;
  recommendation: 'SAFE' | 'CAUTION' | 'AVOID';
  reason: string;
  alternatives?: {
    name: string;
    reason: string;
  }[];
}

export const consultAiAgent = async (productData: any, username: string): Promise<AIResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/ai/consult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username, // השרת ישלוף את נתוני הבריאות לפי ה-username
        product: productData // נתוני המוצר (שם, רכיבים, ערכים תזונתיים)
      })
    });

    const json = await response.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  } catch (error) {
    console.error('AI Consult Error:', error);
    throw error;
  }
};