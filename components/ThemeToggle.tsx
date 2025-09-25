import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import Tooltip from './Tooltip';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <Tooltip text={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
      <button
        onClick={toggleTheme}
        className="p-3 rounded-full bg-black/10 dark:bg-gray-800/50 hover:bg-black/20 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <MoonIcon className="w-7 h-7" />
        ) : (
          <SunIcon className="w-7 h-7" />
        )}
      </button>
    </Tooltip>
  );
};

export default ThemeToggle;
