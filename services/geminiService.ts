
import { GoogleGenAI, Type } from "@google/genai";
import type { HerbInfo } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const herbInfoSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'Common name of the herb.' },
        scientificName: { type: Type.STRING, description: 'Scientific name of the herb.' },
        magicalProperties: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of magical properties (e.g., Protection, Love, Prosperity).'
        },
        elementalAssociation: { type: Type.STRING, description: 'Associated element (e.g., Fire, Water, Earth, Air).' },
        planetaryAssociation: { type: Type.STRING, description: 'Associated planet (e.g., Mars, Venus, Moon).' },
        deityAssociation: { 
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of associated deities.' 
        },
        lore: { type: Type.STRING, description: 'A brief paragraph on its folklore or history.' },
        usage: { type: Type.STRING, description: 'How it is used in magical practices or rituals.' },
    },
    required: ['name', 'scientificName', 'magicalProperties', 'elementalAssociation', 'planetaryAssociation', 'lore', 'usage']
};

export async function getHerbInfo(herbName: string): Promise<HerbInfo> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert herbalist specializing in esoteric and magical lore. Provide the magical significance of the herb "${herbName}". Do not include any introductory or concluding phrases, just the JSON object.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: herbInfoSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error('Received an empty response from the AI.');
    }
    
    return JSON.parse(jsonText) as HerbInfo;

  } catch (error) {
    console.error("Error fetching herb info:", error);
    throw new Error(`Failed to fetch information for "${herbName}". The plant may be too obscure or the request failed.`);
  }
}

export async function generateHerbImage(herbName: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A mystical, artistic digital painting of the ${herbName} plant. The plant has a subtle, magical glow. The background is dark and esoteric, with faint, glowing alchemical symbols. Fantasy art style, high detail, cinematic lighting.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error('No image was generated.');
        }

    } catch (error) {
        console.error("Error generating herb image:", error);
        throw new Error(`Failed to generate an image for "${herbName}".`);
    }
}
