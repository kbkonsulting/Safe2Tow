import React from 'react';

interface MembershipToggleProps {
  isPro: boolean;
  onToggle: (isPro: boolean) => void;
  disabled?: boolean;
}

const MembershipToggle: React.FC<MembershipToggleProps> = ({ isPro, onToggle, disabled = false }) => {
  const toggleClasses = `w-8 h-4 rounded-full transition-colors ${isPro ? 'bg-brand-yellow' : 'bg-gray-300 dark:bg-gray-600'}`;
  const handleClasses = `block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${isPro ? 'translate-x-4' : 'translate-x-0'}`;

  const containerClass = `flex items-center gap-3 p-1 sm:p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;

  return (
    <div className={containerClass}>
      <span className={`text-xs font-bold ${!isPro ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>Free</span>
      <button
        onClick={() => onToggle(!isPro)}
        className={toggleClasses}
        role="switch"
        aria-checked={isPro}
        aria-label="Toggle membership plan"
        disabled={disabled}
      >
        <span className={handleClasses}></span>
      </button>
      <span className={`text-xs font-bold ${isPro ? 'text-brand-yellow' : 'text-gray-400 dark:text-gray-500'}`}>Pro</span>
    </div>
  );
};

export default MembershipToggle;
