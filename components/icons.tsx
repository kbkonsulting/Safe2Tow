
import React from 'react';

type IconProps = {
  className?: string;
};

export const AppIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    viewBox="-4 -4 72 72"
    className={className}
    aria-label="Drivetrain icon"
  >
    {/* Sticker Outline Effect Layer */}
    <g stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="50" width="12" height="10" rx="2" fill="white" stroke="white" />
        <rect x="50" y="50" width="12" height="10" rx="2" fill="white" stroke="white" />
        <rect x="2" y="4" width="12" height="10" rx="2" fill="white" stroke="white" />
        <rect x="50" y="4" width="12" height="10" rx="2" fill="white" stroke="white" />
        <path d="M14 55 H 50" fill="none" />
        <circle cx="32" cy="55" r="5" fill="white" stroke="white" />
        <path d="M32 28 V 50" fill="none" />
        <path d="M26 18 L 26 28 L 38 28 L 38 18 L 35 14 L 29 14 Z" fill="white" stroke="white" />
        <path d="M14 9 H 22" fill="none" />
        <path d="M42 9 H 50" fill="none" />
        <circle cx="25" cy="9" r="5" fill="white" stroke="white" />
        <path d="M25 14 V 9" fill="none" />
        <path d="M25 9 L 32 9" fill="none" />
    </g>
    
    {/* Main Graphic Layer */}
    <g>
      {/* Wheels (Black) */}
      <g fill="black">
        <rect x="2" y="50" width="12" height="10" rx="2" />
        <rect x="50" y="50" width="12" height="10" rx="2" />
        <rect x="2" y="4" width="12" height="10" rx="2" />
        <rect x="50" y="4" width="12" height="10" rx="2" />
      </g>

      {/* Drivetrain parts (Yellow with Black Outline) */}
      <g fill="#FBBF24" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 55 H 50" fill="none" />
        <circle cx="32" cy="55" r="5" />
        <path d="M32 28 V 50" fill="none" />
        <path d="M26 18 L 26 28 L 38 28 L 38 18 L 35 14 L 29 14 Z" />
        <path d="M14 9 H 22" fill="none" />
        <path d="M42 9 H 50" fill="none" />
        <circle cx="25" cy="9" r="5" />
        <path d="M25 14 V 9" fill="none" />
        <path d="M25 9 L 32 9" fill="none" />
      </g>
    </g>
  </svg>
);


export const SafeIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const CautionIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const DollyIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M17 17H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h14l4 4v8" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

export const LockIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

export const CameraIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
    </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export const CogIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/>
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    <path d="M12 2v2m0 18v-2m-6.36-2.64L7.05 16m9.9-9.9-1.41-1.41M2 12h2m18 0h-2m-2.64-6.36L16 7.05m-9.9 9.9 1.41 1.41"/>
  </svg>
);

export const FeedbackIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

export const LicensePlateIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
        <path d="M6 12h4m4 0h4"></path>
    </svg>
);

export const AdFreeIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
    </svg>
);
