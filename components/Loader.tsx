import React, { useState, useEffect } from 'react';
import { AppIcon } from './icons';

const loadingMessages = [
  "Consulting towing manuals...",
  "Analyzing drivetrain configuration...",
  "Cross-referencing manufacturer bulletins...",
  "Checking field reports for anecdotal advice...",
  "Synthesizing expert knowledge..."
];

const Loader: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      setMessage(loadingMessages[currentIndex]);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      <AppIcon
        className="h-24 w-auto animate-bounce-slow" 
      />
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 transition-opacity duration-500 ease-in-out">{message}</p>
    </div>
  );
};

export default Loader;