import React, { useState, useEffect, useRef } from 'react';
import type { Theme } from '../App';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SystemIcon } from './icons/SystemIcon';
import { CheckIcon } from './icons/CheckIcon';
import Tooltip from './Tooltip';

interface ThemeToggleProps {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const themeOptions: { value: Theme; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: SystemIcon },
];

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, effectiveTheme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };
  
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const CurrentIcon = effectiveTheme === 'light' ? SunIcon : MoonIcon;

  return (
    <div ref={containerRef} className="relative">
      <Tooltip text="Change Theme">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-full bg-black/10 dark:bg-gray-800/50 hover:bg-black/20 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 transition-colors"
          aria-label="Toggle theme menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <CurrentIcon className="w-7 h-7" />
        </button>
      </Tooltip>
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-fade-in"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="theme-menu-button"
        >
            <div className="py-1">
                {themeOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleThemeChange(option.value)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left ${
                            theme === option.value
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        role="menuitem"
                    >
                        <div className="flex items-center gap-2">
                           <option.icon className="w-5 h-5" />
                           {option.label}
                        </div>
                        {theme === option.value && <CheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-300"/>}
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;