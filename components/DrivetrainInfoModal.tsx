import React, { useEffect } from 'react';

interface DrivetrainInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DrivetrainInfoModal: React.FC<DrivetrainInfoModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drivetrain-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700 relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          aria-label="Close drivetrain info modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 id="drivetrain-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Drivetrain Towing Guide</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">General principles for wheel-lift towing based on drivetrain. Always refer to the specific vehicle's instructions.</p>

        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-brand-yellow mb-1">FWD (Front-Wheel Drive)</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Power is sent to the front wheels. The safest method is to lift the front wheels off the ground (a "front tow"). Towing with the front drive wheels on the ground can cause transmission damage.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-yellow mb-1">RWD (Rear-Wheel Drive)</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Power is sent to the rear wheels. The safest method is to lift the rear wheels off the ground (a "rear tow"). Towing with the rear drive wheels on the ground can cause severe transmission damage from the driveshaft spinning without lubrication.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-yellow mb-1">AWD/4WD (All-Wheel/Four-Wheel Drive)</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Power can be sent to all four wheels. These systems are complex and easily damaged. The default safe method is to use a flatbed or place the non-lifted wheels on dollies. Towing with any two wheels on the ground risks severe damage to the transfer case, differentials, or transmission.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-yellow mb-1">EV & Hybrid</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Electric motors are connected to the wheels. Towing with drive wheels on the ground can cause the motors to generate electricity (regenerative braking), potentially damaging the motors, controllers, or battery. Dollies or a flatbed are almost always required unless a specific "Tow Mode" is activated.
            </p>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrivetrainInfoModal;