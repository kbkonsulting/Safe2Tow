

import React, { useState, useEffect, useRef } from 'react';

import { TowingInfo } from './types';
import { getTowingInfo, identifyVehicleFromImage, extractVinFromImage, classifyCodeType } from './services/geminiService';
import { decodePlateToVin } from './services/autoDevService';
import { getUser, upgradeUserToPro } from './services/databaseService';
import { onAuthChange, User } from './services/authService';
import { isFirebaseConfigured } from './services/firebase';


import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import { AppIcon } from './components/icons';
import ThemeToggle from './components/ThemeToggle';
import DrivetrainInfoModal from './components/DrivetrainInfoModal';
import AppFooter from './components/AppFooter';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import AccountSwitcherModal from './components/AccountSwitcherModal';
import FeedbackModal from './components/FeedbackModal';
import ImageScanChoiceModal from './components/ImageScanChoiceModal';
import UpgradeModal from './components/UpgradeModal';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';

export type Theme = 'light' | 'dark';
export type ScanMode = 'smart_code' | 'gemini_photo';

interface ModalState {
  drivetrain: boolean;
  terms: boolean;
  privacy: boolean;
  accountSwitcher: boolean;
  feedback: boolean;
  imageScanChoice: boolean;
  upgrade: boolean;
  auth: boolean;
  payment: boolean;
}

const App: React.FC = () => {
  const [towingInfo, setTowingInfo] = useState<TowingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [drivetrainModalSection, setDrivetrainModalSection] = useState<string | null>(null);
  const [communityFeedback, setCommunityFeedback] = useState<Record<string, string[]>>({});
  
  // This state is now a combination of Test mode and DB status
  const [isPro, setIsPro] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth and Payment flow state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDbPro, setIsDbPro] = useState(false); // Pro status from DB
  const [pendingUpgrade, setPendingUpgrade] = useState(false);

  const [modals, setModals] = useState<ModalState>({
    drivetrain: false,
    terms: false,
    privacy: false,
    accountSwitcher: false,
    feedback: false,
    imageScanChoice: false,
    upgrade: false,
    auth: false,
    payment: false,
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

  // Auth state listener
  useEffect(() => {
      if (!isFirebaseConfigured) return;

      const unsubscribe = onAuthChange(async (user) => {
          setCurrentUser(user);
          if (user) {
              const userProfile = await getUser(user.uid);
              const proStatus = userProfile?.is_pro_member || false;
              setIsDbPro(proStatus);
              setIsPro(proStatus); // Sync local state with db state

              if (pendingUpgrade && !proStatus) {
                  setPendingUpgrade(false);
                  closeModal('auth');
                  openModal('payment');
              } else if (pendingUpgrade && proStatus) {
                  // User is already pro, no need to show payment modal
                  setPendingUpgrade(false);
                  closeModal('auth');
              }
          } else {
              setIsDbPro(false);
              // When logged out, local `isPro` can still be toggled by test switcher
          }
      });
      return () => unsubscribe();
  }, [pendingUpgrade]);

  const openModal = (modalName: keyof ModalState) => setModals(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName: keyof ModalState) => setModals(prev => ({ ...prev, [modalName]: false }));

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setTowingInfo(null);
    
    try {
      const result = await getTowingInfo(searchQuery);
      setTowingInfo(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during search.");
      }
    } finally {
      setIsLoading(false);
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

  const handleUpgradeClick = () => {
    if (isPro) return;
    if (!isFirebaseConfigured) {
        alert("This is a Pro feature. Use the 'Change' button in the header to switch to Pro mode for testing.");
        return;
    }
    openModal('upgrade');
  };

  const handleProceedToPayment = () => {
    closeModal('upgrade');
    if (currentUser) {
        openModal('payment');
    } else {
        setPendingUpgrade(true);
        openModal('auth');
    }
  };

  const handlePaymentSuccess = async (stripeCustomerId: string) => {
    if (!currentUser) return;
    try {
        await upgradeUserToPro(currentUser.uid, stripeCustomerId);
        setIsPro(true);
        setIsDbPro(true);
        closeModal('payment');
        alert('Upgrade successful! You are now a Pro member.');
    } catch (error) {
        console.error("Failed to upgrade user:", error);
        alert("There was an issue upgrading your account. Please contact support.");
    }
  };

  const handleScanModeSelect = (mode: ScanMode) => {
    setScanMode(mode);
    closeModal('imageScanChoice');
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileSelected = async (file: File | undefined) => {
    if (!file || !scanMode) return;

    setIsLoading(true);
    setError(null);
    setTowingInfo(null);
    
    try {
      const base64Image = await fileToBase64(file);

      if (scanMode === 'smart_code') {
        setQuery('Analyzing image...');
        const imageType = await classifyCodeType(base64Image);
        
        if (imageType === 'vin') {
            setQuery('Scanning for VIN...');
            const vinFromImage = await extractVinFromImage(base64Image);
            if (vinFromImage) {
                const newQuery = `VIN ${vinFromImage}`;
                setQuery(newQuery);
                await handleSearch(newQuery);
            } else {
                alert("Could not extract a valid 17-character VIN from the image. Please try a clearer picture.");
                setQuery('');
            }
        } else if (imageType === 'plate') {
            setQuery('Decoding license plate...');
            const vinFromPlate = await decodePlateToVin(base64Image);
            if (vinFromPlate) {
                const newQuery = `VIN ${vinFromPlate}`;
                setQuery(newQuery);
                await handleSearch(newQuery);
            } else {
                alert("Could not decode a VIN from the license plate. Please try another image or enter details manually.");
                setQuery('');
            }
        } else { // 'none'
            alert("Could not detect a VIN or a license plate. Try a clearer image or choose 'Identify by Vehicle Photo' for general pictures.");
            setQuery('');
        }
      } else if (scanMode === 'gemini_photo') {
        setQuery('Identifying vehicle...');
        await processVehicleIdentification(base64Image);
      }
    } catch (error) {
        console.error("Image processing failed:", error);
        alert(error instanceof Error ? error.message : "An unknown error occurred during image processing.");
        setQuery('');
    } finally {
        setIsLoading(false);
        setScanMode(null); // Reset after use
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
    }
  };
  
  const processVehicleIdentification = async (base64Image: string) => {
      const vehicle = await identifyVehicleFromImage(base64Image);
      if (vehicle && vehicle.make && vehicle.model) {
        const newQuery = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
        setQuery(newQuery);
        await handleSearch(newQuery);
      } else {
        const errorMessage = vehicle?.error || "Could not identify the vehicle. Please try another photo or enter details manually.";
        alert(errorMessage);
        setQuery('');
      }
  };

  const handleOpenDrivetrainModal = (section: string | null = null) => {
    setDrivetrainModalSection(section);
    openModal('drivetrain');
  };

  const handleFeedbackSubmit = (feedbackText: string): Promise<void> => {
    if (!towingInfo) {
      return Promise.reject(new Error("Cannot submit feedback without towing info."));
    }
    
    const { year, make, model } = towingInfo.vehicle;
    const vehicleKey = `${year}-${make}-${model}`.toLowerCase().replace(/\s+/g, '-');
    
    setCommunityFeedback(prev => {
      const existingFeedback = prev[vehicleKey] || [];
      return {
        ...prev,
        [vehicleKey]: [...existingFeedback, feedbackText],
      };
    });

    // This is where you would call the actual database service
    // For now, we resolve immediately to simulate success.
    // submitFeedback({ ... })
    return Promise.resolve();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AppIcon className="h-10 w-auto" />
            <h1 className="text-xl md:text-2xl font-bold">Safe2Tow</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="p-1 sm:p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Test Mode</span>
                <div className={`text-sm font-bold ${isPro ? 'text-brand-yellow' : 'text-gray-800 dark:text-gray-200'}`}>
                    {isPro ? 'Pro' : 'Free'}
                </div>
            </div>
            <button
                onClick={() => openModal('accountSwitcher')}
                className="text-sm font-semibold hover:text-brand-yellow"
            >
                Change
            </button>
            <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
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
            Search by make & model, VIN, or use your camera for a smart scan (Pro feature).
          </p>
        </div>
        
        <SearchBar 
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch} 
          onCameraClick={isPro ? () => openModal('imageScanChoice') : handleUpgradeClick}
          isLoading={isLoading} 
          isPro={isPro} 
          onUpgradeClick={handleUpgradeClick}
          hasResult={!!towingInfo}
        />
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={(e) => handleFileSelected(e.target.files?.[0])} 
          className="hidden" 
          aria-hidden="true"
        />

        <div className="mt-8">
          {isLoading && <Loader />}
          {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>}
          {towingInfo && (
            <ResultCard 
              towingInfo={towingInfo} 
              isPro={isPro}
              onUpgradeClick={handleUpgradeClick}
              onDrivetrainInfoClick={(section) => handleOpenDrivetrainModal(section)}
              onFeedbackClick={() => openModal('feedback')}
              communityFeedback={communityFeedback[`${towingInfo.vehicle.year}-${towingInfo.vehicle.make}-${towingInfo.vehicle.model}`.toLowerCase().replace(/\s+/g, '-')]}
            />
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
      <TermsOfServiceModal 
        isOpen={modals.terms}
        onClose={() => closeModal('terms')}
      />
      <PrivacyPolicyModal 
        isOpen={modals.privacy}
        onClose={() => closeModal('privacy')}
      />
      <AccountSwitcherModal 
        isOpen={modals.accountSwitcher}
        onClose={() => closeModal('accountSwitcher')}
        isPro={isPro}
        setIsPro={setIsPro}
        isUserLoggedIn={!!currentUser}
      />
      <FeedbackModal
        isOpen={modals.feedback}
        onClose={() => closeModal('feedback')}
        onSubmit={handleFeedbackSubmit}
        towingInfo={towingInfo}
      />
       <ImageScanChoiceModal
        isOpen={modals.imageScanChoice}
        onClose={() => closeModal('imageScanChoice')}
        onSelect={handleScanModeSelect}
        isPro={isPro}
        onUpgradeClick={handleUpgradeClick}
      />
      <UpgradeModal 
        isOpen={modals.upgrade}
        onClose={() => closeModal('upgrade')}
        onUpgrade={handleProceedToPayment}
      />
      <AuthModal
          isOpen={modals.auth}
          onClose={() => {
              closeModal('auth');
              setPendingUpgrade(false); // Reset if user closes modal
          }}
          onOpenTerms={() => openModal('terms')}
          onOpenPrivacy={() => openModal('privacy')}
          onProTesterLoginSuccess={async () => {
              // onAuthChange will fire and handle state updates.
          }}
      />
      {currentUser && (
          <PaymentModal
              isOpen={modals.payment}
              onClose={() => closeModal('payment')}
              onSuccess={handlePaymentSuccess}
              user={currentUser}
              theme={theme}
          />
      )}
    </div>
  );
};

export default App;