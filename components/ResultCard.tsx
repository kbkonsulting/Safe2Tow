import React from 'react';
import { TowingInfo, TowingSafetyLevel, TowingMethodSafetyLevel, TowingMethod } from '../types';
import { SafeIcon, CautionIcon, DollyIcon, InfoIcon, SparkleIcon } from './icons';
import AnecdotalAdviceCTA from './AnecdotalAdviceCTA';
import Accordion from './Accordion';

interface ResultCardProps {
  towingInfo: TowingInfo;
  onOpenDrivetrainInfo: () => void;
  isMember: boolean;
  onUpgradeClick: () => void;
}

const TowingMethodCard: React.FC<{ title: string; method: TowingMethod }> = ({ title, method }) => {
  const meta = {
    [TowingMethodSafetyLevel.UNSAFE]: {
      borderColor: 'border-danger-red',
      textColor: 'text-danger-red',
      Icon: DollyIcon,
      title: 'Dolly / Flatbed Required'
    },
    [TowingMethodSafetyLevel.SAFE_WITH_CAUTION]: {
      borderColor: 'border-caution-yellow',
      textColor: 'text-caution-yellow',
      Icon: CautionIcon,
      title: 'Safe with Caution'
    },
    [TowingMethodSafetyLevel.SAFE]: {
      borderColor: 'border-safe-green',
      textColor: 'text-safe-green',
      Icon: SafeIcon,
      title: 'Safe to Tow'
    }
  }[method.safetyLevel];

  return (
    <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 ${meta.borderColor} p-4`}>
      <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{title}</h4>
      <div className={`flex items-center gap-2 mb-2 font-semibold ${meta.textColor}`}>
        <meta.Icon className="w-5 h-5" />
        <span>{meta.title}</span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{method.instructions}</p>
    </div>
  );
};

const DrivetrainDetails: React.FC<{ 
    details: Pick<TowingInfo, 'awdSystemType' | 'isDrivetrainEngagedWhenOff' | 'steeringLocksWhenOff'>;
    isMember: boolean;
    onUpgradeClick: () => void;
}> = ({ details, isMember, onUpgradeClick }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">AWD System Type</h4>
            <p className="text-lg text-gray-900 dark:text-white font-medium">{details.awdSystemType || 'N/A'}</p>
        </div>
        <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Drivetrain Engaged (Off)</h4>
             <p className={`text-lg font-medium ${details.isDrivetrainEngagedWhenOff ? 'text-danger-red' : 'text-safe-green'}`}>
                {details.isDrivetrainEngagedWhenOff ? 'Yes' : 'No'}
            </p>
        </div>
        <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg relative">
             {!isMember && (
                <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                   <button onClick={onUpgradeClick} className="px-3 py-1.5 text-sm font-semibold bg-brand-yellow text-gray-900 rounded-md hover:bg-amber-400 transition-colors">
                        Unlock with Pro
                    </button>
                </div>
            )}
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Steering Locks (Off)</h4>
            <p className={`text-lg font-medium ${details.steeringLocksWhenOff ? 'text-safe-green' : 'text-danger-red'}`}>
                {details.steeringLocksWhenOff ? 'Yes' : 'No'}
            </p>
        </div>
    </div>
);


const ResultCard: React.FC<ResultCardProps> = ({ towingInfo, onOpenDrivetrainInfo, isMember, onUpgradeClick }) => {
  if (!towingInfo || !towingInfo.vehicle) {
    return (
      <div className="text-center p-6 bg-red-100 dark:bg-red-900/50 border border-danger-red rounded-lg text-red-700 dark:text-red-300 animate-fade-in">
        The AI returned an incomplete response. Please try your search again or rephrase it.
      </div>
    );
  }
  
  const { vehicle, drivetrain, towingSafetyLevel, summary, frontTowing, rearTowing, cautions, awdVariantInfo, anecdotalAdvice, ...primaryDetails } = towingInfo;

  const safetyMeta = {
    [TowingSafetyLevel.SAFE]: {
      borderColor: 'border-safe-green',
      textColor: 'text-safe-green',
      Icon: SafeIcon,
      title: 'Safe to Tow',
    },
    [TowingSafetyLevel.CAUTION]: {
      borderColor: 'border-caution-yellow',
      textColor: 'text-caution-yellow',
      Icon: CautionIcon,
      title: 'Caution Advised',
    },
    [TowingSafetyLevel.DOLLY_REQUIRED]: {
      borderColor: 'border-danger-red',
      textColor: 'text-danger-red',
      Icon: DollyIcon,
      title: 'Dolly Required',
    },
  };

  const meta = safetyMeta[towingSafetyLevel] || safetyMeta[TowingSafetyLevel.DOLLY_REQUIRED];

  return (
    <div className={`bg-white dark:bg-gray-800 border-t-4 ${meta.borderColor} rounded-lg shadow-lg animate-fade-in`}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{`${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              {vehicle.trim} - 
              <span className="font-semibold text-gray-700 dark:text-gray-300 inline-flex items-center gap-2 ml-2">
                {drivetrain}
                <button onClick={onOpenDrivetrainInfo} aria-label="Learn more about drivetrain types" className="flex items-center justify-center">
                  <InfoIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-brand-yellow transition-colors" />
                </button>
              </span>
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900/50 border ${meta.borderColor}/30 dark:${meta.borderColor}/50 ${meta.textColor} font-bold text-md`}>
            <meta.Icon className="w-5 h-5" />
            <span>{meta.title}</span>
          </div>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg my-6">
          <p className="text-center text-lg text-gray-800 dark:text-gray-200">{summary}</p>
        </div>

        <div className="space-y-4">
            <section>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Primary Towing Procedures</h3>
                <div className="space-y-4">
                    <TowingMethodCard title="Front Tow (Rear Wheels on Ground)" method={frontTowing} />
                    <TowingMethodCard title="Rear Tow (Front Wheels on Ground)" method={rearTowing} />
                </div>
            </section>

             <section>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Drivetrain Analysis</h3>
                <DrivetrainDetails details={primaryDetails} isMember={isMember} onUpgradeClick={onUpgradeClick} />
            </section>

            {cautions && cautions.length > 0 && (
              <Accordion 
                title={
                  <span className="flex items-center gap-2 text-caution-yellow font-bold text-lg">
                    <InfoIcon className="w-6 h-6" />
                    General Cautions
                  </span>
                }
              >
                <ul className="list-disc list-inside space-y-2 pl-2 text-gray-700 dark:text-gray-300">
                  {cautions.map((caution, index) => (
                    <li key={index}>{caution}</li>
                  ))}
                </ul>
              </Accordion>
            )}
            
            {anecdotalAdvice && anecdotalAdvice.length > 0 && (
              <>
                {isMember ? (
                  <Accordion 
                    title={
                      <span className="flex items-center gap-2 text-brand-yellow font-bold text-lg">
                        <SparkleIcon className="w-6 h-6" />
                        What the Guys Say
                      </span>
                    }
                  >
                    <ul className="list-disc list-inside space-y-2 pl-2 text-gray-700 dark:text-gray-300 italic">
                      {anecdotalAdvice.map((advice, index) => (
                        <li key={`advice-${index}`}>{advice}</li>
                      ))}
                    </ul>
                  </Accordion>
                ) : (
                  <AnecdotalAdviceCTA onUpgradeClick={onUpgradeClick} />
                )}
              </>
            )}

            {awdVariantInfo && (
              <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300 dark:border-gray-700">
                <Accordion
                  title={
                    <span className="flex items-center gap-2 text-brand-yellow font-bold text-lg">
                      <InfoIcon className="w-6 h-6" />
                      AWD / 4WD Variant Information
                    </span>
                  }
                  startOpen={true}
                >
                  <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg mb-4">
                    <p className="text-center text-gray-800 dark:text-gray-200">{awdVariantInfo.summary}</p>
                  </div>

                  <div className="space-y-4 my-6">
                    <h4 className="text-xl font-bold text-gray-700 dark:text-gray-300">AWD Towing Procedures</h4>
                    <TowingMethodCard title="Front Tow (Rear Wheels on Ground)" method={awdVariantInfo.frontTowing} />
                    <TowingMethodCard title="Rear Tow (Front Wheels on Ground)" method={awdVariantInfo.rearTowing} />
                  </div>

                  <div className="space-y-4 my-6">
                      <h4 className="text-xl font-bold text-gray-700 dark:text-gray-300">AWD Drivetrain Analysis</h4>
                      <DrivetrainDetails details={awdVariantInfo} isMember={isMember} onUpgradeClick={onUpgradeClick} />
                  </div>

                  {awdVariantInfo.cautions && awdVariantInfo.cautions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xl font-semibold text-caution-yellow mb-2">
                        Specific Cautions for AWD Variant
                      </h4>
                      <ul className="list-disc list-inside space-y-2 pl-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/30 p-4 rounded-md">
                        {awdVariantInfo.cautions.map((caution, index) => (
                          <li key={`awd-caution-${index}`}>{caution}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Accordion>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;