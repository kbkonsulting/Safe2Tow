import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';
import { SparkleIcon } from './icons';
import { Theme } from '../App';

// --- IMPORTANT ---
// Replace with your actual publishable key.
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51PbtqnRv08RNCoC6LdYg2yqX0m0jX2W2N3yV7X0z4K9l0m8X1e1w1j1m1k1h1g1f1e1d1c1b1a1Z00TgQv3s4d';
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const PLAN_PRICE_IN_CENTS = 1499; // $14.99

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: (details: { name: string; email: string; stripeCustomerId: string; }) => void;
  theme: Theme;
}

const proFeatures = [
    "VIN Search & Scan",
    "'What the Guys Say' Insider Tips",
    "Steering Lock Behavior Details",
    "AWD/4WD Variant Analysis",
    "Ad-Free Experience"
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPurchaseComplete, theme }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          aria-label="Close payment modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h2 id="payment-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Upgrade to Safe2Tow Pro</h2>
        
        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg text-center my-6">
            <div className="text-3xl font-bold text-brand-yellow">$14.99 / month</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Cancel anytime.</p>
        </div>

        <div className="mb-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">Pro benefits include:</h3>
            <ul className="space-y-2">
                {proFeatures.map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                        <SparkleIcon className="w-5 h-5 text-brand-yellow flex-shrink-0"/>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        <Elements stripe={stripePromise}>
            <StripeCheckoutForm 
                onPurchaseComplete={onPurchaseComplete}
                amountInCents={PLAN_PRICE_IN_CENTS}
                customer={{ name, email }}
                onCustomerChange={(field, value) => {
                    if (field === 'name') setName(value);
                    if (field === 'email') setEmail(value);
                }}
                theme={theme}
            />
        </Elements>
        
        <p className="text-xs text-gray-500 text-center mt-4">
            Payments are securely processed by Stripe. By upgrading, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;