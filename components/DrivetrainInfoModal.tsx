import React, { useEffect } from 'react';

interface DrivetrainInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string | null;
}

const DrivetrainInfoModal: React.FC<DrivetrainInfoModalProps> = ({ isOpen, onClose, initialSection }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialSection) {
        // Use a timeout to ensure the element is rendered and visible before scrolling
        setTimeout(() => {
          const element = document.getElementById(`${initialSection}-section`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 150);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialSection]);

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
        <p className="text-gray-600 dark:text-gray-400 mb-6">General principles for wheel-lift towing based on drivetrain. This information is based on best practices from seasoned tow operators. Always refer to the specific vehicle's instructions for manufacturer guidance.</p>

        <div className="space-y-5">
          <div id="fwd-section">
            <h3 className="text-lg font-semibold text-brand-yellow mb-1">FWD (Front-Wheel Drive)</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Power is sent to the front wheels. The safest method is to lift the front wheels off the ground (a "front tow"). Towing with the front drive wheels on the ground can cause transmission damage.
            </p>
          </div>
          <div id="rwd-section">
            <h3 className="text-lg font-semibold text-brand-yellow mb-1">RWD (Rear-Wheel Drive)</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Power is sent to the rear wheels. The safest method is to lift the rear wheels off the ground (a "rear tow"). Towing with the rear drive wheels on the ground can cause severe transmission damage from the driveshaft spinning without lubrication.
            </p>
          </div>
          <div id="awd-section">
            <h3 className="text-lg font-semibold text-brand-yellow mb-1">AWD/4WD (All-Wheel/Four-Wheel Drive)</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                    Power can be sent to all four wheels. These systems are complex and easily damaged. The default safe method is to use a flatbed or place the non-lifted wheels on dollies. Towing with any two wheels on the ground risks severe damage to the transfer case, center differential, or transmission.
                </p>
                <div className="pl-4 border-l-4 border-gray-200 dark:border-gray-600 space-y-3 mt-3">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Part-Time 4WD (e.g., many trucks, Jeep Wranglers)</h4>
                        <p>
                            The driver manually engages 4WD. When in 2WD, it behaves like a RWD vehicle. If the transfer case has a "Neutral" position, it *may* be possible to tow with all four wheels down, but this must be confirmed. Otherwise, treat it as RWD when in 2WD mode (lift the rear wheels). If unsure, use a flatbed.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Full-Time AWD (e.g., Subaru, Audi Quattro)</h4>
                        <p>
                            Power is constantly sent to all four wheels through a center differential. <strong className="text-red-500">Never tow these vehicles with any wheels on the ground.</strong> The center differential will be destroyed. A flatbed or dollies on all four wheels is mandatory.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">On-Demand / Automatic AWD (e.g., most crossovers, modern SUVs)</h4>
                        <p>
                            The vehicle operates in FWD or RWD most of the time and automatically engages the other axle when slip is detected. This is the riskiest type to tow on a wheel-lift, as the AWD system can engage unexpectedly, even with the engine off, if the wheels are spinning at different speeds. The safest and recommended method is always a flatbed or dollies.
                        </p>
                    </div>
                </div>
            </div>
          </div>
          <div id="ev-section">
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
