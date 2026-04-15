import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResult } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getStockPrediction(symbol: string, currentPrice: number): Promise<PredictionResult> {
  const prompt = `Analyze the stock ${symbol} (Current Price: $${currentPrice}). 
  Use your search tool to find recent news, earnings reports, and market sentiment for this stock.
  Provide a detailed prediction for the next 30 days.
  Return the result in JSON format.`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            currentPrice: { type: Type.NUMBER },
            prediction: { type: Type.STRING, description: "Bullish, Bearish, or Neutral" },
            confidence: { type: Type.NUMBER, description: "0 to 100" },
            targetPrice: { type: Type.NUMBER },
            timeframe: { type: Type.STRING },
            rationale: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            riskFactors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["symbol", "currentPrice", "prediction", "confidence", "targetPrice", "timeframe", "rationale", "riskFactors"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    throw new Error("Failed to generate AI prediction");
  }
}
