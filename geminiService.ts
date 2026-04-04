
import { GoogleGenAI } from "@google/genai";

export async function getFarmingAdvice(month: string, fields: any[], animals: any[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `En tant qu'expert Farming Simulator 22, donne moi 3 conseils rapides pour le mois de ${month} sachant que j'ai ${fields.length} champs et ${animals.length} enclos d'animaux. Réponds de manière concise en français.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "L'assistant n'est pas disponible pour le moment.";
  }
}
