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
        herbalOil: {
            type: Type.OBJECT,
            description: "Detailed esoteric information about the herb's essential oil, if it is commonly used in magical practices. Focus on its unique properties separate from the raw herb.",
            properties: {
                lore: { type: Type.STRING, description: "A brief paragraph on the specific magical folklore, history, or mythology associated with the herbal oil itself. For example, how its creation process is viewed esoterically or stories specifically involving the oil." },
                usage: { type: Type.STRING, description: "Specific ways the essential oil is used in magical practices, such as anointing candles, consecrating tools, use in diffusers for ritual atmosphere, or inclusion in potions. Distinguish these uses from the raw herb's uses." }
            },
        },
        complementaryEssences: {
            type: Type.ARRAY,
            description: "A list of 1 to 3 complementary herbs or essential oils that pair well with the main herb for specific magical purposes. Each item should include the name of the essence and a brief explanation of its synergistic purpose.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The common name of the complementary herb or essential oil." },
                    purpose: { type: Type.STRING, description: "A brief, specific magical purpose for combining this essence with the main herb (e.g., 'To amplify protective energies', 'For dream clarity and prophetic visions')." }
                },
                required: ['name', 'purpose']
            }
        },
        externalResources: {
            type: Type.ARRAY,
            description: "A list of up to 3 external web resources for further research. Each resource should have a source name and a valid URL.",
            items: {
                type: Type.OBJECT,
                properties: {
                    source: { type: Type.STRING, description: "The name of the website or source (e.g., Wikipedia, Botanical.com)." },
                    url: { type: Type.STRING, description: "The full URL to the resource." }
                },
                required: ['source', 'url']
            }
        }
    },
    required: ['name', 'scientificName', 'magicalProperties', 'elementalAssociation', 'planetaryAssociation', 'lore', 'usage']
};

export async function getHerbInfo(herbName: string): Promise<HerbInfo> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert herbalist specializing in esoteric and magical lore. A user has searched for "${herbName}". Your task is to interpret this query, which might be a partial name, a common name, or even a misspelling, and identify the single most relevant herb. For that identified herb, provide its complete magical significance. If this herb is commonly used to produce an essential oil, also provide a brief summary of the magical lore and usage of its oil. Based on the herb's properties, suggest 1-3 complementary herbs or essential oils that would pair well with it for specific magical purposes. Additionally, provide up to 3 reliable external web resources for further research (e.g., Wikipedia, botanical sites). It is crucial that your entire response is ONLY the JSON object for the herb you identified, matching the provided schema. Do not include any introductory text, explanations about your search process, or concluding phrases.`,
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

export async function generateHerbImage(herbName: string, style?: string): Promise<string> {
    try {
        const basePrompt = `An esoteric, mystical depiction of the ${herbName} plant, glowing with magical energy. The background is dark and atmospheric, filled with faint, glowing alchemical symbols, sacred geometry patterns, and constellations. Ethereal wisps of colorful smoke and glowing particles drift around the plant, hinting at its elemental power.`;
        
        const stylePrompt = style 
            ? `${style}, highly detailed, cinematic lighting.`
            : 'Fantasy art style digital painting, highly detailed, cinematic lighting.';

        const fullPrompt = `${basePrompt} ${stylePrompt}`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
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