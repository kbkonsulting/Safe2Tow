import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { CameraIcon } from './icons';
import { getVehicleOptions } from '../services/geminiService';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: (query: string) => void;
  onCameraClick: () => void;
  isLoading: boolean;
  isPro: boolean;
  onUpgradeClick: () => void;
  hasResult: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  query, 
  setQuery, 
  onSearch, 
  onCameraClick,
  isLoading, 
  isPro, 
  onUpgradeClick,
  hasResult,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // If a result is being displayed, ensure suggestions are hidden.
    if (hasResult) {
      setSuggestions([]);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Only fetch suggestions if the user is typing a new query that hasn't been actively searched yet.
    if (query.trim().length > 2 && !isLoading && query.trim() !== activeSearchQuery.trim()) {
      setIsFetchingSuggestions(true);
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          const fetchedSuggestions = await getVehicleOptions(query);
          setSuggestions(fetchedSuggestions);
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
          setSuggestions([]);
        } finally {
          setIsFetchingSuggestions(false);
        }
      }, 500); // FIX: Reduced delay from 3000ms to a more responsive 500ms
    } else {
      // Clear suggestions if the query is too short, loading, or matches the active search.
      setSuggestions([]);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, isLoading, activeSearchQuery, hasResult]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Clear any pending suggestion fetch timers to prevent race conditions.
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    const trimmedQuery = query.trim();
    if (trimmedQuery && !isLoading) {
      setSuggestions([]); // Immediately hide dropdown
      setActiveSearchQuery(trimmedQuery); // Lock this query from showing suggestions
      onSearch(trimmedQuery);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]); // Immediately hide dropdown
    setActiveSearchQuery(suggestion); // Lock this query from showing suggestions
    onSearch(suggestion);
  };

  const handleImageUploadClick = () => {
    if (!isPro) {
      onUpgradeClick();
    } else {
      onCameraClick();
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="relative w-full">
          <input
              type="text"
              placeholder="Enter Year, Make, Model, or VIN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-900 dark:text-gray-200"
              autoComplete="off"
              disabled={isLoading}
          />
          {(suggestions.length > 0 || isFetchingSuggestions) && (
            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {isFetchingSuggestions && suggestions.length === 0 ? (
                <li className="px-4 py-2 text-gray-500 dark:text-gray-400 italic">Fetching suggestions...</li>
              ) : (
                suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onMouseDown={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                  >
                    {suggestion}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={handleImageUploadClick}
          disabled={isLoading}
          className="p-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors disabled:opacity-50"
          aria-label="Search with image"
        >
          <CameraIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="w-full md:w-auto px-8 py-3 bg-brand-yellow text-gray-900 font-bold rounded-md hover:bg-amber-400 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;