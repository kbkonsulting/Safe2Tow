
import React from 'react';
import { SparkleIcon, CameraIcon, LockIcon, AdFreeIcon } from './icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 relative text-center"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                    aria-label="Close upgrade modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex justify-center mb-4">
                    <SparkleIcon className="w-12 h-12 text-brand-yellow"/>
                </div>

                <h2 id="upgrade-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upgrade to Pro</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Unlock powerful features built for professionals.</p>

                <ul className="space-y-3 text-left mb-8">
                    <li className="flex items-center gap-3">
                        <CameraIcon className="w-6 h-6 text-brand-yellow flex-shrink-0" />
                        <span className="text-gray-800 dark:text-gray-200">VIN & License Plate Scanning</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <SparkleIcon className="w-6 h-6 text-brand-yellow flex-shrink-0" />
                        <span className="text-gray-800 dark:text-gray-200">"What the Guys Say" Field Advice</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <LockIcon className="w-6 h-6 text-brand-yellow flex-shrink-0" />
                        <span className="text-gray-800 dark:text-gray-200">Vehicle Unlock Procedures</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <AdFreeIcon className="w-6 h-6 text-brand-yellow flex-shrink-0" />
                        <span className="text-gray-800 dark:text-gray-200">Ad-Free Experience</span>
                    </li>
                </ul>

                <button 
                    onClick={onUpgrade}
                    className="w-full px-6 py-3 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 transition-all"
                >
                    Upgrade Now - $9.99/month
                </button>
            </div>
        </div>
    );
};

export default UpgradeModal;
