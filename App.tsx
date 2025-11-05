import React, { useState, useEffect } from 'react';
import { onAuthChange, signOut, User } from './services/authService';
import { TowingInfo, VehicleIdentificationResult } from './types';
import { getTowingInfo, identifyVehicleFromImage, extractVinFromImage, isGeminiConfigured } from './services/geminiService';
import { getUser, logSearch, submitFeedback, setProStatus } from './services/databaseService';
import { isFirebaseConfigured } from './services/firebase';

import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import { AppIcon } from './components/icons';
import AdBanner from './components/AdBanner';
import ThemeToggle from './components/ThemeToggle';
import DrivetrainInfoModal from './components/DrivetrainInfoModal';
import AuthModal from './components/AuthModal';
import FeedbackModal from './components/FeedbackModal';
import AppFooter from './components/AppFooter';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';

export type Theme = 'light' | 'dark';

interface CurrentUser {
  firebaseUser: User;
  isPro: boolean;
}

// Use a more descriptive name for the active modal
type ActiveModal = 'drivetrain' | 'auth' | 'feedback' | 'terms' | 'privacy' | null;

const ConfigWarningBanner: React.FC = () => {
    const isConfigured = isFirebaseConfigured && isGeminiConfigured;
    if (isConfigured) {
        return null;
    }

    const firebaseMessage = !isFirebaseConfigured ? "Firebase (for login & data)" : "";
    const geminiMessage = !isGeminiConfigured ? "Gemini (for AI features)" : "";
    const missingServices = [firebaseMessage, geminiMessage].filter(Boolean).join(" and ");

    return (
        <div className="bg-red-600 text-white text-center p-2 text-sm sticky top-0 z-50">
            <strong>Limited Mode:</strong> {missingServices} not configured. See README.md.
        </div>
    );
};

const App: React.FC = () => {
  const [towingInfo, setTowingInfo] = useState<TowingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [drivetrainModalSection, setDrivetrainModalSection] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthChange(async (firebaseUser) => {
        if (firebaseUser) {
          const userData = await getUser(firebaseUser.uid);
          setCurrentUser({ firebaseUser, isPro: userData?.is_pro_member ?? false });
        } else {
          setCurrentUser(null);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handleSearch = async (query: string) => {
    if (!isGeminiConfigured) {
        setError("AI features are disabled. Please configure the Gemini API key.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setTowingInfo(null);
    setCurrentQuery(query);
    
    let result: TowingInfo | null = null;
    let searchError: Error | null = null;

    try {
      result = await getTowingInfo(query);
      setTowingInfo(result);
    } catch (err) {
      searchError = err instanceof Error ? err : new Error("An unknown error occurred.");
      setError(searchError.message);
    } finally {
      setIsLoading(false);
      if (isFirebaseConfigured) {
          logSearch({
            userUid: currentUser?.firebaseUser.uid ?? null,
            searchParams: { query },
            wasSuccessful: !!result,
            errorMessage: searchError?.message ?? null,
            fullResult: result,
          });
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageSearch = async (file: File): Promise<VehicleIdentificationResult | null> => {
    if (!currentUser?.isPro) {
      handleUpgradeClick();
      return null;
    }
    if (!isGeminiConfigured) return null;

    try {
      const base64Image = await fileToBase64(file);
      return await identifyVehicleFromImage(base64Image);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleVinSearch = async (file: File): Promise<string | null> => {
    if (!currentUser?.isPro) {
      handleUpgradeClick();
      return null;
    }
    if (!isGeminiConfigured) return null;
    try {
      const base64Image = await fileToBase64(file);
      return await extractVinFromImage(base64Image);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleUpgradeClick = () => {
    if (!isFirebaseConfigured) return;
    if (!currentUser) {
      setActiveModal('auth');
    } else {
      // Future: Open payment modal here.
      alert("Pro features are coming soon!");
    }
  };

  const handleFeedbackSubmit = async (feedbackText: string) => {
    if (!towingInfo || !isFirebaseConfigured) return;
    try {
      await submitFeedback({
        userUid: currentUser?.firebaseUser.uid ?? null,
        query: currentQuery,
        towingInfo: towingInfo,
        feedbackText: feedbackText,
        isHelpful: null,
      });
      setActiveModal(null);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert("Sorry, we couldn't submit your feedback right now.");
    }
  };

  const handleOpenDrivetrainModal = (section: string | null = null) => {
    setDrivetrainModalSection(section);
    setActiveModal('drivetrain');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-blue text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <ConfigWarningBanner />
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AppIcon className="h-10 w-auto" />
            <h1 className="text-xl md:text-2xl font-bold">Towing Guide AI</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
            {isFirebaseConfigured && (
              currentUser ? (
                <button onClick={signOut} className="text-sm font-semibold hover:text-brand-yellow">Sign Out</button>
              ) : (
                <button
                  onClick={() => setActiveModal('auth')}
                  className="text-sm font-semibold hover:text-brand-yellow"
                >
                  Sign In
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2">The Ultimate Towing Companion</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Built by tow operators, for tow operators. Our AI is trained by professionals to give you instant, reliable towing instructions for any vehicle.
            <button onClick={() => handleOpenDrivetrainModal()} className="ml-1 text-brand-yellow underline">Learn the basics</button>.
          </p>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            Search by make & model, VIN, or let us identify the car by picture (Pro feature).
          </p>
        </div>

        <SearchBar onSearch={handleSearch} onImageSearch={handleImageSearch} onVinSearch={handleVinSearch} isLoading={isLoading} isPro={currentUser?.isPro ?? false} onUpgradeClick={handleUpgradeClick} />

        <div className="mt-8">
          {isLoading && <Loader />}
          {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>}
          {towingInfo && (
            <>
              {!(currentUser?.isPro) && <AdBanner onUpgradeClick={handleUpgradeClick} disabled={!isFirebaseConfigured} />}
              <ResultCard
                towingInfo={towingInfo}
                isPro={currentUser?.isPro ?? false}
                onUpgradeClick={handleUpgradeClick}
                onLoginClick={() => setActiveModal('auth')}
                onFeedbackClick={() => setActiveModal('feedback')}
                onDrivetrainInfoClick={(section) => handleOpenDrivetrainModal(section)}
                upgradeDisabled={!isFirebaseConfigured}
              />
            </>
          )}
        </div>
      </main>

      <AppFooter
        onTermsClick={() => setActiveModal('terms')}
        onPrivacyClick={() => setActiveModal('privacy')}
      />

      <DrivetrainInfoModal
        isOpen={activeModal === 'drivetrain'}
        onClose={() => setActiveModal(null)}
        initialSection={drivetrainModalSection}
        theme={theme}
      />
      {isFirebaseConfigured && <AuthModal
        isOpen={activeModal === 'auth'}
        onClose={() => setActiveModal(null)}
        onOpenTerms={() => setActiveModal('terms')}
        onOpenPrivacy={() => setActiveModal('privacy')}
        theme={theme}
      />}
      <FeedbackModal
        isOpen={activeModal === 'feedback'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleFeedbackSubmit}
        towingInfo={towingInfo}
        theme={theme}
      />
      <TermsOfServiceModal isOpen={activeModal === 'terms'} onClose={() => setActiveModal(null)} theme={theme} />
      <PrivacyPolicyModal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} theme={theme} />
    </div>
  );
};

export default App;