import React, { useState, useEffect } from 'react';
import { TowingInfo } from '../types';
import { submitFeedback, FeedbackData } from '../services/databaseService';
import { AppIcon } from './icons';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  towingInfo: TowingInfo | null;
  searchQuery: string;
  userEmail: string | null;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, towingInfo, searchQuery, userEmail }) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [incorrectFields, setIncorrectFields] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setIsCorrect(null);
      setIncorrectFields([]);
      setComments('');
      setStatus('idle');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFieldCheckbox = (field: string) => {
    setIncorrectFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!towingInfo) return;
    
    setStatus('submitting');
    
    const feedbackData: Omit<FeedbackData, 'createdAt'> = {
      userEmail,
      searchQuery,
      isCorrect,
      incorrectFields: isCorrect === false ? incorrectFields : [],
      comments,
      towingInfo,
    };

    const success = await submitFeedback(feedbackData);

    if (!success) {
      setStatus('error');
    } else {
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };
  
  const vehicleFields = ['Year', 'Make', 'Model', 'Trim', 'Drivetrain'];
  const towingFields = ['Overall Safety', 'Summary', 'Front Towing', 'Rear Towing', 'Cautions'];

  const renderContent = () => {
    if (status === 'success') {
      return (
        <div className="text-center p-8">
          <AppIcon className="w-16 h-16 mx-auto mb-4 text-safe-green"/>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thank You!</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Your feedback helps us improve.</p>
        </div>
      );
    }

    if (status === 'error') {
       return (
        <div className="text-center p-8">
          <h3 className="text-xl font-bold text-danger-red">Submission Failed</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Could not submit feedback. Please try again later.</p>
           <button onClick={() => setStatus('idle')} className="mt-4 px-6 py-2 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400">
            Try Again
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        <p className="text-lg text-center font-semibold text-gray-800 dark:text-gray-200 mb-4">Was this information correct?</p>
        <div className="flex justify-center gap-4 mb-6">
          <button type="button" onClick={() => setIsCorrect(true)} className={`px-6 py-2 rounded-md font-semibold transition-all ${isCorrect === true ? 'bg-safe-green text-white ring-2 ring-safe-green' : 'bg-gray-200 dark:bg-gray-700'}`}>Yes</button>
          <button type="button" onClick={() => setIsCorrect(false)} className={`px-6 py-2 rounded-md font-semibold transition-all ${isCorrect === false ? 'bg-danger-red text-white ring-2 ring-danger-red' : 'bg-gray-200 dark:bg-gray-700'}`}>No</button>
        </div>

        {isCorrect === false && (
          <div className="animate-fade-in space-y-4">
            <p className="font-semibold text-gray-800 dark:text-gray-200">What seemed incorrect?</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">Vehicle Details</h4>
                {vehicleFields.map(field => (
                  <label key={field} className="flex items-center gap-2">
                    <input type="checkbox" checked={incorrectFields.includes(field)} onChange={() => handleFieldCheckbox(field)} className="rounded text-brand-yellow focus:ring-brand-yellow" />
                    <span className="text-gray-700 dark:text-gray-300">{field}</span>
                  </label>
                ))}
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">Towing Info</h4>
                 {towingFields.map(field => (
                  <label key={field} className="flex items-center gap-2">
                    <input type="checkbox" checked={incorrectFields.includes(field)} onChange={() => handleFieldCheckbox(field)} className="rounded text-brand-yellow focus:ring-brand-yellow" />
                    <span className="text-gray-700 dark:text-gray-300">{field}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {(isCorrect !== null) && (
           <div className="mt-6 animate-fade-in">
            <label htmlFor="comments" className="block font-semibold text-gray-800 dark:text-gray-200 mb-2">Additional Comments (Optional)</label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              placeholder="e.g., The drivetrain for the hybrid model is different..."
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 font-semibold text-gray-700 dark:text-gray-300 bg-transparent rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
          <button type="submit" disabled={isCorrect === null || status === 'submitting'} className="px-5 py-2 font-semibold text-gray-900 bg-brand-yellow rounded-md hover:bg-amber-400 disabled:bg-gray-500">
            {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    );
  };
  

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label="Close feedback modal">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Provide Feedback</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default FeedbackModal;