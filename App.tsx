import React, { useState, useCallback } from 'react';
import { getTowingInfo } from './services/geminiService';
import { TowingInfo } from './types';
import VehicleSearchForm from './components/SearchBar';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import { TowTruckIcon } from './components/icons';

export interface SearchParams {
  year: string;
  make: string;
  model: string;
  trim: string;
}

const App: React.FC = () => {
  const [towingInfo, setTowingInfo] = useState<TowingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (params: SearchParams) => {
    if (!params.make || !params.model) {
      setError("Please select a make and model to search.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setTowingInfo(null);
    
    const query = `${params.year || ''} ${params.make} ${params.model} ${params.trim || ''}`.trim();

    try {
      const result = await getTowingInfo(query);
      setTowingInfo(result);
    } catch (e) {
      setError('Failed to fetch towing information. The AI model may be overloaded or the vehicle is not recognized. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleClear = useCallback(() => {
    setTowingInfo(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <TowTruckIcon className="w-12 h-12 text-brand-yellow" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">TowSafe AWD Checker</h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Select a vehicle's make and model to get professional towing guidance.
          </p>
        </header>

        <main>
          <VehicleSearchForm
            onSubmit={handleSearch}
            isLoading={isLoading}
            onClear={handleClear}
          />

          <div className="mt-8 min-h-[400px]">
            {isLoading && <Loader />}
            {error && <div className="text-center p-6 bg-red-900/50 border border-danger-red rounded-lg text-red-300">{error}</div>}
            {towingInfo && <ResultCard towingInfo={towingInfo} />}
            {!isLoading && !error && !towingInfo && (
              <div className="text-center p-10 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg">
                <p className="text-gray-400">Towing instructions will appear here once you search for a vehicle.</p>
              </div>
            )}
          </div>
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Disclaimer: This tool uses AI and should be used as a supplementary guide. Always follow your company's official procedures and safety protocols.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;