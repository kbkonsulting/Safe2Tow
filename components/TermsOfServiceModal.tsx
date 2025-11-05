import React from 'react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700 relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          aria-label="Close terms of service modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 id="terms-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h2>
        
        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-4">
          <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200">
            <strong>LEGAL DISCLAIMER:</strong> This is a template document and NOT legal advice. You MUST consult with a qualified lawyer to draft terms and conditions that are appropriate for your specific business and jurisdiction.
          </div>

          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <p>Please read these terms and conditions carefully before using Our Service.</p>

          <h3>1. Acknowledgment</h3>
          <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
          <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. By accessing or using the Service You agree to be bound by these Terms and Conditions.</p>

          <h3>2. User Accounts</h3>
          <p>When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.</p>

          <h3>3. "As Is" and "As Available" Disclaimer</h3>
          <p>The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service.</p>

          <h3>4. Limitation of Liability</h3>
          <p>The information provided by Safe2Tow is for informational and guidance purposes only and is not a substitute for official manufacturer procedures, professional training, or the operator's own judgment. The user assumes all risk and responsibility for any actions taken based on the app's guidance. The creators of Safe2Tow are not liable for any property damage, personal injury, or financial loss resulting from the use of the app.</p>

          <h3>5. Governing Law</h3>
          <p>The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
        </div>

        <div className="mt-6 text-right">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceModal;
