import { GoogleGenAI, Type } from "@google/genai";
import { TowingInfo } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const towingMethodSchema = {
    type: Type.OBJECT,
    properties: {
        safetyLevel: { 
            type: Type.STRING,
            enum: ['SAFE', 'SAFE_WITH_CAUTION', 'UNSAFE'],
            description: "The safety classification for this specific towing method."
        },
        instructions: { type: Type.STRING, description: "Specific instructions, including any warnings or limitations for this method." },
    },
    required: ["safetyLevel", "instructions"],
};

const awdVariantInfoSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A brief summary of the towing recommendation for the AWD/4WD variant." },
        frontTowing: towingMethodSchema,
        rearTowing: towingMethodSchema,
        cautions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of important warnings or cautions specific to the AWD/4WD variant.",
        },
        awdSystemType: { type: Type.STRING, description: "The specific type of AWD system for this variant (e.g., Haldex, Torsen)." },
        isAwdMechanicallyEngagedWhenOff: { type: Type.BOOLEAN, description: "A boolean indicating if the AWD system remains mechanically engaged (e.g., via viscous coupling) when the vehicle is off. `true` means it is engaged." },
        steeringLocksWhenOff: { type: Type.BOOLEAN, description: "A boolean indicating if the steering column locks when the vehicle is off." },
    },
    required: ["summary", "frontTowing", "rearTowing", "cautions", "awdSystemType", "isAwdMechanicallyEngagedWhenOff", "steeringLocksWhenOff"],
};


const towingInfoSchema = {
  type: Type.OBJECT,
  properties: {
    vehicle: {
      type: Type.OBJECT,
      properties: {
        year: { type: Type.NUMBER, description: "The vehicle's model year." },
        make: { type: Type.STRING, description: "The manufacturer of the vehicle." },
        model: { type: Type.STRING, description: "The model of the vehicle." },
        trim: { type: Type.STRING, description: "The specific trim level of the vehicle, or 'Unknown' if not specified." },
      },
       required: ["year", "make", "model", "trim"],
    },
    drivetrain: { type: Type.STRING, description: "The vehicle's primary/most common drivetrain (e.g., FWD, RWD, Part-Time 4WD, Full-Time AWD, EV/Hybrid)." },
    awdSystemType: { type: Type.STRING, description: "The specific type of AWD system if the primary drivetrain is AWD (e.g., Haldex, Torsen). Use 'N/A' otherwise." },
    isAwdMechanicallyEngagedWhenOff: { type: Type.BOOLEAN, description: "A boolean indicating if the AWD system remains mechanically engaged when the vehicle is off. Use `false` if not AWD. `true` means it is engaged." },
    steeringLocksWhenOff: { type: Type.BOOLEAN, description: "A boolean indicating if the steering column locks when the vehicle is off." },
    towingSafetyLevel: { 
        type: Type.STRING, 
        enum: ['SAFE', 'CAUTION', 'DOLLY_REQUIRED'],
        description: "A single, overall classification of the towing risk for the primary vehicle."
    },
    summary: { type: Type.STRING, description: "A brief, one-sentence summary of the towing recommendation for the primary vehicle." },
    frontTowing: towingMethodSchema,
    rearTowing: towingMethodSchema,
    cautions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of important general warnings or cautions for the primary vehicle.",
    },
     awdVariantInfo: Object.assign({}, awdVariantInfoSchema, {
      description: "Towing information specifically for the AWD/4WD trim of this vehicle. Omit this field entirely if no AWD/4WD variant exists or if its towing procedure is identical to the primary result."
    }),
  },
  required: ['vehicle', 'drivetrain', 'awdSystemType', 'isAwdMechanicallyEngagedWhenOff', 'steeringLocksWhenOff', 'towingSafetyLevel', 'summary', 'frontTowing', 'rearTowing', 'cautions']
};

/**
 * Fetches detailed towing information for a specific vehicle query using the Gemini AI model.
 * The AI is prompted to act as a towing expert, synthesizing manufacturer data, engineering principles,
 * and real-world operator experience to provide best-in-class guidance.
 * @param vehicleQuery A string describing the vehicle (e.g., "2021 Ford F-150 Lariat").
 * @returns A promise that resolves to a TowingInfo object.
 * @throws An error if the API call fails or the response cannot be parsed.
 */
export const getTowingInfo = async (vehicleQuery: string): Promise<TowingInfo> => {
    const prompt = `You are an expert resource for professional tow truck operators using a standard wheel-lift. Your knowledge base is a synthesis of manufacturer service manuals, drivetrain engineering principles, and real-world, field-tested information from sources like Tow Times Magazine and online operator forums.

Analyze the following vehicle: "${vehicleQuery}"

Your response MUST be a single, validated JSON object that strictly adheres to the provided schema.

**CRITICAL CONTEXT: For your entire analysis, you must assume every vehicle is completely OFF, with no key in the ignition, and the transmission is in PARK (or its equivalent state).**

PRIMARY ANALYSIS RULES:
1.  Your primary analysis should be for the most common drivetrain for the given model. Do NOT assume it is the AWD/4WD version.
2.  If an AWD or 4WD variant of this model exists and has DIFFERENT towing procedures, you MUST populate the 'awdVariantInfo' field with its specific towing details. If no AWD variant exists, or its towing procedure is identical to the base model, you MUST omit the 'awdVariantInfo' field entirely.

**EXPERT WHEEL-LIFT TOWING LOGIC:**
Your recommendations must be based on a deep understanding of the following drivetrain types.

*   **1. FWD (Front-Wheel Drive):**
    *   **Front Tow (lifting front drive wheels):** The default 'SAFE' method.
    *   **Rear Tow (front drive wheels on ground):** 'UNSAFE' by default. This is only 'SAFE_WITH_CAUTION' if the transmission can be placed in Neutral. The instructions MUST state the need for Neutral, warn about securing the non-locking steering wheel, and mention that towing for long distances or at high speed can cause transmission damage due to lack of lubrication.

*   **2. RWD (Rear-Wheel Drive):**
    *   **Rear Tow (lifting rear drive wheels):** The default 'SAFE' method.
    *   **Front Tow (rear drive wheels on ground):** 'UNSAFE' due to high risk of transmission damage from the unlubricated, spinning driveshaft. This is only 'SAFE_WITH_CAUTION' if a reliable, field-tested procedure exists to disconnect the rear driveshaft. If so, instructions must be detailed, including professional tips like "Mark the driveshaft's orientation before removal to ensure balanced reinstallation."

*   **3. Part-Time 4WD (e.g., traditional trucks/SUVs with 2H, 4H, 4L modes):**
    *   First, determine if the transfer case is in 2H. If it is, the vehicle behaves as a RWD vehicle. Apply the RWD logic above. This is the most common scenario.
    *   If the transfer case is stuck in 4H or 4L, it must be treated as a Full-Time AWD vehicle below. The instructions must emphasize that towing in 4WD mode will cause severe drivetrain binding and damage.

*   **4. Full-Time AWD (e.g., Subaru, Audi Quattro, many modern SUVs):**
    *   **Default for ALL Full-Time AWD is 'UNSAFE' for any two-wheel lift tow.** A flatbed or dollies are the only guaranteed safe methods.
    *   For the \`isAwdMechanicallyEngagedWhenOff\` property: Determine if a mechanical link (viscous coupling, default-locked clutch pack, center differential) persists between front and rear axles when OFF. If so, set to \`true\`.
    *   A 'SAFE_WITH_CAUTION' classification is ONLY permissible if you find a specific, trusted, field-tested procedure for this exact model, such as:
        1.  A procedure to put the transfer case into a true Neutral (N) that disconnects both axles.
        2.  A specific "FWD" service fuse that reliably disengages the rear axle.
        3.  An electronic "Tow Mode" that can be activated and remains active with the vehicle completely OFF and NO KEY.
    *   If such a procedure is found, the 'instructions' MUST be extremely detailed about how to perform it and explain the risks.

*   **5. EV & Hybrid Vehicles:**
    *   **Default procedure is to use dollies for the wheels remaining on the ground.** Any two-wheel tow without dollies is 'UNSAFE' by default due to the high risk of damaging motors, batteries, and power electronics from uncontrolled regenerative braking.
    *   If a manufacturer-specified "Tow Mode" or "Neutral Mode" exists that explicitly allows for two-wheel towing without dollies, you may classify that specific method as 'SAFE_WITH_CAUTION'. The instructions must be precise on how to activate it and what limitations apply.
    *   If NO such mode exists (or cannot be confirmed), then BOTH front and rear towing methods must be classified as 'SAFE_WITH_CAUTION', and their instructions MUST explicitly state that dollies are required for the wheels on the ground. For example, the front tow instruction should be "Place rear wheels on dollies. Failure to do so can cause severe damage to the electric motors and battery system."

**GENERAL PRINCIPLES TO APPLY:**
*   **Parking Pawl:** Always mention the risk of damaging the transmission's parking pawl if a vehicle's drive wheels are dragged even a short distance while in Park.
*   **Steering Lock:** You MUST determine if the steering locks when off. If 'steeringLocksWhenOff' is 'false', you MUST include instructions in the 'rearTowing.instructions' to secure the wheel (e.g., "using the seatbelt or a dedicated steering wheel clamp").`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        temperature: 0.2,
      }
    });
    
    const jsonText = response.text.trim();
    
    // Robust JSON extraction
    const startIndex = jsonText.indexOf('{');
    const endIndex = jsonText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        throw new Error("Could not find a valid JSON object in the AI response.");
    }

    const potentialJson = jsonText.substring(startIndex, endIndex + 1);
    const parsedData = JSON.parse(potentialJson);
    
    return parsedData as TowingInfo;

  } catch (error) {
    console.error("Error fetching or parsing from Gemini API:", error);
    throw new Error("Failed to get towing information from the AI model.");
  }
};

/**
 * Fetches a list of vehicle options (e.g., models, trims) for a given query.
 * The AI is prompted to act as a vehicle database expert and return a concise list.
 * @param query A string describing the desired options (e.g., "models for Ford").
 * @returns A promise that resolves to an array of strings, or an empty array on failure.
 */
export const getVehicleOptions = async (query: string): Promise<string[]> => {
  const prompt = `You are a vehicle database expert. For the query "${query}", list the most common vehicle options.
- The response MUST be a valid JSON object with a single key: "options".
- The value of "options" MUST be an array of strings.
- Each string should be a single vehicle option name only.
- Do NOT include descriptions, years, or any other information.
- Limit the list to a maximum of 50 of the most relevant options.
- Example for 'models for Ford': {"options": ["F-150", "Explorer", "Mustang", "Escape"]}`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
    required: ['options'],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0,
      },
    });

    const jsonText = response.text.trim();
    
    // Robust JSON extraction: Find the first '{' and the last '}' to extract the object.
    const startIndex = jsonText.indexOf('{');
    const endIndex = jsonText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      console.error(`Could not find a valid JSON object in the response for query "${query}". Response text: ${jsonText}`);
      return [];
    }
    
    const potentialJson = jsonText.substring(startIndex, endIndex + 1);
    const parsedData = JSON.parse(potentialJson);
    return parsedData.options || [];
  } catch (error) {
    console.error(`Error fetching vehicle options for query "${query}":`, error);
    return []; // Return empty array on failure
  }
};

/**
 * Corrects a misspelled or abbreviated vehicle make to its canonical name.
 * @param makeQuery The user-provided vehicle make (e.g., "Chevy", "Suburu").
 * @returns A promise that resolves to the corrected make string, or the original query on failure.
 */
export const getCorrectedMake = async (makeQuery: string): Promise<string> => {
  const prompt = `You are a vehicle data expert. Correct the spelling or find the canonical manufacturer name for the following input: "${makeQuery}". Your response must be a single JSON object with the key "correctedMake" containing the corrected string. For example, if the input is "Chevy" or "Chev", you should return {"correctedMake": "Chevrolet"}. If the input is already correct, return the original input.`;
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      correctedMake: { type: Type.STRING },
    },
    required: ['correctedMake'],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0,
      },
    });

    const jsonText = response.text.trim();
    const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '');
    const parsedData = JSON.parse(cleanedJsonText);
    return parsedData.correctedMake || makeQuery;
  } catch (error) {
    console.error(`Error correcting make for query "${makeQuery}":`, error);
    return makeQuery; // Return original query on failure
  }
};