// This URL should point to your backend server endpoint that creates a Stripe PaymentIntent.
// It is configured via an environment variable for flexibility.
// See the README.md for instructions on setting up the backend server.
const STRIPE_BACKEND_URL = process.env.REACT_APP_STRIPE_BACKEND_URL || 'http://localhost:4242/api/create-payment-intent';

interface PaymentIntentResponse {
  clientSecret: string;
  stripeCustomerId: string;
  error?: string;
}

/**
 * Calls a backend server to create a Stripe PaymentIntent for a given user.
 * @param name - The customer's full name.
 * @param email - The customer's email address.
 * @returns An object containing the `clientSecret` for the payment and the `stripeCustomerId`.
 */
export const createPaymentIntent = async (name: string, email: string): Promise<PaymentIntentResponse> => {
  try {
    const response = await fetch(STRIPE_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create Payment Intent.');
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Payment Intent:", error);
    if (error instanceof Error) {
      // Provide a more user-friendly error message for network or server issues.
      if (error.message.includes('Failed to fetch')) {
        return { clientSecret: '', stripeCustomerId: '', error: 'Could not connect to the payment server. Please check your connection and try again.' };
      }
      return { clientSecret: '', stripeCustomerId: '', error: error.message };
    }
    return { clientSecret: '', stripeCustomerId: '', error: 'An unknown error occurred.' };
  }
};