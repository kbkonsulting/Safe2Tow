import React from 'react';
import { TowingInfo, TowingSafetyLevel, TowingMethodSafetyLevel, TowingMethod, AWDVariantInfo } from '../types';
import { SafeIcon, CautionIcon, DollyIcon, InfoIcon } from './icons';

interface ResultCardProps {
  towingInfo: TowingInfo;
}

const TowingMethodCard: React.FC<{ title: string; method: TowingMethod }> = ({ title, method }) => {
  if (method.safetyLevel === TowingMethodSafetyLevel.UNSAFE) {
    return (
      <div className="p-4 bg-red-900/30 border border-danger-red rounded-lg">
        <h4 className="font-bold text-lg mb-2 text-white">{title}</h4>
        <div className="flex items-center gap-2 mb-2 font-semibold text-danger-red">
          <DollyIcon className="w-5 h-5" />
          <span>Dolly / Flatbed Required</span>
        </div>
        <p className="text-gray-300 whitespace-pre-wrap">{method.instructions}</p>
      </div>
    );
  }

  if (method.safetyLevel === TowingMethodSafetyLevel.SAFE_WITH_CAUTION) {
     return (
      <div className="p-4 bg-yellow-900/30 border border-caution-yellow rounded-lg">
        <h4 className="font-bold text-lg mb-2 text-white">{title}</h4>
        <div className="flex items-center gap-2 mb-2 font-semibold text-caution-yellow">
          <CautionIcon className="w-5 h-5" />
          <span>Safe with Caution</span>
        </div>
        <p className="text-gray-300 whitespace-pre-wrap">{method.instructions}</p>
      </div>
    );
  }

  // SAFE
  return (
    <div className="p-4 bg-green-900/30 border border-safe-green rounded-lg">
      <h4 className="font-bold text-lg mb-2 text-white">{title}</h4>
      <div className="flex items-center gap-2 mb-2 font-semibold text-safe-green">
        <SafeIcon className="w-5 h-5" />
        <span>Safe (2 Wheels Down)</span>
      </div>
      <p className="text-gray-300 whitespace-pre-wrap">{method.instructions}</p>
    </div>
  );
};

const DrivetrainDetails: React.FC<{ details: Pick<TowingInfo, 'awdSystemType' | 'isAwdMechanicallyEngagedWhenOff' | 'steeringLocksWhenOff'> }> = ({ details }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-gray-900/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-400">AWD System Type</h4>
            <p className="text-lg text-white font-medium">{details.awdSystemType || 'N/A'}</p>
        </div>
        <div className="p-3 bg-gray-900/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-400">AWD Engaged When Off?</h4>
            <p className={`text-lg font-medium ${details.isAwdMechanicallyEngagedWhenOff ? 'text-danger-red' : 'text-safe-green'}`}>
                {details.isAwdMechanicallyEngagedWhenOff ? 'Yes' : 'No'}
            </p>
        </div>
        <div className="p-3 bg-gray-900/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-400">Steering Locks When Off?</h4>
            <p className={`text-lg font-medium ${details.steeringLocksWhenOff ? 'text-danger-red' : 'text-safe-green'}`}>
                {details.steeringLocksWhenOff ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-500 italic mt-1">(Varies by trim/region)</p>
        </div>
    </div>
);


const ResultCard: React.FC<ResultCardProps> = ({ towingInfo }) => {
  // Guard against malformed AI responses to prevent app crashes.
  if (!towingInfo || !towingInfo.vehicle) {
    return (
      <div className="text-center p-6 bg-red-900/50 border border-danger-red rounded-lg text-red-300 animate-fade-in">
        The AI returned an incomplete response. Please try your search again or rephrase it.
      </div>
    );
  }
  
  const { vehicle, drivetrain, towingSafetyLevel, summary, frontTowing, rearTowing, cautions, awdVariantInfo, ...primaryDetails } = towingInfo;

  const safetyMeta = {
    [TowingSafetyLevel.SAFE]: {
      bgColor: 'bg-green-900/40',
      borderColor: 'border-safe-green',
      textColor: 'text-safe-green',
      Icon: SafeIcon,
      title: 'Safe to Tow (2 Wheels Down)',
    },
    [TowingSafetyLevel.CAUTION]: {
      bgColor: 'bg-yellow-900/40',
      borderColor: 'border-caution-yellow',
      textColor: 'text-caution-yellow',
      Icon: CautionIcon,
      title: 'Caution Advised',
    },
    [TowingSafetyLevel.DOLLY_REQUIRED]: {
      bgColor: 'bg-red-900/40',
      borderColor: 'border-danger-red',
      textColor: 'text-danger-red',
      Icon: DollyIcon,
      title: 'Dolly / Flatbed Required',
    },
  };

  const meta = safetyMeta[towingSafetyLevel] || safetyMeta[TowingSafetyLevel.DOLLY_REQUIRED];

  const methods = [
    { name: 'Front Tow (Rear Wheels on Ground)', ...frontTowing },
    { name: 'Rear Tow (Front Wheels on Ground)', ...rearTowing },
  ];

  const safeMethods = methods.filter(m => m.safetyLevel === TowingMethodSafetyLevel.SAFE || m.safetyLevel === TowingMethodSafetyLevel.SAFE_WITH_CAUTION);
  const unsafeMethods = methods.filter(m => m.safetyLevel === TowingMethodSafetyLevel.UNSAFE);

  return (
    <div className={`border-2 ${meta.borderColor} ${meta.bgColor} rounded-xl shadow-lg animate-fade-in`}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{`${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h2>
            <p className="text-gray-400 font-medium">{vehicle.trim} - <span className="font-semibold text-gray-300">{drivetrain} (Primary Result)</span></p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${meta.bgColor} border ${meta.borderColor} ${meta.textColor} font-bold text-lg`}>
            <meta.Icon className="w-6 h-6" />
            <span>{meta.title}</span>
          </div>
        </div>

        <div className="p-4 bg-gray-800/70 rounded-lg mb-6">
          <p className="text-center text-lg text-gray-200">{summary}</p>
        </div>

        <div className="border-t border-b border-gray-700 py-4 my-6">
            <h3 className="text-lg font-bold text-gray-300 mb-3 text-center">Drivetrain Details (Primary)</h3>
            <DrivetrainDetails details={primaryDetails} />
        </div>


        <div className="space-y-6">
          {safeMethods.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-safe-green mb-3 flex items-center gap-2">
                <SafeIcon className="w-6 h-6" />
                Recommended Method(s)
              </h3>
              <div className="space-y-4">
                {safeMethods.map((method) => (
                  <TowingMethodCard key={method.name} title={method.name} method={method} />
                ))}
              </div>
            </div>
          )}

          {unsafeMethods.length > 0 && (
            <div>
              <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 text-danger-red`}>
                <DollyIcon className="w-6 h-6" />
                <span>Unsafe Method(s)</span>
              </h3>
              <div className="space-y-4">
                {unsafeMethods.map((method) => (
                  <TowingMethodCard key={method.name} title={method.name} method={method} />
                ))}
              </div>
            </div>
          )}
        </div>

        {cautions && cautions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold text-caution-yellow mb-2 flex items-center gap-2">
              <InfoIcon className="w-6 h-6" />
              General Cautions
            </h3>
            <ul className="list-disc list-inside space-y-2 pl-2 text-gray-300">
              {cautions.map((caution, index) => (
                <li key={index}>{caution}</li>
              ))}
            </ul>
          </div>
        )}

        {awdVariantInfo && (
          <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-600">
            <h3 className="text-xl font-bold text-brand-yellow mb-3 flex items-center gap-2">
              <InfoIcon className="w-6 h-6" />
              AWD / 4WD Variant Towing Information
            </h3>
            <div className="p-4 bg-gray-800/70 rounded-lg mb-4">
              <p className="text-center text-gray-200">{awdVariantInfo.summary}</p>
            </div>
             <div className="border-b border-gray-700 pb-4 mb-4">
                <h4 className="text-md font-bold text-gray-300 mb-3 text-center">Drivetrain Details (AWD Variant)</h4>
                <DrivetrainDetails details={awdVariantInfo} />
            </div>
            <div className="space-y-4">
              <TowingMethodCard title="Front Tow (Rear Wheels on Ground)" method={awdVariantInfo.frontTowing} />
              <TowingMethodCard title="Rear Tow (Front Wheels on Ground)" method={awdVariantInfo.rearTowing} />
            </div>
            {awdVariantInfo.cautions && awdVariantInfo.cautions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-caution-yellow mb-2">
                  Specific Cautions for AWD Variant:
                </h4>
                <ul className="list-disc list-inside space-y-2 pl-2 text-gray-300">
                  {awdVariantInfo.cautions.map((caution, index) => (
                    <li key={`awd-caution-${index}`}>{caution}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;