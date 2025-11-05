import React, { useState, useEffect } from 'react';
// Fix: Import User type from central auth service instead of firebase/auth
import { onAuthChange, signOut, User } from './services/authService';

import { TowingInfo, VehicleIdentificationResult } from './types';
import { getTowingInfo, identifyVehicleFromImage, extractVinFromImage } from './services/geminiService';
import { getUser, upgradeUserToPro, logSearch, submitFeedback, setProStatus } from './services/databaseService';
// Architectural Fix: Import configuration status flags
import { isFirebaseConfigured, isStripeConfigured } from './services/firebase';

import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import { AppIcon } from './components/icons';
import AdBanner from './components/AdBanner';
import MembershipToggle from './components/MembershipToggle';
import ThemeToggle from './components/ThemeToggle';
import DrivetrainInfoModal from './components/DrivetrainInfoModal';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import FeedbackModal from './components/FeedbackModal';
import AppFooter from './components/AppFooter';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';

export type Theme = 'light' | 'dark';

interface CurrentUser {
  firebaseUser: User;
  isPro: boolean;
}

interface ModalState {
  drivetrain: boolean;
  auth: boolean;
  payment: boolean;
  feedback: boolean;
  terms: boolean;
  privacy: boolean;
}

// Architectural Fix: A banner to inform developers about missing configuration.
const ConfigWarningBanner: React.FC = () => {
    if (isFirebaseConfigured && isStripeConfigured) {
        return null;
    }

    const firebaseMessage = !isFirebaseConfigured ? "Firebase (for login & data)" : "";
    const stripeMessage = !isStripeConfigured ? "Stripe (for payments)" : "";
    const missingServices = [firebaseMessage, stripeMessage].filter(Boolean).join(" and ");

    return (
        <div className="bg-red-600 text-white text-center p-2 text-sm sticky top-0 z-50">
            <strong>Limited Mode:</strong> {missingServices} not configured. Please see README.md for setup instructions.
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

  const [modals, setModals] = useState<ModalState>({
    drivetrain: false,
    auth: false,
    payment: false,
    feedback: false,
    terms: false,
    privacy: false,
  });

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

  useEffect(() => {
    // Architectural Fix: Only listen for auth changes if Firebase is properly configured.
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
  
  const openModal = (modalName: keyof ModalState) => setModals(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName: keyof ModalState) => setModals(prev => ({ ...prev, [modalName]: false }));

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSearch = async (query: string) => {
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
      if (err instanceof Error) {
        searchError = err;
        setError(err.message);
      } else {
        const unknownError = new Error("An unknown error occurred during search.");
        searchError = unknownError;
        setError(unknownError.message);
      }
    } finally {
      setIsLoading(false);
      logSearch({
        userUid: currentUser?.firebaseUser.uid ?? null,
        searchParams: { query },
        wasSuccessful: result !== null,
        errorMessage: searchError ? searchError.message : null,
        fullResult: result,
      });
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
      handleUpgradeClick(); // Use centralized handler which checks for config
      return null;
    }
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
    try {
      const base64Image = await fileToBase64(file);
      return await extractVinFromImage(base64Image);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleUpgradeClick = () => {
    if (!isFirebaseConfigured) {
      return; // UI should be disabled, but this is a safeguard.
    }
    if (!currentUser) {
      openModal('auth');
    } else if (isStripeConfigured) {
      openModal('payment');
    }
  };
  
  const handlePurchaseSuccess = async (stripeCustomerId: string) => {
    if (!currentUser) return;
    await upgradeUserToPro(currentUser.firebaseUser.uid, stripeCustomerId);
    setCurrentUser(prev => prev ? { ...prev, isPro: true } : null);
    alert('Upgrade successful! You are now a Pro member.');
  };

  const handleFeedbackSubmit = async (feedbackText: string) => {
    if (!towingInfo) return;
    try {
        await submitFeedback({
            userUid: currentUser?.firebaseUser.uid ?? null,
            query: currentQuery,
            towingInfo: towingInfo,
            feedbackText: feedbackText,
            isHelpful: null,
        });
        closeModal('feedback');
    } catch (error) {
        console.error("Failed to submit feedback:", error);
        alert("Sorry, we couldn't submit your feedback right now.");
    }
  };

  const handleDevTogglePro = async (newIsPro: boolean) => {
    if (!currentUser) return;
    try {
      await setProStatus(currentUser.firebaseUser.uid, newIsPro);
      setCurrentUser(prev => prev ? { ...prev, isPro: newIsPro } : null);
    } catch (error) {
      console.error("Failed to toggle pro status:", error);
      alert("Failed to update pro status. Please try again.");
    }
  };

  const handleOpenDrivetrainModal = (section: string | null = null) => {
    setDrivetrainModalSection(section);
    openModal('drivetrain');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <ConfigWarningBanner />
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AppIcon className="h-10 w-auto" />
            <h1 className="text-xl md:text-2xl font-bold">Towing Guide AI</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <MembershipToggle 
              isPro={currentUser?.isPro ?? false} 
              onToggle={handleDevTogglePro}
              disabled={!currentUser || !isFirebaseConfigured}
            />
            <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
            {currentUser ? (
              <button onClick={signOut} className="text-sm font-semibold hover:text-brand-yellow">Sign Out</button>
            ) : (
              <button 
                onClick={() => openModal('auth')} 
                disabled={!isFirebaseConfigured}
                className="text-sm font-semibold hover:text-brand-yellow disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
              >
                Sign In
              </button>
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
              {!(currentUser?.isPro) && <AdBanner onUpgradeClick={handleUpgradeClick} disabled={!isFirebaseConfigured || !isStripeConfigured} />}
              <ResultCard 
                towingInfo={towingInfo} 
                isPro={currentUser?.isPro ?? false}
                onUpgradeClick={handleUpgradeClick}
                onLoginClick={() => openModal('auth')}
                onFeedbackClick={() => openModal('feedback')}
                onDrivetrainInfoClick={(section) => handleOpenDrivetrainModal(section)}
                upgradeDisabled={!isFirebaseConfigured || !isStripeConfigured}
              />
            </>
          )}
        </div>
      </main>

      <AppFooter
        onTermsClick={() => openModal('terms')}
        onPrivacyClick={() => openModal('privacy')}
      />

      <DrivetrainInfoModal 
        isOpen={modals.drivetrain} 
        onClose={() => closeModal('drivetrain')}
        initialSection={drivetrainModalSection}
      />
      {isFirebaseConfigured && <AuthModal 
        isOpen={modals.auth} 
        onClose={() => closeModal('auth')}
        onOpenTerms={() => openModal('terms')}
        onOpenPrivacy={() => openModal('privacy')}
      />}
      {currentUser && isStripeConfigured && (
        <PaymentModal 
          isOpen={modals.payment} 
          onClose={() => closeModal('payment')} 
          onSuccess={handlePurchaseSuccess}
          user={currentUser.firebaseUser}
          theme={theme}
        />
      )}
      <FeedbackModal 
        isOpen={modals.feedback}
        onClose={() => closeModal('feedback')}
        onSubmit={handleFeedbackSubmit}
        towingInfo={towingInfo}
      />
      <TermsOfServiceModal isOpen={modals.terms} onClose={() => closeModal('terms')} />
      <PrivacyPolicyModal isOpen={modals.privacy} onClose={() => closeModal('privacy')} />
    </div>
  );
};

export default App;