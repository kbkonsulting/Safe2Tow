import React, { useState, FormEvent } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { StripeCardElementOptions } from '@stripe/stripe-js';
// Fix: Import User type from central auth service instead of firebase/auth
import { User } from '../services/authService';
import { createPaymentIntent } from '../services/stripeService';
import { Theme } from '../App';

interface StripeCheckoutFormProps {
    onSuccess: (stripeCustomerId: string) => void;
    onClose: () => void;
    user: User;
    theme: Theme;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({ onSuccess, onClose, user, theme }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        
        if (!stripe || !elements || !user.email) {
            return;
        }

        setProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setProcessing(false);
            return;
        }
        
        // 1. Create Payment Intent on your server
        const intentResponse = await createPaymentIntent(user.displayName || 'New User', user.email);

        if (intentResponse.error || !intentResponse.clientSecret) {
            setError(intentResponse.error || "Failed to initialize payment.");
            setProcessing(false);
            return;
        }

        // 2. Confirm the payment on the client
        const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(intentResponse.clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: user.displayName,
                    email: user.email,
                },
            },
        });

        if (paymentError) {
            setError(paymentError.message ?? "An unexpected error occurred.");
            setProcessing(false);
            return;
        }

        if (paymentIntent?.status === 'succeeded') {
            console.log('Payment successful!');
            onSuccess(intentResponse.stripeCustomerId);
            onClose();
        } else {
            setError(`Payment failed with status: ${paymentIntent?.status}`);
        }

        setProcessing(false);
    };

    const cardElementOptions: StripeCardElementOptions = {
        style: {
            base: {
                color: theme === 'dark' ? '#FFFFFF' : '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: theme === 'dark' ? '#aab7c4' : '#aab7c4',
                },
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a",
            },
        },
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={`p-3 border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <CardElement options={cardElementOptions} />
            </div>
            {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full mt-4 px-6 py-3 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {processing ? "Processing..." : "Pay Now"}
            </button>
        </form>
    );
};

export default StripeCheckoutForm;
