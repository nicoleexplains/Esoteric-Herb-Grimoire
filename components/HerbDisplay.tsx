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
  <div className="mb-4">
    <h3 className="text-sm font-bold uppercase tracking-widest text-purple-300 mb-2">{title}</h3>
    <div className="text-gray-300">{children}</div>
  </div>
);

const HerbDisplay: React.FC<HerbDisplayProps> = ({ herbData, herbImage, isFavorite, onToggleFavorite }) => {
  return (
    <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl shadow-purple-900/20 overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <Tooltip text={isFavorite ? 'Remove from Grimoire' : 'Add to Grimoire'}>
          <button
            onClick={onToggleFavorite}
            className="p-2 rounded-full bg-gray-900/50 text-gray-300 hover:text-red-400 transition-all duration-200 transform hover:scale-110"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon className={`w-6 h-6 ${isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none'}`} />
          </button>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 md:p-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-purple-400 mb-1">{herbData.name}</h2>
          <p className="text-lg italic text-gray-400 mb-6">{herbData.scientificName}</p>

          <InfoSection title="Magical Properties">
            <div className="flex flex-wrap gap-2">
              {herbData.magicalProperties.map((prop) => (
                <span key={prop} className="bg-green-800/50 text-green-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {prop}
                </span>
              ))}
            </div>
          </InfoSection>

          <InfoSection title="Associations">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong className="text-gray-400">Element:</strong> {herbData.elementalAssociation}</p>
                <p><strong className="text-gray-400">Planet:</strong> {herbData.planetaryAssociation}</p>
            </div>
            {herbData.deityAssociation && herbData.deityAssociation.length > 0 &&
                <p className="mt-2"><strong className="text-gray-400">Deities:</strong> {herbData.deityAssociation.join(', ')}</p>
            }
          </InfoSection>

          <InfoSection title="Arcane Lore">
            <p className="leading-relaxed">{herbData.lore}</p>
          </InfoSection>

          <InfoSection title="Ritual Usage">
            <p className="leading-relaxed">{herbData.usage}</p>
          </InfoSection>
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