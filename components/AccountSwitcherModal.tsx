
import React from 'react';
import { SparkleIcon } from './icons';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  setIsPro: (isPro: boolean) => void;
  isUserLoggedIn: boolean;
}

const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({ isOpen, onClose, isPro, setIsPro, isUserLoggedIn }) => {
  if (!isOpen) return null;

  const handleSetPro = () => {
    setIsPro(true);
    onClose();
  };

  const handleSetFree = () => {
    setIsPro(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-switcher-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          aria-label="Close account modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h2 id="account-switcher-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-2">Switch Account Mode</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Select an account type for testing. This simulates the experience of a free or pro user.</p>
        
        {isUserLoggedIn && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg text-center">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    You are logged in. Your account status is managed by your subscription. This switcher is for testing purposes only.
                </p>
            </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleSetFree}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              !isPro 
                ? 'border-brand-yellow bg-amber-50 dark:bg-amber-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Free Account</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Standard access with ads and limited features.</p>
            {!isPro && <p className="text-xs font-bold text-brand-yellow mt-2">CURRENTLY ACTIVE</p>}
          </button>

          <button 
            onClick={handleSetPro}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              isPro 
                ? 'border-brand-yellow bg-amber-50 dark:bg-amber-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <SparkleIcon className="w-5 h-5 text-brand-yellow" />
              Pro Account
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Unlock all features and remove ads.</p>
            {isPro && <p className="text-xs font-bold text-brand-yellow mt-2">CURRENTLY ACTIVE</p>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSwitcherModal;
