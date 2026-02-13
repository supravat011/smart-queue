import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSmartAnalysis = async (data: any): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Analysis unavailable: Missing API Key.";

  try {
    const prompt = `
      You are an expert Data Analyst for a Smart Queue Management System.
      Analyze the following appointment data and slot usage statistics:
      ${JSON.stringify(data)}

      Provide a concise executive summary (max 150 words) covering:
      1. Peak hours identification.
      2. Suggestions for load balancing (e.g., specific times to incentivize).
      3. Operational efficiency observation.
      
      Format the response as clean plain text or Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate AI analysis. Please check your API key or network connection.";
  }
};

export const generateSmartTips = async (currentSlot: any, allSlots: any[]): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Our AI suggests checking other slots for faster service.";
  
    try {
      const prompt = `
        User selected slot: ${JSON.stringify(currentSlot)}.
        All slots status: ${JSON.stringify(allSlots)}.
        
        If the selected slot is crowded or full, suggest the best alternative nearby slot.
        If it's available, confirm it's a good choice.
        Keep it very short (max 1 sentence).
        Tone: Helpful, friendly assistant.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
  
      return response.text || "Try a different time.";
    } catch (error) {
        return "System optimization active.";
    }
  };