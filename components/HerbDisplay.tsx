import React from 'react';
import type { HerbInfo } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import Tooltip from './Tooltip';

interface HerbDisplayProps {
  herbData: HerbInfo;
  herbImage: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-base font-bold uppercase tracking-widest text-purple-600 dark:text-purple-300 mb-3">{title}</h3>
    <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{children}</div>
  </div>
);

const HerbDisplay: React.FC<HerbDisplayProps> = ({ herbData, herbImage, isFavorite, onToggleFavorite }) => {
  return (
    <div className="relative bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl shadow-purple-900/20 overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
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

        </div>
        <div className="min-h-[300px] md:min-h-full">
            <img 
                src={herbImage} 
                alt={`Artistic representation of ${herbData.name}`}
                className="w-full h-full object-cover"
            />
        </div>
      </div>
    </div>
  );
};

export default HerbDisplay;