
import { GoogleGenAI, Type } from "@google/genai";
import { Product, AIInsight } from "../types";

/**
 * Initializing the AI client with the provided API key from environment variables.
 * Corrected: Using process.env.API_KEY directly as per the coding guidelines.
 */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (name: string, category: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a concise, professional marketing description (max 2 sentences) for a product named "${name}" in the "${category}" category.`,
  });
  // Use .text property directly as per guidelines.
  return response.text || "No description generated.";
};

export const generateProductImage = async (name: string, category: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A professional studio product photograph of ${name}, an item in the ${category} category. White background, high quality, commercial photography style.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  // Iterating through parts to find image data as per guidelines.
  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
};

export const getInventoryInsights = async (products: Product[]): Promise<AIInsight[]> => {
  const ai = getAI();
  const inventoryContext = JSON.stringify(products.map(p => ({
    name: p.name,
    qty: p.quantity,
    min: p.minStock,
    max: p.maxStock,
    category: p.category
  })));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this inventory data and provide 3-4 strategic insights or alerts. Focus on reorder needs and overstock. Return as a JSON array of objects with keys: title, description, severity (low, medium, high), action. Data: ${inventoryContext}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            severity: { type: Type.STRING },
            action: { type: Type.STRING }
          },
          required: ["title", "description", "severity"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const chatWithInventory = async (message: string, products: Product[]): Promise<string> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an expert inventory manager. You have access to current stock: ${JSON.stringify(products)}. All pricing and valuation should be discussed in Indian Rupees (₹). Answer questions about stock levels, reordering, and valuation concisely.`
    }
  });
  // Using sendMessage for simple chat interaction.
  const response = await chat.sendMessage({ message });
  return response.text || "I'm sorry, I couldn't process that request.";
};
