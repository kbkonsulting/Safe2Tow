const AUTODEV_API_KEY = process.env.AUTODEV_API_KEY;
const AUTODEV_API_URL = 'https://api.auto.dev/v1/plate-decoder';

interface PlateDecoderResponse {
  vin?: string;
  error?: string;
  // Potentially other fields like state, confidence, etc.
}

/**
 * Converts a base64 string to a Blob object.
 * @param base64 The base64 string.
 * @param contentType The content type of the resulting blob.
 * @returns A Blob object.
 */
const base64ToBlob = (base64: string, contentType: string = 'image/jpeg'): Blob => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
}

/**
 * Decodes a license plate image to a VIN using the auto.dev API.
 * @param base64Image The base64-encoded image of the license plate.
 * @returns The decoded VIN string, or null if not found.
 */
export const decodePlateToVin = async (base64Image: string): Promise<string | null> => {
    if (!AUTODEV_API_KEY) {
        console.error("auto.dev API key is not configured. Please set AUTODEV_API_KEY in your environment.");
        throw new Error("Plate decoding service is not configured. API key is missing.");
    }

    try {
        const formData = new FormData();
        const imageBlob = base64ToBlob(base64Image);
        // 'image' is a common field name for file uploads. The auto.dev docs would confirm this.
        formData.append('image', imageBlob, 'plate.jpg');

        const response = await fetch(AUTODEV_API_URL, {
            method: 'POST',
            headers: {
                // When using FormData with fetch, the browser automatically sets the 
                // 'Content-Type' to 'multipart/form-data' with the correct boundary.
                // Do NOT set it manually.
                'Authorization': `Bearer ${AUTODEV_API_KEY}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("auto.dev API error:", errorData);
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }

        const result: PlateDecoderResponse = await response.json();
        
        if (result.vin) {
            return result.vin;
        }

        console.warn("auto.dev response did not contain a VIN:", result);
        return null;

    } catch (error) {
        console.error("Error decoding plate from image via auto.dev:", error);
        // Re-throw the error so the UI can catch it and display a message.
        if (error instanceof Error) {
            throw new Error(`Failed to process plate decoding: ${error.message}`);
        }
        throw new Error("An unknown error occurred during plate decoding.");
    }
};