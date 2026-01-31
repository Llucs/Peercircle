
import { GoogleGenAI, Type } from "@google/genai";

export const askGemini = async (prompt: string, context: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${context}\n\nUser Question: ${prompt}`,
      config: {
        systemInstruction: "You are a helpful AI assistant integrated into a P2P messaging app. Your goal is to help users with their conversations, provide suggestions, or explain things. Be concise and friendly.",
        temperature: 0.7,
      },
    });

    return response.text || "Desculpe, não consegui processar isso.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao contatar o assistente de IA.";
  }
};
