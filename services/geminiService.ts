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
    unlockAdvice: {
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

const getSystemInstruction = () => `You are an expert tow operator. Your knowledge base is curated by towing professionals, for towing professionals. Your primary goal is to provide concise, accurate, and safe towing information for any vehicle presented. Adhere strictly to the provided JSON schema and the following operational logic:
- **Summary Field Logic**:
  - For FWD vehicles, state that it is safe to tow using a wheel-lift from the front. Example: "The [Vehicle Name] (FWD) is safe to tow using a wheel-lift from the front, provided the drive wheels are lifted clear of the ground and proper procedures are followed." Do not mention towing from the rear in the summary for FWD vehicles.
  - For RWD vehicles, state that it is safe to tow using a wheel-lift from the rear.
  - For AWD/4WD vehicles, state that dollies or a flatbed are required due to potential damage to the drivetrain.
  - **IMPORTANT**: Include the sentence "Verify drivetrain before towing." in the summary *if and only if* the vehicle has common AWD variants and you are populating the 'awdVariantInfo' field. Do not include this sentence otherwise.
- **Instructions Field Logic**: For the 'instructions' fields ('frontTowing.instructions' and 'rearTowing.instructions'), provide a numbered list using '\\n' for new lines. The instructions should be brief, direct, and assume a professional audience. Follow these specific rules:
  - **REAR TOWS (Lifting Rear Wheels):**
    - You MUST instruct to lock or secure the steering wheel straight (e.g., "Lock steering wheel straight or secure with seatbelt").
    - You must NEVER include an instruction to "Unlock steering".
    - If it's a FWD vehicle (towing non-drive wheels), you MUST include "Shift transmission to Neutral".
    - If it's a RWD vehicle (towing drive wheels), do NOT include "Shift to Neutral", but you MUST include "Ensure parking brake is OFF".
    - Example (FWD Rear Tow): "1. Shift transmission to Neutral.\\n2. Lock steering wheel straight or secure with seatbelt.\\n3. Lift rear non-drive wheels completely.\\n4. Secure vehicle."
    - Example (RWD Rear Tow): "1. Ensure parking brake is OFF.\\n2. Lock steering wheel straight or secure with seatbelt.\\n3. Lift rear drive wheels completely.\\n4. Secure vehicle."
  - **FRONT TOWS (Lifting Front Wheels):**
    - For ANY front tow, do NOT include instructions to lock the steering.
    - If it's a FWD vehicle (towing drive wheels), do NOT include "Shift to Neutral", but you MUST include "Ensure parking brake is OFF".
    - If it's a RWD vehicle (towing non-drive wheels), you MUST include "Shift transmission to Neutral". If Neutral cannot be engaged, dollies are required.
    - Example (FWD Front Tow): "1. Ensure parking brake is OFF.\\n2. Lift front drive wheels completely.\\n3. Secure vehicle."
    - Example (RWD Front Tow): "1. Shift transmission to Neutral.\\n2. Lift front non-drive wheels completely.\\n3. Secure vehicle."
- **Cautions Field Logic**: Include critical, practical warnings.
  - If the vehicle is likely to have an Electronic Parking Brake (EPB), **you must include a caution about it**. Example: "Electronic Parking Brake (EPB): If power is lost, the EPB may be stuck ON. Confirm wheels roll freely before towing; gently rocking the vehicle can help verify. If stuck, dollies are required."
  - For ANY rear tow procedure, you MUST include the following caution: "Steering Lock Caution: If the steering is locked sideways and cannot be straightened, dollies are required. If the wheels are turned too sharply for a safe rear tow, consider switching to a front tow and using dollies for the rear wheels."
- **Unlock Advice Logic**: For the \`unlockAdvice\` field, provide a list of common, non-damaging lockout tricks or entry methods specific to the vehicle model. For example, "Some Ford models can be opened by pulling the exterior driver's side door handle while simultaneously pressing the unlock button on the key fob through the window gap." If no well-known tricks exist for the specific model, leave the \`unlockAdvice\` field null or as an empty array. Do not invent tricks.
- Prioritize safety. If unsure, recommend dollies or flatbed.
- For AWD/4WD, briefly identify the system type (e.g., "Full-time AWD," "Part-time 4WD").
- 'isDrivetrainEngagedWhenOff' is true if wheels are mechanically connected to the drivetrain when the vehicle is off.
- 'steeringLocksWhenOff' is true if the steering wheel locks when the ignition is off.
- 'anecdotalAdvice' should be real-world tips from experienced operators.
- 'awdVariantInfo' should only be populated if a common variant exists with different procedures (e.g., a FWD model that also has a popular AWD trim). Otherwise, leave it null.
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

    const parsedResult = JSON.parse(text);

    // Add validation to ensure the AI returned a valid object and not just `null` or an empty structure.
    if (!parsedResult || typeof parsedResult !== 'object' || !parsedResult.vehicle) {
      console.error("AI returned a non-conforming or null object:", parsedResult);
      throw new Error("The AI returned an invalid data structure. It might not have recognized the vehicle.");
    }

    return parsedResult as TowingInfo;
  } catch (error) {
    console.error("Error getting towing info:", error);
    // Ensure a user-friendly error is always thrown.
    if (error instanceof Error && (error.message.includes("invalid data structure") || error.message.includes("empty response"))) {
      throw error;
    }
    throw new Error("Failed to get towing information from the AI. Please try again or rephrase your search.");
  }
};

export const getVehicleOptions = async (query: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Based on the partial user query "${query}", generate up to 5 vehicle search suggestions. The suggestions must only contain vehicle year, make, model, and trim information. They should be formatted as searchable vehicle names (e.g., "2023 Ford F-150", "Toyota Camry Sport Trac"). Exclude general search terms like "used", "new", "for sale", "price", or colors. Respond ONLY with a JSON array of strings. If no relevant suggestions are found, return an empty array.`,
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

export const identifyVehicleFromImage = async (base64Image: string): Promise<VehicleIdentificationResult> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };
    const textPart = {
        text: `You are a vehicle identification expert. Your primary task is to identify the make and model of the vehicle in the image.
- Respond ONLY with a valid JSON object that adheres to the provided schema.
- You MUST identify the 'make' and 'model'.
- The 'year' is optional. Provide your best guess for the year if possible, but it's okay to omit it if you are not confident.
- If you can confidently identify the make and model, respond with: {"make": "Make", "model": "Model", "year": "YYYY"}.
- If you cannot identify the make OR model, you MUST respond with an error: {"error": "Could not identify the make and model from the image. Please try a clearer photo or enter details manually."}.
- Do not provide partial results for make and model. Both are required for a successful identification.`,
    };

    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: [{ parts: [imagePart, textPart] }],
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

        // A successful result must have a make and a model. The year is optional.
        if (result.error || (result.make && result.model)) {
          return result;
        }
        
        // This error is thrown if the AI fails to return at least a make and model.
        throw new Error("AI returned an unexpected format for vehicle identification.");

    } catch (error) {
        console.error("Error identifying vehicle from image:", error);
        // Provide more specific feedback to the user based on the error.
        if (error instanceof Error && error.message.includes("unexpected format")) {
             throw new Error("The AI returned an incomplete result. Please try a clearer image or enter the details manually.");
        }
        throw new Error("Failed to identify vehicle. The AI may be experiencing issues or the image is unclear.");
    }
};


export const extractVinFromImage = async (base64Image: string): Promise<string | null> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };
    const textPart = {
        text: `Analyze this image to find a 17-character Vehicle Identification Number (VIN). 
- A VIN consists of uppercase letters (excluding I, O, Q) and numbers.
- If a clear and complete 17-character VIN is found, return it in a JSON object like {"vin": "..."}.
- If no valid VIN is found, or if it is incomplete or unreadable, return {"error": "No valid VIN detected."}.
- Do not guess or create a VIN from random characters. Only extract a confident match.`,
    };

    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: [{ parts: [imagePart, textPart] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        vin: { type: Type.STRING },
                        error: { type: Type.STRING },
                    },
                }
            }
        });

        const text = response.text.trim();
        const result = JSON.parse(text) as { vin?: string; error?: string };
        
        if (result.vin) {
            // Further validation on the returned VIN
            const cleanedVin = result.vin.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
            if (cleanedVin.length === 17) {
                return cleanedVin;
            }
        }

        // If no vin, or if vin is invalid, return null. The calling function will handle this.
        return null;

    } catch (error) {
        console.error("Error extracting VIN from image:", error);
        // Let the UI layer handle showing an error message.
        throw new Error("Failed to process image for VIN extraction.");
    }
};

export const classifyCodeType = async (base64Image: string): Promise<'vin' | 'plate' | 'none'> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };
    const textPart = {
        text: `Analyze the image. Does it primarily feature a VIN barcode/sticker, a license plate, or neither? 
- If it's a VIN, respond with: {"type": "vin"}.
- If it's a license plate, respond with: {"type": "plate"}.
- If it's neither, or if it's unclear, respond with: {"type": "none"}.
- Respond ONLY with the JSON object. Do not add any other text.`,
    };

    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: [{ parts: [imagePart, textPart] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['vin', 'plate', 'none'] },
                    },
                    required: ['type'],
                }
            }
        });

        const text = response.text.trim();
        const result = JSON.parse(text) as { type: 'vin' | 'plate' | 'none' };
        
        return result.type;

    } catch (error) {
        console.error("Error classifying image code type:", error);
        throw new Error("Failed to analyze the image type.");
    }
};