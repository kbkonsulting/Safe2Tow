import React, { useState, useEffect, useCallback } from 'react';
import { getVehicleOptions, getCorrectedMake } from '../services/geminiService';
import { SearchParams } from '../App';

interface VehicleSearchFormProps {
  onSubmit: (params: SearchParams) => void;
  isLoading: boolean;
  onClear: () => void;
}

const commonMakes = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "GMC", 
  "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", 
  "Mazda", "Mercedes-Benz", "Mitsubishi", "Nissan", "Porsche", "Ram", "Subaru", "Tesla", 
  "Toyota", "Volkswagen", "Volvo"
];

const VehicleSearchForm: React.FC<VehicleSearchFormProps> = ({ onSubmit, isLoading, onClear }) => {
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');

  const [models, setModels] = useState<string[]>([]);
  const [trims, setTrims] = useState<string[]>([]);

  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [isTrimsLoading, setIsTrimsLoading] = useState(false);
  const [isCorrectingMake, setIsCorrectingMake] = useState(false);

  const fetchModels = useCallback(async () => {
    if (make.length >= 3) {
      setIsModelsLoading(true);
      setModels([]);
      setTrims([]);
      setTrim('');
      const query = `models for ${year} ${make}`;
      const results = await getVehicleOptions(query);
      setModels(results);
      setIsModelsLoading(false);
    } else {
      setModels([]);
      setModel('');
    }
  }, [year, make]);

  const fetchTrims = useCallback(async () => {
    if (make && model.length >= 3) {
      setIsTrimsLoading(true);
      setTrims([]);
      setTrim('');
      const query = `trims for ${year} ${make} ${model}`;
      const results = await getVehicleOptions(query);
      setTrims(results);
      setIsTrimsLoading(false);
    } else {
        setTrims([]);
        setTrim('');
    }
  }, [year, make, model]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchModels();
    }, 500); // Debounce to avoid rapid API calls
    return () => clearTimeout(handler);
  }, [fetchModels]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTrims();
    }, 500); // Debounce to avoid rapid API calls for trims
    return () => clearTimeout(handler);
  }, [fetchTrims]);
  
  const handleMakeBlur = useCallback(async () => {
    const trimmedMake = make.trim();
    if (trimmedMake.toLowerCase() === 'vw') {
        setMake('Volkswagen');
        return;
    }
    
    if (trimmedMake.length < 2) return;
    setIsCorrectingMake(true);
    try {
        const correctedMake = await getCorrectedMake(trimmedMake);
        setMake(correctedMake);
    } catch (error) {
        console.error("Failed to correct make:", error);
    } finally {
        setIsCorrectingMake(false);
    }
  }, [make]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ year, make, model, trim });
  };

  const handleClear = () => {
    setYear('');
    setMake('');
    setModel('');
    setTrim('');
    setModels([]);
    setTrims([]);
    onClear();
  };
  
  const currentYear = new Date().getFullYear();
  
  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        {/* Make Input */}
        <div className="flex flex-col md:col-span-2 relative">
            <label htmlFor="make" className="mb-1 text-sm font-medium text-gray-400">Make</label>
            <input
                id="make"
                type="text"
                list={make.length >= 3 ? "makes" : undefined}
                value={make}
                onChange={(e) => setMake(e.target.value)}
                onBlur={handleMakeBlur}
                placeholder="e.g., Subaru"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all"
                disabled={isLoading || isCorrectingMake}
            />
             {isCorrectingMake && (
                <div className="absolute right-3 top-9">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            <datalist id="makes">
                {commonMakes.map(m => <option key={m} value={m} />)}
            </datalist>
        </div>

        {/* Model Input */}
        <div className="flex flex-col md:col-span-2 relative">
            <label htmlFor="model" className="mb-1 text-sm font-medium text-gray-400">Model</label>
            <input
                id="model"
                type="text"
                list="models-list"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={isModelsLoading ? 'Loading models...' : 'e.g., Outback'}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all disabled:opacity-50"
                disabled={isLoading || !make || make.length < 3}
            />
            {isModelsLoading && (
                <div className="absolute right-3 top-9">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            <datalist id="models-list">
                {models.map(m => <option key={m} value={m} />)}
            </datalist>
        </div>
        
        {/* Trim Select */}
        <div className="flex flex-col md:col-span-2 relative">
             <label htmlFor="trim" className="mb-1 text-sm font-medium text-gray-400">Trim (Optional)</label>
             <select
                id="trim"
                value={trim}
                onChange={(e) => setTrim(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all disabled:opacity-50"
                disabled={isLoading || isTrimsLoading || trims.length === 0 || model.length < 3}
             >
                 <option value="">{isTrimsLoading ? 'Loading...' : 'Select Trim'}</option>
                 {trims.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
             {isTrimsLoading && (
                <div className="absolute right-3 top-9">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
        </div>

        {/* Year Input */}
        <div className="flex flex-col md:col-span-2">
            <label htmlFor="year" className="mb-1 text-sm font-medium text-gray-400">Year (Optional)</label>
            <input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2021"
                min="1980"
                max={currentYear + 1}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all"
                disabled={isLoading}
            />
        </div>

        {/* Buttons Container */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 md:col-span-4 mt-2">
             <button
                type="submit"
                disabled={isLoading || !model || !make}
                className="w-full flex-grow px-6 py-2.5 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-yellow disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                    </>
                ) : (
                'Get Towing Intel'
                )}
            </button>
            <button
                type="button"
                onClick={handleClear}
                disabled={isLoading || (!year && !make && !model && !trim)}
                className="w-full sm:w-auto px-6 py-2.5 font-semibold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
            >
                Clear
            </button>
        </div>
      </div>
    </form>
  );
};

export default VehicleSearchForm;