import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  startOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, startOpen = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex justify-between items-center p-4 text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow ${isOpen ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
          aria-expanded={isOpen}
        >
          <span className="flex-grow">{title}</span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </h2>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}
        aria-hidden={!isOpen}
      >
        <div className="p-4 bg-white dark:bg-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;