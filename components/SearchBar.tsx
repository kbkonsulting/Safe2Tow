import React, { useState, useRef, ChangeEvent } from 'react';
import { CameraIcon } from './icons';
import { VehicleIdentificationResult } from '../types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onImageSearch: (file: File) => Promise<VehicleIdentificationResult | null>;
  onVinSearch: (file: File) => Promise<string | null>;
  isLoading: boolean;
  isPro: boolean;
  onUpgradeClick: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onImageSearch, onVinSearch, isLoading, isPro, onUpgradeClick }) => {
  const [query, setQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading && !isUploading) {
      onSearch(query.trim());
    }
  };

  const handleImageUploadClick = () => {
    if (!isPro) {
      onUpgradeClick();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setQuery('Scanning for VIN...');

    try {
      const vin = await onVinSearch(file);
      if (vin && vin.length === 17) {
        const newQuery = `VIN ${vin}`;
        setQuery(newQuery);
        onSearch(newQuery);
      } else {
        setQuery('Identifying vehicle from image...');
        const vehicle = await onImageSearch(file);
        if (vehicle && vehicle.year && vehicle.make && vehicle.model) {
          const newQuery = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
          setQuery(newQuery);
          onSearch(newQuery);
        } else {
          const errorMessage = vehicle?.error || "Could not identify the vehicle. Please try another photo or enter details manually.";
          alert(errorMessage);
          setQuery('');
        }
      }
    } catch (error) {
        console.error("Image processing failed:", error);
        alert(error instanceof Error ? error.message : "An unknown error occurred during image processing.");
        setQuery('');
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <input
            type="text"
            placeholder="Enter Year, Make, Model, or VIN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-900 dark:text-gray-200"
        />
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        <button
          type="button"
          onClick={handleImageUploadClick}
          disabled={isUploading || isLoading}
          className="p-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors disabled:opacity-50"
          aria-label="Search with image"
        >
          <CameraIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          type="submit"
          disabled={isLoading || isUploading || !query.trim()}
          className="w-full md:w-auto px-8 py-3 bg-brand-yellow text-gray-900 font-bold rounded-md hover:bg-amber-400 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {(isLoading || isUploading) && (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isLoading || isUploading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;