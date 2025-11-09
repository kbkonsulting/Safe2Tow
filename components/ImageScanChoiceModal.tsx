import React from 'react';
import { CameraIcon, SparkleIcon, LicensePlateIcon } from './icons';
import { ScanMode } from '../App';

interface ImageScanChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: ScanMode) => void;
  isPro: boolean;
  onUpgradeClick: () => void;
}

const ImageScanChoiceModal: React.FC<ImageScanChoiceModalProps> = ({ isOpen, onClose, onSelect, isPro, onUpgradeClick }) => {
  if (!isOpen) return null;

  const handleSelect = (mode: ScanMode) => {
    onSelect(mode);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-choice-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          aria-label="Close scan choice modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <div className="flex justify-center items-center gap-2 mb-2">
            {!isPro && <SparkleIcon className="w-6 h-6 text-brand-yellow" />}
            <h2 id="scan-choice-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Image Scan Options</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            {isPro ? "How would you like to identify the vehicle?" : "Upgrade to Pro to unlock image scanning features."}
        </p>
        
        {isPro ? (
            <div className="space-y-4">
                <button 
                    onClick={() => handleSelect('smart_code')}
                    className="w-full p-4 text-left rounded-lg border-2 transition-all border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-brand-yellow dark:hover:border-brand-yellow"
                >
                    <div className="flex items-center gap-4">
                        <LicensePlateIcon className="w-8 h-8 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Scan VIN or License Plate</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Automatically detect and decode a VIN or license plate from an image.</p>
                        </div>
                    </div>
                </button>
                <button 
                    onClick={() => handleSelect('gemini_photo')}
                    className="w-full p-4 text-left rounded-lg border-2 transition-all border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-brand-yellow dark:hover:border-brand-yellow"
                >
                    <div className="flex items-center gap-4">
                        <CameraIcon className="w-8 h-8 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Identify by Vehicle Photo</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Use AI to identify a car from a general picture (front, side, etc.).</p>
                        </div>
                    </div>
                </button>
            </div>
        ) : (
            <div className="mt-6">
                <button 
                    onClick={onUpgradeClick} 
                    className="w-full px-6 py-3 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 transition-all"
                >
                    Upgrade to Pro
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageScanChoiceModal;