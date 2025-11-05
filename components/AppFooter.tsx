import React from 'react';

interface AppFooterProps {
    onTermsClick: () => void;
    onPrivacyClick: () => void;
}

const AppFooter: React.FC<AppFooterProps> = ({ onTermsClick, onPrivacyClick }) => {
    return (
        <footer className="w-full bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="container mx-auto py-4 px-4 md:px-8 text-center text-xs text-gray-500 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} Safe2Tow. All rights reserved.</p>
                <div className="mt-2 space-x-4">
                    <button onClick={onTermsClick} className="underline hover:text-brand-yellow">
                        Terms of Service
                    </button>
                    <span>|</span>
                    <button onClick={onPrivacyClick} className="underline hover:text-brand-yellow">
                        Privacy Policy
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default AppFooter;
