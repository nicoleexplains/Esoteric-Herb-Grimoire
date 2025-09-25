import React from 'react';
import Tooltip from './Tooltip';

interface ExampleHerbsProps {
  onExampleClick: (herb: string) => void;
}

const examples = ["Rosemary", "Mugwort", "Sage", "Yarrow", "Valerian"];

const ExampleHerbs: React.FC<ExampleHerbsProps> = ({ onExampleClick }) => {
  return (
    <div className="text-center animate-fade-in">
      <h3 className="text-lg text-gray-600 dark:text-gray-400 mb-4">Or try one of these:</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {examples.map((herb) => (
          <Tooltip key={herb} text={`Search for ${herb}`}>
            <button
              onClick={() => onExampleClick(herb)}
              className="bg-white/50 dark:bg-gray-700/50 hover:bg-gray-200/80 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-full shadow transition duration-300 transform hover:scale-105"
            >
              {herb}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default ExampleHerbs;