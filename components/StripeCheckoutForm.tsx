import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../services/stripeService';
import { LockIcon } from './icons';
import { Theme } from '../App';

interface StripeCheckoutFormProps {
    onPurchaseComplete: (details: { name: string; email: string; stripeCustomerId: string; }) => void;
    amountInCents: number;
    customer: { name: string; email: string };
    onCustomerChange: (field: 'name' | 'email', value: string) => void;
    theme: Theme;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({ onPurchaseComplete, amountInCents, customer, onCustomerChange, theme }) => {
    const stripe = useStripe();
    const elements = useElements();
    
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [intentRequested, setIntentRequested] = useState(false);

    const cardElementOptions = {
        style: {
          base: {
            color: theme === 'dark' ? '#ffffff' : '#111827',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: theme === 'dark' ? '#6b7280' : '#9ca3af',
            },
          },
          invalid: {
            color: '#EF4444',
            iconColor: '#EF4444',
          },
        },
        hidePostalCode: true,
    };

    useEffect(() => {
        // Step 1: When customer details are valid, create a PaymentIntent on your backend.
        if (amountInCents > 0 && customer.name && customer.email && !intentRequested) {
            setError(null);
            setIntentRequested(true); // Prevent re-requesting on re-renders
            createPaymentIntent({ amount: amountInCents, name: customer.name, email: customer.email })
                .then(data => {
                    if (data.clientSecret && data.stripeCustomerId) {
                        setClientSecret(data.clientSecret);
                        setStripeCustomerId(data.stripeCustomerId);
                    } else {
                        setError(data.error || 'Could not initialize payment. Please try again.');
                        setIntentRequested(false); // Allow retry
                    }
                })
                .catch((e) => {
                    setError('Could not connect to payment server. Please ensure it is running.');
                    console.error(e);
                    setIntentRequested(false); // Allow retry
                });
        }
    }, [amountInCents, customer, intentRequested]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!stripe || !elements || !clientSecret || !stripeCustomerId) {
            // Stripe.js has not yet loaded or client secret is not available.
            return;
        }

        setProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
             setError('Card details not found.');
             setProcessing(false);
             return;
        }
        
        // Step 2: Use the real clientSecret to confirm the payment with Stripe.
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                  name: customer.name,
                  email: customer.email,
                },
            },
        });

        if (result.error) {
            setError(result.error.message || "An unexpected error occurred.");
            setProcessing(false);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                console.log("STRIPE CHECKOUT: Payment successful! Upgrading user to Pro.");
                onPurchaseComplete({ name: customer.name, email: customer.email, stripeCustomerId });
            } else {
                 setError(`Payment status: ${result.paymentIntent.status}. Please contact support.`);
                 setProcessing(false);
            }
        }
    };
    
    const isReadyForPayment = stripe && elements && clientSecret;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                <input
                    id="name"
                    type="text"
                    value={customer.name}
                    onChange={(e) => onCustomerChange('name', e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
            </div>
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
                <input
                    id="email"
                    type="email"
                    value={customer.email}
                    onChange={(e) => onCustomerChange('email', e.target.value)}
                    placeholder="jane.doe@example.com"
                    required
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
            </div>
            
            <div className={!customer.name || !customer.email ? 'opacity-50' : ''}>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Card Details</label>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                     <CardElement options={cardElementOptions} />
                </div>
            </div>
            
            {error && <div className="text-danger-red text-sm text-center pt-1">{error}</div>}

            <button 
                type="submit"
                disabled={!isReadyForPayment || processing}
                className="w-full mt-2 px-6 py-3 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
                {processing ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </>
                ) : (
                    <>
                        <LockIcon className="w-5 h-5"/>
                        Pay Securely
                    </>
                )}
            </button>
        </form>
    );
};

export default StripeCheckoutForm;