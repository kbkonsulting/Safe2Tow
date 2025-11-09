import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
// Fix: Import User type from central auth service instead of firebase/auth
import { User } from '../services/authService';
import StripeCheckoutForm from './StripeCheckoutForm';
import { Theme } from '../App';
import { isStripeConfigured, stripePublishableKey } from '../services/firebase';

// Architectural Fix: The Stripe promise is now initialized based on the centralized config flag.
const stripePromise = isStripeConfigured ? loadStripe(stripePublishableKey) : null;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (stripeCustomerId: string) => void;
  user: User;
  theme: Theme;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, user, theme }) => {
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
        className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg border border-gray-200 dark:border-gray-700 relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          aria-label="Close payment modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 id="payment-modal-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Upgrade to Pro</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">Unlock all features and get unlimited searches.</p>

        <div className="mb-6 p-4 bg-white dark:bg-gray-700 rounded-md">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Pro Plan</h3>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">$9.99 <span className="text-base font-normal text-gray-500 dark:text-gray-400">/ month</span></p>
            <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li className="flex items-center gap-2">✓ Unlimited Searches</li>
                <li className="flex items-center gap-2">✓ "What the Guys Say" Advice</li>
                <li className="flex items-center gap-2">✓ VIN & Image Recognition</li>
                <li className="flex items-center gap-2">✓ Remove Ads</li>
            </ul>
        </div>

        {isStripeConfigured && stripePromise ? (
          <Elements stripe={stripePromise}>
              <StripeCheckoutForm 
                onSuccess={onSuccess} 
                onClose={onClose}
                user={user}
                theme={theme}
              />
          </Elements>
        ) : (
          <div className="text-center p-4 bg-red-100 dark:bg-red-900/50 rounded-md">
            <p className="font-bold text-red-700 dark:text-red-200">Stripe Not Configured</p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">Stripe is not configured. Please set <strong>REACT_APP_STRIPE_PUBLISHABLE_KEY</strong> and <strong>REACT_APP_STRIPE_BACKEND_URL</strong> in your <strong>.env</strong> file. See the <strong>README.md</strong> for details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;