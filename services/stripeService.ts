// --- STRIPE BACKEND CONNECTOR ---
// This file is responsible for communicating with your backend server,
// which in turn communicates securely with the Stripe API.

interface PaymentIntentParams {
    amount: number;
    name: string;
    email: string;
}

interface PaymentIntentResponse {
    clientSecret?: string;
    stripeCustomerId?: string;
    error?: string;
}

/**
 * CONNECTS to a backend API endpoint (e.g., `/api/create-payment-intent`).
 * This function makes a real network request to your server.
 * It takes an amount and customer details, requests the creation of a Stripe PaymentIntent, 
 * and returns the client_secret. The client_secret is safe to expose to the client-side.
 */
export const createPaymentIntent = async (params: PaymentIntentParams): Promise<PaymentIntentResponse> => {
    const { amount, name, email } = params;
    console.log("STRIPE SERVICE: Requesting payment intent from backend for:", { amount, name, email });

    // In a real app, you would replace this URL with your actual backend server's URL.
    // This URL should correspond to the server you set up (see README for example).
    const backendUrl = 'http://localhost:4242/api/create-payment-intent';

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount, name, email }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create payment intent');
        }
        
        const data = await response.json();
        
        if (!data.clientSecret) {
             return { error: 'Received invalid client secret from server.' };
        }
        
        console.log("STRIPE SERVICE: Successfully received client secret and customer ID.");
        return { clientSecret: data.clientSecret, stripeCustomerId: data.stripeCustomerId };

    } catch (error) {
        console.error("STRIPE SERVICE: Error fetching payment intent:", error);
        return { error: (error as Error).message };
    }
};