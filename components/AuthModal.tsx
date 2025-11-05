import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenTerms, onOpenPrivacy }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreed) {
      setError("You must agree to the terms and privacy policy.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signUpWithEmail(name, email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      // Fix: Use property checking for Firebase v8 error objects instead of `instanceof FirebaseError`
      const firebaseError = err as { code?: string; message: string };
      if (firebaseError.code) {
        switch (firebaseError.code) {
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError('Invalid email or password.');
            break;
          case 'auth/email-already-in-use':
            setError('An account with this email already exists.');
            break;
          case 'auth/weak-password':
            setError('Password should be at least 6 characters.');
            break;
          default:
            setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleLinkClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          aria-label="Close auth modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 id="auth-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {isSignUp ? 'Create an Account' : 'Sign In'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          {isSignUp ? 'Get started with your free account.' : 'Access your account to unlock Pro features.'}
        </p>
        
        <form onSubmit={handleAuthAction} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-900 dark:text-gray-200"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-900 dark:text-gray-200"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-900 dark:text-gray-200"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isLoading || !hasAgreed}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </div>
        </form>
        
        <div className="flex items-start space-x-2 mt-4">
          <input 
            type="checkbox" 
            id="terms-agree" 
            checked={hasAgreed} 
            onChange={(e) => setHasAgreed(e.target.checked)} 
            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
          />
          <label htmlFor="terms-agree" className="text-xs text-gray-500 dark:text-gray-400">
            By continuing, you agree to the 
            <button onClick={(e) => handleLinkClick(e, onOpenTerms)} className="underline hover:text-brand-yellow mx-1">Terms of Service</button> 
            and 
            <button onClick={(e) => handleLinkClick(e, onOpenPrivacy)} className="underline hover:text-brand-yellow ml-1">Privacy Policy</button>.
          </label>
        </div>

        <div className="text-center mt-6">
            <button onClick={toggleForm} className="text-sm text-brand-yellow hover:underline">
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;