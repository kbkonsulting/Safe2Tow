import { GoogleGenAI, Type } from "@google/genai";
import { TowingInfo, VehicleIdentificationResult } from '../types';

// Centralized model name for consistency and easy updates.
const TEXT_MODEL = 'gemini-2.5-flash';

// Gemini API initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const towingInfoSchema = {
  type: Type.OBJECT,
  properties: {
    vehicle: {
      type: Type.OBJECT,
      properties: {
        year: { type: Type.NUMBER },
        make: { type: Type.STRING },
        model: { type: Type.STRING },
        trim: { type: Type.STRING },
      },
      required: ['year', 'make', 'model', 'trim'],
    },
    drivetrain: { type: Type.STRING },
    awdSystemType: { type: Type.STRING },
    isDrivetrainEngagedWhenOff: { type: Type.BOOLEAN },
    steeringLocksWhenOff: { type: Type.BOOLEAN },
    towingSafetyLevel: { type: Type.STRING, enum: ['SAFE', 'CAUTION', 'DOLLY_REQUIRED'] },
    summary: { type: Type.STRING },
    frontTowing: {
      type: Type.OBJECT,
      properties: {
        safetyLevel: { type: Type.STRING, enum: ['SAFE', 'SAFE_WITH_CAUTION', 'UNSAFE'] },
        instructions: { type: Type.STRING },
      },
      required: ['safetyLevel', 'instructions'],
    },
    rearTowing: {
      type: Type.OBJECT,
      properties: {
        safetyLevel: { type: Type.STRING, enum: ['SAFE', 'SAFE_WITH_CAUTION', 'UNSAFE'] },
        instructions: { type: Type.STRING },
      },
      required: ['safetyLevel', 'instructions'],
    },
    cautions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    anecdotalAdvice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    awdVariantInfo: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        frontTowing: {
          type: Type.OBJECT,
          properties: {
            safetyLevel: { type: Type.STRING, enum: ['SAFE', 'SAFE_WITH_CAUTION', 'UNSAFE'] },
            instructions: { type: Type.STRING },
          },
          required: ['safetyLevel', 'instructions'],
        },
        rearTowing: {
          type: Type.OBJECT,
          properties: {
            safetyLevel: { type: Type.STRING, enum: ['SAFE', 'SAFE_WITH_CAUTION', 'UNSAFE'] },
            instructions: { type: Type.STRING },
          },
          required: ['safetyLevel', 'instructions'],
        },
        cautions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        awdSystemType: { type: Type.STRING },
        isDrivetrainEngagedWhenOff: { type: Type.BOOLEAN },
        steeringLocksWhenOff: { type: Type.BOOLEAN },
      },
    },
  },
  required: [
    'vehicle', 'drivetrain', 'awdSystemType', 'isDrivetrainEngagedWhenOff', 'steeringLocksWhenOff',
    'towingSafetyLevel', 'summary', 'frontTowing', 'rearTowing', 'cautions'
  ],
};

const getSystemInstruction = () => `You are an expert automotive technician and towing specialist, with knowledge curated by professional tow operators, for professional tow operators. Your task is to provide detailed, accurate, and safe towing information for vehicles. Use the provided JSON schema to structure your response.
- Prioritize safety above all else. If unsure, recommend the safest option (dollies or flatbed).
- For AWD/4WD vehicles, always detail the specific system (e.g., "Full-time AWD with viscous coupling", "Part-time 4WD with manual transfer case") and explain its implications for towing.
- 'isDrivetrainEngagedWhenOff' refers to whether the wheels are mechanically connected to the transmission/drivetrain when the vehicle is off. For example, some automatic transmissions with electronic shifters may not fully disengage in 'Neutral' without power.
- 'steeringLocksWhenOff' refers to whether the steering wheel locks when the ignition is off.
- Provide clear, step-by-step instructions.
- Include common cautions, like speed limits or distance restrictions.
- 'anecdotalAdvice' should reflect common real-world tips or warnings from experienced tow truck operators (e.g., "Watch out for the low-hanging front air dam on the sport model," or "These are known to have sensitive electronics, disconnecting the battery is recommended.").
- If a vehicle has a well-known AWD variant with different towing procedures (e.g., a Subaru with a manual vs. automatic transmission), populate the 'awdVariantInfo' object with that information. Otherwise, leave it null.
`;


export const getTowingInfo = async (query: string): Promise<TowingInfo> => {
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Get towing information for: ${query}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: towingInfoSchema,
        systemInstruction: getSystemInstruction(),
      },
    });

    const text = response.text.trim();
    if (!text) {
      throw new Error("Received an empty response from the AI.");
    }

    return JSON.parse(text) as TowingInfo;
  } catch (error) {
    console.error("Error getting towing info:", error);
    throw new Error("Failed to get towing information from the AI. Please try again.");
  }
};

export const getVehicleOptions = async (query: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `List vehicle ${query}. Only return a JSON array of strings, like ["Option 1", "Option 2"]. Do not add any other text. If there are no options, return an empty array.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        console.error(`Error getting vehicle options for query "${query}":`, error);
        return [];
    }
};

export const getCorrectedMake = async (make: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Correct this vehicle make, returning only the corrected name: "${make}". For example, if the input is "Chevy", return "Chevrolet". If it's already correct, return it as is.`,
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error correcting make "${make}":`, error);
        return make; // Return original on error
    }
};

export const identifyVehicleFromImage = async (base64Image: string): Promise<VehicleIdentificationResult> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };
    const textPart = {
        text: 'Identify the year, make, and model of the vehicle in this image. Respond ONLY with a JSON object. If a vehicle is clearly visible, use the format {"year": "YYYY", "make": "Make", "model": "Model"}. If no vehicle is clearly visible, use the format {"error": "No vehicle detected in the image."}.',
    };

    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        year: { type: Type.STRING },
                        make: { type: Type.STRING },
                        model: { type: Type.STRING },
                        error: { type: Type.STRING },
                    },
                    // No 'required' array, as one of two distinct structures is expected.
                }
            }
        });

        const text = response.text.trim();
        const result = JSON.parse(text) as VehicleIdentificationResult;

        if (result.error || (result.year && result.make && result.model)) {
          return result;
        }
        
        throw new Error("AI returned an unexpected format for vehicle identification.");

    } catch (error) {
        console.error("Error identifying vehicle from image:", error);
        throw new Error("Failed to identify vehicle. The AI may be experiencing issues or the image is unclear.");
    }
};


export const extractVinFromImage = async (base64Image: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };
    const textPart = {
        text: 'Extract the 17-character Vehicle Identification Number (VIN) from this image. Return ONLY the VIN as a string, with no extra text or labels.',
    };

    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: { parts: [imagePart, textPart] },
        });

        const vin = response.text.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
        return vin.substring(0, 17);
    } catch (error) {
        console.error("Error extracting VIN from image:", error);
        throw new Error("Failed to extract VIN from image.");
    }
};