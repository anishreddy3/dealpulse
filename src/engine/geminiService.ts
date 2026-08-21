import { GoogleGenAI } from '@google/genai';

/**
 * Optional Gemini API Client for DealPulse
 * In Stage-1 Demo mode, all analysis works 100% locally with zero external network dependencies.
 * If VITE_GEMINI_API_KEY is provided in the environment (e.g. on Cloudflare Pages or local .env),
 * this client can be optionally invoked for dynamic deep-dive summaries.
 */

export function getOptionalGeminiKey(): string | null {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (key && typeof key === 'string' && key.trim().length > 5 && !key.includes('MY_GEMINI_API_KEY')) {
    return key.trim();
  }
  return null;
}

export function isGeminiConfigured(): boolean {
  return getOptionalGeminiKey() !== null;
}

let genAiClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI | null {
  const key = getOptionalGeminiKey();
  if (!key) return null;
  if (!genAiClient) {
    try {
      genAiClient = new GoogleGenAI({ apiKey: key });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
      return null;
    }
  }
  return genAiClient;
}

export async function generateDynamicInsight(prompt: string): Promise<string | null> {
  const ai = getGenAIClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || null;
  } catch (error) {
    console.warn('Gemini API call skipped or failed, falling back to local heuristic:', error);
    return null;
  }
}
