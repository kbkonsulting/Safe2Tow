import React from 'react';

interface AdBannerProps {
  onUpgradeClick: () => void;
  disabled?: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ onUpgradeClick, disabled }) => {
  return (
    <div className="mt-8 mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Advertisement</p>
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          <button 
            onClick={onUpgradeClick} 
            disabled={disabled}
            className="underline hover:no-underline text-brand-yellow disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Upgrade to Pro
          </button> to remove ads and unlock all features.
        </p>
      </div>
    </div>
  );
};

export default AdBanner;