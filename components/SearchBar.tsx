import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getVehicleOptions, getCorrectedMake, identifyVehicleFromImage, extractVinFromImage } from '../services/geminiService';
import { DetailsSearchParams, VinSearchParams, SearchMode } from '../App';
import { CameraIcon } from './icons';
import MembershipCTA from './MembershipCTA';

interface VehicleSearchFormProps {
  onSubmit: (params: DetailsSearchParams | VinSearchParams, mode: SearchMode) => void;
  isLoading: boolean;
  onClear: () => void;
  isMember: boolean;
  onUpgradeClick: () => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

const commonMakes = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "GMC", 
  "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", 
  "Mazda", "Mercedes-Benz", "Mitsubishi", "Nissan", "Porsche", "Ram", "Subaru", "Tesla", 
  "Toyota", "Volkswagen", "Volvo"
];

// Sub-component for Details Search
const DetailsForm: React.FC<Omit<VehicleSearchFormProps, 'onSubmit'> & { 
  onSubmit: (params: DetailsSearchParams) => void;
}> = ({ isLoading, onClear, isMember, onUpgradeClick, onSubmit }) => {
    const [year, setYear] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [trim, setTrim] = useState('');
    const [models, setModels] = useState<string[]>([]);
    const [trims, setTrims] = useState<string[]>([]);
    const [isModelsLoading, setIsModelsLoading] = useState(false);
    const [isTrimsLoading, setIsTrimsLoading] = useState(false);
    const [isCorrectingMake, setIsCorrectingMake] = useState(false);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchModels = useCallback(async () => {
        if (make.length >= 3) {
            setIsModelsLoading(true);
            setModels([]); setTrims([]); setTrim('');
            const results = await getVehicleOptions(`models for ${year} ${make}`);
            setModels(results);
            setIsModelsLoading(false);
        } else {
            setModels([]); setModel('');
        }
    }, [year, make]);

    const fetchTrims = useCallback(async () => {
        if (make && model.length >= 2) {
            setIsTrimsLoading(true);
            setTrims([]); setTrim('');
            const results = await getVehicleOptions(`trims for ${year} ${make} ${model}`);
            setTrims(results);
            setIsTrimsLoading(false);
        } else {
            setTrims([]); setTrim('');
        }
    }, [year, make, model]);

    useEffect(() => {
        const handler = setTimeout(() => { fetchModels(); }, 500);
        return () => clearTimeout(handler);
    }, [fetchModels]);

    useEffect(() => {
        const handler = setTimeout(() => { fetchTrims(); }, 500);
        return () => clearTimeout(handler);
    }, [fetchTrims]);

    const handleMakeBlur = useCallback(async () => {
        const trimmedMake = make.trim();
        if (trimmedMake.toLowerCase() === 'vw') { setMake('Volkswagen'); return; }
        if (trimmedMake.length < 2) return;
        setIsCorrectingMake(true);
        const correctedMake = await getCorrectedMake(trimmedMake);
        setMake(correctedMake);
        setIsCorrectingMake(false);
    }, [make]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ year, make, model, trim });
    };

    const handleClear = () => {
        setYear(''); setMake(''); setModel(''); setTrim('');
        setModels([]); setTrims([]);
        onClear();
    };
    
    const handleIdentifyClick = () => {
      if (isMember) {
        setShowPhotoOptions(true);
      } else {
        onUpgradeClick();
      }
    };
    
    const handleTakePhoto = () => {
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
      }
    };

    const handleChooseFromGallery = () => {
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
      }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setShowPhotoOptions(false);
      if (!file) return;

      if (!isMember) return;

      setIsIdentifying(true);
      try {
        const base64Image = await fileToBase64(file);
        const result = await identifyVehicleFromImage(base64Image);
        setYear(result.year);
        setMake(result.make);
        setModel(result.model);
      } catch (error) {
        console.error("Vehicle ID failed:", error);
        alert("Failed to identify vehicle from image.");
      } finally {
        setIsIdentifying(false);
        if(event.target) event.target.value = "";
      }
    };

    return (
      <>
        {showPhotoOptions && (
          <div className="fixed inset-0 bg-black/70 z-30 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">Identify Vehicle from Image</h3>
                  <div className="space-y-3">
                      <button type="button" onClick={handleTakePhoto} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-all">
                          Take Photo
                      </button>
                      <button type="button" onClick={handleChooseFromGallery} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-all">
                          Choose from Gallery
                      </button>
                      <button type="button" onClick={() => setShowPhotoOptions(false)} className="w-full mt-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6 -mt-2">Search by vehicle details, or use your camera to identify a vehicle{!isMember && ' (Pro feature)'}.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="flex flex-col">
                    <label htmlFor="make" className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Make</label>
                    <div className="relative">
                        <input id="make" type="text" list="makes" value={make} onChange={(e) => setMake(e.target.value)} onBlur={handleMakeBlur} placeholder="e.g., Ford" className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow pr-10" disabled={isLoading || isCorrectingMake || isIdentifying} />
                        <button type="button" onClick={handleIdentifyClick} disabled={isLoading || isIdentifying} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-brand-yellow transition-colors group" aria-label="Identify with photo">
                            <CameraIcon className="w-5 h-5" />
                            {!isMember && <span className="absolute -top-1 -right-1.5 block h-2.5 w-2.5 rounded-full bg-brand-yellow ring-2 ring-white dark:ring-gray-800" />}
                        </button>
                    </div>
                    <datalist id="makes">{commonMakes.map(m => <option key={m} value={m} />)}</datalist>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="model" className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Model</label>
                    <input id="model" type="text" list="models-list" value={model} onChange={(e) => setModel(e.target.value)} placeholder={isModelsLoading ? 'Loading...' : 'e.g., F-150'} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow disabled:opacity-50" disabled={isLoading || !make || make.length < 3 || isIdentifying} />
                    <datalist id="models-list">{models.map(m => <option key={m} value={m} />)}</datalist>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="trim" className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Trim (Optional)</label>
                    <select id="trim" value={trim} onChange={(e) => setTrim(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow disabled:opacity-50" disabled={isLoading || isTrimsLoading || trims.length === 0 || model.length < 2 || isIdentifying}>
                        <option value="">{isTrimsLoading ? 'Loading...' : 'Select Trim'}</option>
                        {trims.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="year" className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Year (Optional)</label>
                    <input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g., 2021" min="1980" max={new Date().getFullYear() + 1} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow" disabled={isLoading || isIdentifying} />
                </div>

                <div className="md:col-span-2 mt-4">
                  <div className="flex flex-col-reverse sm:flex-row gap-4">
                      <button type="button" onClick={handleClear} disabled={isLoading || isIdentifying} className="w-full sm:w-auto px-6 py-2.5 font-semibold text-gray-700 dark:text-gray-300 bg-transparent rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-center">Clear</button>
                      <button type="submit" disabled={isLoading || !model || !make || isIdentifying} className="w-full flex-grow px-6 py-2.5 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all">
                        {isIdentifying ? 'Identifying...' : 'Get Towing Info'}
                      </button>
                  </div>
                </div>
            </div>
        </form>
      </>
    );
};

// Sub-component for VIN Search
const VinForm: React.FC<Omit<VehicleSearchFormProps, 'onSubmit'> & {
  onSubmit: (params: VinSearchParams) => void;
}> = ({ isLoading, onClear, isMember, onUpgradeClick, onSubmit }) => {
    const [vin, setVin] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [showScanOptions, setShowScanOptions] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ vin });
    };

    const handleClear = () => {
        setVin('');
        onClear();
    };

    const handleScanClick = () => {
        if (isMember) {
            setShowScanOptions(true);
        } else {
            onUpgradeClick();
        }
    };

    const handleTakePhoto = () => {
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
      }
    };

    const handleChooseFromGallery = () => {
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
      }
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setShowScanOptions(false);
      if (!file) return;

      if (!isMember) return;

      setIsScanning(true);
      try {
        const base64Image = await fileToBase64(file);
        const extractedVin = await extractVinFromImage(base64Image);
        if (extractedVin && extractedVin.length === 17) {
            setVin(extractedVin);
        } else {
            alert("Could not find a valid VIN in the image.");
        }
      } catch (error) {
        console.error("VIN scan failed:", error);
        alert("Failed to read VIN from image.");
      } finally {
        setIsScanning(false);
        if(event.target) event.target.value = "";
      }
    };
    
    const vinInputClass = `flex-grow px-3 py-2 bg-gray-100 dark:bg-gray-700 border rounded-md focus:outline-none focus:ring-2 uppercase tracking-widest transition-colors ${
      vin.length > 0 && vin.length < 17 
        ? 'border-danger-red focus:ring-danger-red' 
        : vin.length === 17 
        ? 'border-safe-green focus:ring-safe-green' 
        : 'border-gray-300 dark:border-gray-600 focus:ring-brand-yellow'
    }`;


    if (!isMember) {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
                 <MembershipCTA onUpgradeClick={onUpgradeClick} featureName="VIN Search & Scan" />
            </div>
        )
    }

    return (
        <div>
            {showScanOptions && (
                 <div className="fixed inset-0 bg-black/70 z-30 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">Select VIN Image Source</h3>
                        <div className="space-y-3">
                            <button type="button" onClick={handleTakePhoto} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-all">
                                Take Photo
                            </button>
                            <button type="button" onClick={handleChooseFromGallery} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-all">
                                Choose from Gallery
                            </button>
                            <button type="button" onClick={() => setShowScanOptions(false)} className="w-full mt-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                 <p className="text-center text-gray-500 dark:text-gray-400 mb-6 -mt-2">Enter a VIN manually or scan it with your camera.</p>
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="vin" className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle Identification Number (VIN)</label>
                        <div className="flex gap-2">
                            <input id="vin" type="text" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} placeholder="Enter 17-character VIN" maxLength={17} className={vinInputClass} disabled={isLoading || isScanning} />
                            <button type="button" onClick={handleScanClick} disabled={isLoading || isScanning} className="px-3 py-2 font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                                <CameraIcon className="w-5 h-5" />
                                <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-4">
                        <button type="button" onClick={handleClear} disabled={isLoading || isScanning} className="w-full sm:w-auto px-6 py-2.5 font-semibold text-gray-700 dark:text-gray-300 bg-transparent rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-center">Clear</button>
                        <button type="submit" disabled={isLoading || isScanning || vin.length !== 17} className="w-full flex-grow px-6 py-2.5 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed">
                           Get Towing Info
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

// Main Component with Tabs
const VehicleSearchForm: React.FC<VehicleSearchFormProps> = (props) => {
    const [activeTab, setActiveTab] = useState<SearchMode>('details');
    
    const { onSubmit, ...restProps } = props;

    const handleDetailsSubmit = (params: DetailsSearchParams) => {
        onSubmit(params, 'details');
    };
    
    const handleVinSubmit = (params: VinSearchParams) => {
        onSubmit(params, 'vin');
    };

    const tabClasses = (tabName: SearchMode) => 
        `px-6 py-3 font-semibold transition-colors focus:outline-none relative border-b-2 ${
        activeTab === tabName 
            ? 'text-brand-yellow border-brand-yellow' 
            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
        }`;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button className={tabClasses('details')} onClick={() => setActiveTab('details')}>
                    Search by Details
                </button>
                <button className={tabClasses('vin')} onClick={() => setActiveTab('vin')}>
                    Search by VIN
                    {!props.isMember && (
                      <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-brand-yellow ring-2 ring-white dark:ring-gray-800" title="Pro Feature"/>
                    )}
                </button>
            </div>
            {activeTab === 'details' ? (
                <DetailsForm {...restProps} onSubmit={handleDetailsSubmit} />
            ) : (
                <VinForm {...restProps} onSubmit={handleVinSubmit} />
            )}
        </div>
    );
};

export default VehicleSearchForm;
