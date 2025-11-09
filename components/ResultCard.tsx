import React from 'react';
import { TowingInfo, TowingSafetyLevel, TowingMethodSafetyLevel } from '../types';
import { SafeIcon, CautionIcon, DollyIcon, InfoIcon, LockIcon, SparkleIcon, CogIcon, FeedbackIcon } from './icons';
import Accordion from './Accordion';
import AnecdotalAdviceCTA from './AnecdotalAdviceCTA';

interface ResultCardProps {
  towingInfo: TowingInfo;
  isPro: boolean;
  onUpgradeClick: () => void;
  onDrivetrainInfoClick: (drivetrain: string) => void;
  onFeedbackClick: () => void;
  communityFeedback?: string[];
}

const safetyLevelMap = {
  [TowingSafetyLevel.SAFE]: {
    text: 'Safe to Tow',
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


const ResultCard: React.FC<ResultCardProps> = ({
  towingInfo,
  isPro,
  onUpgradeClick,
  onDrivetrainInfoClick,
  onFeedbackClick,
  communityFeedback,
}) => {
  const { vehicle, summary, drivetrain, towingSafetyLevel, cautions, frontTowing, rearTowing, anecdotalAdvice, unlockAdvice, awdVariantInfo } = towingInfo;
  const safetyInfo = safetyLevelMap[towingSafetyLevel];
  const SafetyIcon = safetyInfo.icon;

  const formatInstructions = (instructions: string) => (
    <ol className="list-decimal pl-5 space-y-1 text-gray-700 dark:text-gray-300">
      {instructions.split('\\n').map((line, index) => (
        <li key={index}>{line.replace(/^\d+\.\s*/, '')}</li>
      ))}
    </ol>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up">
      <header className={`p-6 ${safetyInfo.bgColor}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {vehicle.year} {vehicle.make} {vehicle.model}
              <span className="text-lg font-medium text-gray-600 dark:text-gray-400 ml-2">({vehicle.trim})</span>
            </h2>
            <button 
              onClick={() => onDrivetrainInfoClick(getDrivetrainSectionId(drivetrain))} 
              className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-2 hover:text-brand-yellow"
            >
              <CogIcon className="w-4 h-4" />
              {drivetrain}
              <InfoIcon className="w-4 h-4" />
            </button>
          </div>
          <div className={`p-3 rounded-lg flex items-center gap-3 text-lg font-bold ${safetyInfo.color}`}>
            <SafetyIcon className="w-7 h-7" />
            <span>{safetyInfo.text}</span>
          </div>
        </div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">{summary}</p>
      </header>

      <div className="p-6 space-y-4">
        <Accordion title={<span className="font-bold">Towing Procedures</span>} startOpen={true}>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Front Tow (Lifting Front Wheels)</h3>
              <p className={`text-sm font-bold ${methodSafetyLevelMap[frontTowing.safetyLevel].color}`}>
                {methodSafetyLevelMap[frontTowing.safetyLevel].text}
              </p>
              {formatInstructions(frontTowing.instructions)}
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Rear Tow (Lifting Rear Wheels)</h3>
              <p className={`text-sm font-bold ${methodSafetyLevelMap[rearTowing.safetyLevel].color}`}>
                {methodSafetyLevelMap[rearTowing.safetyLevel].text}
              </p>
              {formatInstructions(rearTowing.instructions)}
            </div>
          </div>
        </Accordion>
        
        {awdVariantInfo && (
          <Accordion title={<span className="font-bold flex items-center gap-2"><InfoIcon className="w-5 h-5"/>AWD Variant Info</span>}>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">{awdVariantInfo.summary}</p>
            </div>
          </Accordion>
        )}

        <Accordion title={<span className="font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2"><CautionIcon className="w-5 h-5"/>Cautions & Alerts</span>}>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                {cautions.map((caution, index) => <li key={index}>{caution}</li>)}
            </ul>
        </Accordion>
        
        {unlockAdvice && unlockAdvice.length > 0 && (
          <Accordion title={<span className="font-bold flex items-center gap-2"><LockIcon className="w-5 h-5"/>Unlock Advice (Pro)</span>}>
            {isPro ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                {unlockAdvice.map((advice, index) => <li key={index}>{advice}</li>)}
              </ul>
            ) : <AnecdotalAdviceCTA onUpgradeClick={onUpgradeClick} />}
          </Accordion>
        )}

        <Accordion 
          title={<span className="font-bold flex items-center gap-2"><SparkleIcon className="w-5 h-5 text-brand-yellow"/>What the Guys Say (Pro)</span>}
          startOpen={!!(communityFeedback && communityFeedback.length > 0)}
        >
          {isPro ? (
            <div className="space-y-4">
              {(anecdotalAdvice && anecdotalAdvice.length > 0) && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">From the Experts:</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    {anecdotalAdvice.map((advice, index) => <li key={index}>{advice}</li>)}
                  </ul>
                </div>
              )}
              
              {communityFeedback && communityFeedback.length > 0 && (
                <div className={(anecdotalAdvice && anecdotalAdvice.length > 0) ? 'pt-4 mt-4 border-t border-gray-200 dark:border-gray-700' : ''}>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">From the Community:</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    {communityFeedback.map((feedback, index) => <li key={index} className="whitespace-pre-wrap">{feedback}</li>)}
                  </ul>
                </div>
              )}

              {(!anecdotalAdvice || anecdotalAdvice.length === 0) && (!communityFeedback || communityFeedback.length === 0) && (
                 <p className="text-gray-500 dark:text-gray-400 italic">No anecdotal advice available for this model yet. Be the first to provide feedback!</p>
              )}
            </div>
          ) : (
            <AnecdotalAdviceCTA onUpgradeClick={onUpgradeClick} />
          )}
        </Accordion>
      </div>

      <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-200 dark:border-gray-700">
        <button onClick={onFeedbackClick} className="font-semibold text-sm text-gray-600 dark:text-gray-300 hover:text-brand-yellow flex items-center gap-2 mx-auto">
          <FeedbackIcon className="w-5 h-5" />
          See an issue? Provide feedback.
        </button>
      </footer>
    </div>
  );
};

export default ResultCard;