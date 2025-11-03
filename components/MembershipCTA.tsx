import React from 'react';
import { LockIcon } from './icons';

interface MembershipCTAProps {
  onUpgradeClick: () => void;
  featureName: string;
}

const MembershipCTA: React.FC<MembershipCTAProps> = ({ onUpgradeClick, featureName }) => {
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900/50 rounded-lg text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
      <div className="flex justify-center mb-3">
        <LockIcon className="w-8 h-8 text-brand-yellow" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{featureName} is a Pro Feature</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-1 mb-4 max-w-sm mx-auto">
        Upgrade to a Pro membership to unlock this and other exclusive features.
      </p>
      <button 
        onClick={onUpgradeClick} 
        className="px-6 py-2.5 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 transition-all"
      >
        Upgrade to Pro
      </button>
    </div>
  );
};

export default MembershipCTA;