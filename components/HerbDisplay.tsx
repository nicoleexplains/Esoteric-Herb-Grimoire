import React, { useMemo } from 'react';
import type { HerbInfo, Spell } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import Tooltip from './Tooltip';

interface HerbDisplayProps {
  herbData: HerbInfo;
  herbImage: string;
  isFavorite: boolean;
  spells: Spell[];
  onToggleFavorite: () => void;
  onExport: () => void;
  isExporting: boolean;
  onDownloadImage: (image: string, name: string) => void;
}

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-base font-bold uppercase tracking-widest text-purple-600 dark:text-purple-300 mb-3">{title}</h3>
    <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{children}</div>
  </div>
);

const HerbDisplay: React.FC<HerbDisplayProps> = ({ herbData, herbImage, isFavorite, spells, onToggleFavorite, onExport, isExporting, onDownloadImage }) => {
  const associatedSpells = useMemo(() => {
    return spells.filter(spell => spell.ingredients.some(ing => ing.toLowerCase() === herbData.name.toLowerCase()));
  }, [spells, herbData.name]);

  return (
    <div className="relative bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl shadow-purple-900/20 overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Tooltip text="Export Page as PDF">
          <button
            onClick={onExport}
            disabled={isExporting}
            className="p-2 rounded-full bg-black/10 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-wait"
            aria-label="Export herb details as PDF"
          >
            {isExporting ? (
              <svg className="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <DownloadIcon className="w-6 h-6" />
            )}
          </button>
        </Tooltip>
        <Tooltip text={isFavorite ? 'Remove from Grimoire' : 'Add to Grimoire'}>
          <button
            onClick={onToggleFavorite}
            className="p-2 rounded-full bg-black/10 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 transform hover:scale-110"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon className={`w-6 h-6 ${isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none'}`} />
          </button>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 md:p-8">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-purple-600 dark:from-green-300 dark:to-purple-400 mb-1">{herbData.name}</h2>
          <p className="text-xl italic text-gray-500 dark:text-gray-400 mb-8">{herbData.scientificName}</p>

          <InfoSection title="Magical Properties">
            <div className="flex flex-wrap gap-2">
              {herbData.magicalProperties.map((prop) => (
                <span key={prop} className="bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200 text-sm font-semibold px-3 py-1.5 rounded-full">
                  {prop}
                </span>
              ))}
            </div>
          </InfoSection>

          <InfoSection title="Associations">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <p><strong className="text-gray-600 dark:text-gray-400">Element:</strong> {herbData.elementalAssociation}</p>
                <p><strong className="text-gray-600 dark:text-gray-400">Planet:</strong> {herbData.planetaryAssociation}</p>
            </div>
            {herbData.deityAssociation && herbData.deityAssociation.length > 0 &&
                <p className="mt-2"><strong className="text-gray-600 dark:text-gray-400">Deities:</strong> {herbData.deityAssociation.join(', ')}</p>
            }
          </InfoSection>

          <InfoSection title="Arcane Lore">
            <p>{herbData.lore}</p>
          </InfoSection>

          <InfoSection title="Ritual Usage">
            <p>{herbData.usage}</p>
          </InfoSection>
          
          {herbData.herbalOil && (
            <>
              <InfoSection title="Esoteric Oil Lore">
                <p>{herbData.herbalOil.lore}</p>
              </InfoSection>
              <InfoSection title="Esoteric Oil Usage">
                <p>{herbData.herbalOil.usage}</p>
              </InfoSection>
            </>
          )}

          {associatedSpells.length > 0 && (
            <InfoSection title="Associated Spells">
              <ul className="list-disc list-inside space-y-1">
                {associatedSpells.map(spell => (
                  <li key={spell.id}>{spell.name}</li>
                ))}
              </ul>
            </InfoSection>
          )}

          {herbData.externalResources && herbData.externalResources.length > 0 && (
            <InfoSection title="Further Research">
              <ul className="space-y-2">
                {herbData.externalResources.map((resource) => (
                  <li key={resource.url}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 hover:underline"
                    >
                      {resource.source}
                      <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </InfoSection>
          )}

        </div>
        <div className="relative group min-h-[300px] md:min-h-full">
            <img 
                src={herbImage} 
                alt={`Artistic representation of ${herbData.name}`}
                className="w-full h-full object-cover"
            />
             <Tooltip text="Download Image">
              <button
                onClick={() => onDownloadImage(herbImage, herbData.name)}
                className="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
                aria-label="Download image"
              >
                <DownloadIcon className="w-6 h-6" />
              </button>
            </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default HerbDisplay;