import React from 'react';
import { SparkleIcon } from './icons';

interface AnecdotalAdviceCTAProps {
  onUpgradeClick: () => void;
}

const AnecdotalAdviceCTA: React.FC<AnecdotalAdviceCTAProps> = ({ onUpgradeClick }) => {
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg text-center border-2 border-dashed border-gray-300 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 dark:from-gray-900/50 to-transparent"></div>
        <div className="relative z-10">
            <div className="flex justify-center mb-2">
                <SparkleIcon className="w-8 h-8 text-brand-yellow" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">'What the Guys Say' is a Pro Feature</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1 mb-4 max-w-sm mx-auto">
                Get exclusive, field-tested advice from veteran operators by upgrading.
            </p>
            <button 
                onClick={onUpgradeClick} 
                className="px-5 py-2 font-semibold text-sm text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 transition-all"
            >
                Unlock with Pro
            </button>
        </div>
    </div>
  );
};

export default AnecdotalAdviceCTA;