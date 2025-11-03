import React, { useState, useEffect } from 'react';
import { getTowingInfo } from './services/geminiService';
import { TowingInfo } from './types';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import { AppIcon } from './components/icons';
import DrivetrainInfoModal from './components/DrivetrainInfoModal';
import FeedbackModal from './components/FeedbackModal';
import PaymentModal from './components/PaymentModal';
import MembershipToggle from './components/MembershipToggle';
import ThemeToggle from './components/ThemeToggle';
import AdBanner from './components/AdBanner';
import { 
  getCurrentUserEmail, 
  setCurrentUserEmail,
  getUserStatus,
  upgradeUserToPro,
  logSearch,
  setProStatus
} from './services/databaseService';


export type SearchMode = 'details' | 'vin';
export type DetailsSearchParams = { year: string; make: string; model: string; trim: string; };
export type VinSearchParams = { vin: string };
export type Theme = 'light' | 'dark';

function App() {
  const [towingInfo, setTowingInfo] = useState<TowingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDrivetrainModalOpen, setIsDrivetrainModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [currentUserEmail, setCurrentUserEmailState] = useState<string | null>(getCurrentUserEmail());
  const [isProMember, setIsProMember] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Effect to check user's pro status from Firestore on load or when user changes
  useEffect(() => {
    const checkStatus = async () => {
      if (currentUserEmail) {
        const isPro = await getUserStatus(currentUserEmail);
        setIsProMember(isPro);
      } else {
        setIsProMember(false);
      }
    };
    checkStatus();
  }, [currentUserEmail]);


  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSearch = async (params: DetailsSearchParams | VinSearchParams, mode: SearchMode) => {
    setIsLoading(true);
    setError(null);
    setTowingInfo(null);
    let fullResult: TowingInfo | null = null;
    let errorMessage: string | null = null;

    let query = '';
    if (mode === 'details') {
      const p = params as DetailsSearchParams;
      query = `${p.year} ${p.make} ${p.model} ${p.trim}`.trim();
    } else {
      const p = params as VinSearchParams;
      query = `VIN ${p.vin}`;
    }
    setSearchQuery(query);

    try {
      const result = await getTowingInfo(query);
      setTowingInfo(result);
      fullResult = result;
    } catch (err) {
      errorMessage = (err as Error).message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      // Log the search to Firestore
      await logSearch({
        userEmail: currentUserEmail,
        searchParams: params,
        wasSuccessful: !errorMessage,
        errorMessage,
        fullResult
      });
    }
  };

  const handleClear = () => {
    setTowingInfo(null);
    setError(null);
    setSearchQuery('');
  };

  const handlePurchaseComplete = async (details: { name: string; email: string; stripeCustomerId: string; }) => {
    await upgradeUserToPro(details);
    setCurrentUserEmail(details.email);
    setCurrentUserEmailState(details.email);
    setIsPaymentModalOpen(false);
  };

  const handleMembershipToggle = async (isPro: boolean) => {
    if (!currentUserEmail) {
        alert("A user must purchase a plan first before their status can be toggled.");
        return;
    }
    await setProStatus(currentUserEmail, isPro);
    // Re-check status from DB
    const updatedStatus = await getUserStatus(currentUserEmail);
    setIsProMember(updatedStatus);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <header className="py-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AppIcon className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Safe<span className="text-brand-yellow">2</span>Tow
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             {isProMember ? (
                <div className="px-3 py-1.5 text-sm font-bold text-gray-900 bg-brand-yellow rounded-lg flex items-center gap-1.5">
                    <span>+</span>
                    <span>Pro Member</span>
                </div>
            ) : (
                <button onClick={() => setIsPaymentModalOpen(true)} className="px-3 py-1.5 text-sm font-semibold bg-brand-yellow text-gray-900 rounded-lg hover:bg-amber-400 transition-colors">
                    Upgrade
                </button>
            )}
            <MembershipToggle isPro={isProMember} onToggle={handleMembershipToggle} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">AI-Powered Towing Guide</h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            Get instant, vehicle-specific flat tow and wheel-lift procedures.
          </p>
        </div>

        <SearchBar 
          onSubmit={handleSearch} 
          isLoading={isLoading} 
          onClear={handleClear}
          isMember={isProMember}
          onUpgradeClick={() => setIsPaymentModalOpen(true)}
        />

        <div className="mt-8">
          {isLoading && <Loader />}
          {error && (
            <div className="text-center p-6 bg-red-100 dark:bg-red-900/50 border border-danger-red rounded-lg text-red-700 dark:text-red-300 animate-fade-in">
              <h3 className="font-bold">Search Failed</h3>
              <p>{error}</p>
            </div>
          )}
          {towingInfo && (
            <>
              <ResultCard 
                towingInfo={towingInfo} 
                onOpenDrivetrainInfo={() => setIsDrivetrainModalOpen(true)}
                isMember={isProMember}
                onUpgradeClick={() => setIsPaymentModalOpen(true)}
              />
               <div className="text-center mt-6">
                 <button onClick={() => setIsFeedbackModalOpen(true)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-yellow underline">
                   Was this information correct? Provide feedback.
                 </button>
               </div>
            </>
          )}
        </div>
        
        {!isProMember && !isLoading && towingInfo && <AdBanner onUpgradeClick={() => setIsPaymentModalOpen(true)} />}

      </main>
      
      <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-8">
        <p>&copy; {new Date().getFullYear()} Safe2Tow. AI-generated data. Always verify with official sources.</p>
        <p className="mt-1">
          <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow">View on GitHub</a>
        </p>
      </footer>

      {isDrivetrainModalOpen && <DrivetrainInfoModal isOpen={isDrivetrainModalOpen} onClose={() => setIsDrivetrainModalOpen(false)} />}
      
      {isFeedbackModalOpen && (
        <FeedbackModal 
          isOpen={isFeedbackModalOpen} 
          onClose={() => setIsFeedbackModalOpen(false)} 
          towingInfo={towingInfo}
          searchQuery={searchQuery}
          userEmail={currentUserEmail}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPurchaseComplete={handlePurchaseComplete}
          theme={theme}
        />
      )}

    </div>
  );
}

export default App;