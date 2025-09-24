
import React from 'react';

interface ExampleHerbsProps {
  onExampleClick: (herb: string) => void;
}

const examples = ["Rosemary", "Mugwort", "Sage", "Yarrow", "Valerian"];

const ExampleHerbs: React.FC<ExampleHerbsProps> = ({ onExampleClick }) => {
  return (
    <div className="text-center animate-fade-in">
      <h3 className="text-lg text-gray-400 mb-4">Or try one of these:</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {examples.map((herb) => (
          <button
            key={herb}
            onClick={() => onExampleClick(herb)}
            className="bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-2 px-4 border border-gray-600 rounded-full shadow transition duration-300 transform hover:scale-105"
          >
            {herb}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExampleHerbs;
