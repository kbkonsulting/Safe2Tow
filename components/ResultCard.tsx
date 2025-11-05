import React from 'react';
import { TowingInfo, TowingSafetyLevel, TowingMethodSafetyLevel } from '../types';
import { SafeIcon, CautionIcon, DollyIcon, InfoIcon, LockIcon, SparkleIcon } from './icons';
import Accordion from './Accordion';
import AnecdotalAdviceCTA from './AnecdotalAdviceCTA';
import MembershipCTA from './MembershipCTA';

interface ResultCardProps {
  towingInfo: TowingInfo;
  isPro: boolean;
  onUpgradeClick: () => void;
  onLoginClick: () => void;
  onFeedbackClick: () => void;
  onDrivetrainInfoClick: (drivetrain: string) => void;
  upgradeDisabled?: boolean;
}

const safetyLevelMap = {
  [TowingSafetyLevel.SAFE]: {
    text: 'Safe to Tow with Caution',
    icon: SafeIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
  },
  [TowingSafetyLevel.CAUTION]: {
    text: 'Caution Advised',
    icon: CautionIcon,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
  },
  [TowingSafetyLevel.DOLLY_REQUIRED]: {
    text: 'Dollies / Flatbed Required',
    icon: DollyIcon,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/50',
  },
};

const methodSafetyLevelMap = {
  [TowingMethodSafetyLevel.SAFE]: {
    text: 'Safe',
    color: 'text-green-600 dark:text-green-400',
  },
  [TowingMethodSafetyLevel.SAFE_WITH_CAUTION]: {
    text: 'Safe with Caution',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  [TowingMethodSafetyLevel.UNSAFE]: {
    text: 'Unsafe',
    color: 'text-red-600 dark:text-red-400',
  },
};

const getDrivetrainSectionId = (drivetrain: string): string => {
  const lowerDrivetrain = drivetrain.toLowerCase();
  if (lowerDrivetrain.includes('awd') || lowerDrivetrain.includes('4wd')) return 'awd';
  if (lowerDrivetrain.includes('fwd')) return 'fwd';
  if (lowerDrivetrain.includes('rwd')) return 'rwd';
  if (lowerDrivetrain.includes('ev') || lowerDrivetrain.includes('hybrid')) return 'ev';
  return '';
};


const ResultCard: React.FC<ResultCardProps> = ({ towingInfo, isPro, onUpgradeClick, onLoginClick, onFeedbackClick, onDrivetrainInfoClick, upgradeDisabled }) => {
  const safetyInfo = safetyLevelMap[towingInfo.towingSafetyLevel];
  const SafetyIcon = safetyInfo.icon;

  const handleProFeatureClick = () => {
    if (upgradeDisabled) return;
    onUpgradeClick();
  }

  const handleDrivetrainClick = () => {
    const sectionId = getDrivetrainSectionId(towingInfo.drivetrain);
    if (sectionId) {
      onDrivetrainInfoClick(sectionId);
    }
  };

  const renderTowingMethod = (title: string, method: TowingInfo['frontTowing']) => {
    const methodSafety = methodSafetyLevelMap[method.safetyLevel];
    return (
      <div>
        <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{title}</h4>
        <p className="font-bold my-1">
          Safety Level: <span className={methodSafety.color}>{methodSafety.text}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{method.instructions}</p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up">
      <div className={`p-6 ${safetyInfo.bgColor}`}>
        <div className="flex items-center gap-4">
          <SafetyIcon className={`w-10 h-10 flex-shrink-0 ${safetyInfo.color}`} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{towingInfo.vehicle.year} {towingInfo.vehicle.make} {towingInfo.vehicle.model}</h2>
            <p className={`text-lg font-semibold ${safetyInfo.color}`}>{safetyInfo.text}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Accordion title={<span className="font-bold text-gray-800 dark:text-gray-200">Executive Summary</span>} startOpen={true}>
          <p className="text-gray-700 dark:text-gray-300">{towingInfo.summary}</p>
        </Accordion>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-center items-center gap-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Drivetrain</p>
                    <button onClick={handleDrivetrainClick} aria-label={`Learn more about ${towingInfo.drivetrain} towing`}>
                        <InfoIcon className="w-4 h-4 text-blue-500 hover:text-blue-400" />
                    </button>
                </div>
                <p className="font-bold text-gray-800 dark:text-gray-100">{towingInfo.drivetrain}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">AWD System</p>
                <p className="font-bold text-gray-800 dark:text-gray-100">{towingInfo.awdSystemType || 'N/A'}</p>
            </div>
        </div>

        <Accordion title={<span className="font-bold text-gray-800 dark:text-gray-200">Towing Procedures</span>} startOpen={true}>
            <div className="space-y-6">
                {renderTowingMethod('Front Tow (Lifting Front Wheels)', towingInfo.frontTowing)}
                <hr className="border-gray-200 dark:border-gray-600"/>
                {renderTowingMethod('Rear Tow (Lifting Rear Wheels)', towingInfo.rearTowing)}
            </div>
        </Accordion>

        <Accordion title={
            <div className="flex items-center gap-2">
                <CautionIcon className="w-5 h-5 text-yellow-500"/>
                <span className="font-bold text-gray-800 dark:text-gray-200">Important Cautions</span>
            </div>
        }>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {towingInfo.cautions.map((caution, i) => <li key={i}>{caution}</li>)}
            </ul>
        </Accordion>
        
        {towingInfo.isDrivetrainEngagedWhenOff && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                <InfoIcon className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200"><span className="font-bold">Drivetrain Engagement:</span> The drivetrain may remain engaged even when the vehicle is off. Towing without dollies can cause damage.</p>
            </div>
        )}

        {towingInfo.steeringLocksWhenOff && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                <LockIcon className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200"><span className="font-bold">Steering Lock:</span> The steering wheel will lock when the vehicle is off. Ensure the key is in the 'ON' position if towing with wheels on the ground to prevent this.</p>
            </div>
        )}

        {towingInfo.awdVariantInfo && (
            <Accordion title={<span className="font-bold text-gray-800 dark:text-gray-200">AWD Variant Information</span>}>
                {isPro ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">{towingInfo.awdVariantInfo.summary}</p>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
                            {renderTowingMethod('Variant: Front Tow', towingInfo.awdVariantInfo.frontTowing)}
                            <hr className="border-gray-200 dark:border-gray-600"/>
                            {renderTowingMethod('Variant: Rear Tow', towingInfo.awdVariantInfo.rearTowing)}
                        </div>
                    </div>
                ) : <MembershipCTA onUpgradeClick={handleProFeatureClick} featureName="AWD Variant Details" disabled={upgradeDisabled} />}
            </Accordion>
        )}
        
        <Accordion title={
            <div className="flex items-center gap-2">
                <SparkleIcon className="w-5 h-5 text-brand-yellow"/>
                <span className="font-bold text-gray-800 dark:text-gray-200">"What the Guys Say" (Anecdotal Advice)</span>
            </div>
        }>
            {isPro ? (
                <div className="space-y-4">
                    {towingInfo.anecdotalAdvice && towingInfo.anecdotalAdvice.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Vehicle-Specific Tips:</h4>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                {towingInfo.anecdotalAdvice.map((advice, i) => <li key={i}>{advice}</li>)}
                            </ul>
                        </div>
                    )}
                    
                    <div className={towingInfo.anecdotalAdvice && towingInfo.anecdotalAdvice.length > 0 ? "pt-4 border-t border-gray-200 dark:border-gray-600" : ""}>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">General Field Tricks:</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                            <li><strong>Popping Linkage:</strong> On many trucks, if you can't shift to neutral, look for the shift linkage under the vehicle near the transmission. You can often pop it off its ball joint to manually move the lever into neutral.</li>
                            <li><strong>Electronic Parking Brakes:</strong> If you suspect an electronic parking brake is stuck on, try gently rocking the vehicle back and forth. Sometimes this can help release it. Always confirm before dragging.</li>
                            <li><strong>Lockouts:</strong> Before calling a locksmith, do a quick online search for your vehicle model and "lockout tricks." You might find a simple, non-damaging way to gain entry.</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <AnecdotalAdviceCTA onUpgradeClick={handleProFeatureClick} disabled={upgradeDisabled} />
            )}
        </Accordion>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        This information is for guidance only. Always consult the manufacturer's official manual.
        <button onClick={onFeedbackClick} className="ml-2 underline hover:text-brand-yellow">Report an issue</button>
      </div>
    </div>
  );
};

export default ResultCard;