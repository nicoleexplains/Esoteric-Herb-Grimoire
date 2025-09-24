import React, { useState, useRef, useEffect } from 'react';
import type { FavoriteHerb } from '../types';
import { generatePdfReport, copyReportForDocs } from '../services/reportService';
import { BookIcon } from './icons/BookIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ExportIcon } from './icons/ExportIcon';
import Tooltip from './Tooltip';

interface FavoritesPanelProps {
  isOpen: boolean;
  favorites: FavoriteHerb[];
  onSelect: (herb: FavoriteHerb) => void;
  onRemove: (herbName: string) => void;
  onClose: () => void;
}

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({
  isOpen,
  favorites,
  onSelect,
  onRemove,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = async (type: 'pdf' | 'copy') => {
    setIsExporting(true);
    setIsExportMenuOpen(false);
    setExportMessage(type === 'pdf' ? 'Generating PDF...' : 'Copying content...');

    try {
      if (type === 'pdf') {
        await generatePdfReport(favorites);
        setExportMessage('PDF downloaded!');
      } else {
        await copyReportForDocs(favorites);
        setExportMessage('Copied to clipboard!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportMessage('Export failed. See console for details.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportMessage(''), 3000);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="favorites-heading"
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <BookIcon className="w-6 h-6 text-purple-300" />
              <h2 id="favorites-heading" className="text-xl font-bold text-gray-200">
                My Grimoire
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative" ref={exportMenuRef}>
                 <Tooltip text="Export Grimoire">
                    <button
                      onClick={() => setIsExportMenuOpen(prev => !prev)}
                      disabled={favorites.length === 0 || isExporting}
                      className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Export grimoire"
                    >
                      <ExportIcon className="w-6 h-6" />
                    </button>
                 </Tooltip>
                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                    <Tooltip text="Download a PDF of your grimoire." className="block w-full">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-md"
                      >
                        Download as PDF
                      </button>
                    </Tooltip>
                    <Tooltip text="Copy report for other apps." className="block w-full">
                      <button
                        onClick={() => handleExport('copy')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-b-md"
                      >
                        Copy for Docs
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
              <Tooltip text="Close panel">
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                  aria-label="Close favorites panel"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </Tooltip>
            </div>
          </header>
          
          {exportMessage && (
            <div className="text-center p-2 bg-purple-900/50 text-purple-200 text-sm">
              {exportMessage}
            </div>
          )}

          <div className="flex-grow overflow-y-auto p-4">
            {favorites.length === 0 ? (
              <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
                <BookIcon className="w-16 h-16 text-gray-600 mb-4" />
                <p className="font-semibold">Your grimoire is empty.</p>
                <p className="text-sm">Saved herbs will appear here.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {favorites.map((herb) => (
                  <li
                    key={herb.name}
                    className="group bg-gray-800 rounded-lg p-3 flex items-center gap-4 transition-all duration-200 hover:bg-gray-700/80 hover:shadow-lg"
                  >
                    <img
                      src={herb.herbImage}
                      alt={herb.name}
                      className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <Tooltip text={`View details for ${herb.name}`} className="w-full">
                        <button
                          onClick={() => onSelect(herb)}
                          className="text-left w-full"
                        >
                          <h3 className="font-bold text-lg text-green-300 truncate group-hover:text-green-200">
                            {herb.name}
                          </h3>
                          <p className="text-sm text-gray-400 italic truncate">
                            {herb.scientificName}
                          </p>
                        </button>
                      </Tooltip>
                    </div>
                    <Tooltip text={`Remove ${herb.name}`}>
                      <button
                        onClick={() => onRemove(herb.name)}
                        className="p-2 rounded-full text-gray-500 hover:bg-red-900/50 hover:text-red-400 transition-colors flex-shrink-0"
                        aria-label={`Remove ${herb.name} from favorites`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default FavoritesPanel;