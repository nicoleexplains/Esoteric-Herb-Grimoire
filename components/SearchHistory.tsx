import React, { useState } from 'react';
import { HistoryIcon } from './icons/HistoryIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface SearchHistoryProps {
  history: string[];
  onHistoryClick: (query: string) => void;
  onClearHistory: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onHistoryClick, onClearHistory }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto mt-4">
      <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-3 text-left text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
          aria-expanded={isOpen}
          aria-controls="search-history-panel"
        >
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="font-semibold text-sm">Recent Searches</span>
          </div>
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isOpen && (
          <div id="search-history-panel" className="p-3 border-t border-gray-300 dark:border-gray-700">
            <ul className="space-y-2">
              {history.map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onHistoryClick(item)}
                    className="w-full text-left text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 p-2 rounded-md transition-colors duration-150"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-gray-300/50 dark:border-gray-700/50 text-right">
              <button
                onClick={onClearHistory}
                className="text-xs text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistory;