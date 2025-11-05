import React from 'react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700 relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          aria-label="Close privacy policy modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 id="privacy-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h2>
        
        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-4">
          <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200">
            <strong>LEGAL DISCLAIMER:</strong> This is a template document and NOT legal advice. You MUST consult with a qualified lawyer to draft a privacy policy that complies with regulations like GDPR, CCPA, etc., in your jurisdiction.
          </div>

          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>

          <h3>1. Information We Collect</h3>
          <p>We may collect several types of information from and about users of our Service, including:</p>
          <ul>
            <li><strong>Personal Data:</strong> While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. This includes your Name and Email Address (via Google Sign-In).</li>
            <li><strong>Usage Data:</strong> We collect information on your search queries and feedback submissions to improve our service. This data is stored in our Firestore database.</li>
            <li><strong>Payment Data:</strong> To process payments for Pro services, we use Stripe. We store your Stripe Customer ID, but we do not store or have access to your credit card details.</li>
          </ul>

          <h3>2. Use of Your Personal Data</h3>
          <p>The Company may use Personal Data for the following purposes:</p>
          <ul>
            <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
            <li>To manage Your Account: to manage Your registration as a user of the Service.</li>
            <li>To process your payments and manage your subscription.</li>
            <li>To contact You: To contact You by email regarding updates or informative communications related to the functionalities, products or contracted services.</li>
          </ul>

          <h3>3. Third-Party Services</h3>
          <p>We use third-party services to provide our Service. These third parties have access to Your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
          <ul>
            <li><strong>Google/Firebase:</strong> For authentication and database services.</li>
            <li><strong>Google Gemini API:</strong> To process search queries.</li>
            <li><strong>Stripe:</strong> For payment processing.</li>
          </ul>
          
          <h3>4. Security of Your Personal Data</h3>
          <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
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

export default PrivacyPolicyModal;
