
import React, { useState, useCallback } from 'react';
import type { HerbInfo } from './types';
import { getHerbInfo, generateHerbImage } from './services/geminiService';
import SearchBar from './components/SearchBar';
import HerbDisplay from './components/HerbDisplay';
import Loader from './components/Loader';
import ExampleHerbs from './components/ExampleHerbs';
import { LeafIcon } from './components/icons/LeafIcon';

const App: React.FC = () => {
  const [herbData, setHerbData] = useState<HerbInfo | null>(null);
  const [herbImage, setHerbImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query || isLoading) return;

    setIsLoading(true);
    setError(null);
    setHerbData(null);
    setHerbImage(null);

    try {
      const [infoResult, imageResult] = await Promise.all([
        getHerbInfo(query),
        generateHerbImage(query)
      ]);
      
      setHerbData(infoResult);
      setHerbImage(imageResult);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-gray-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <header className="text-center mb-10">
          <div className="flex justify-center items-center gap-4 mb-4">
            <LeafIcon className="w-12 h-12 text-green-300" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-purple-400">
              Esoteric Herb Grimoire
            </h1>
            <LeafIcon className="w-12 h-12 text-purple-300" />
          </div>
          <p className="text-lg text-gray-400">
            Uncover the magical properties and arcane lore of plants.
          </p>
        </header>

        <main>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          
          <div className="mt-12">
            {isLoading && <Loader />}
            {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>}
            
            {!isLoading && !error && !herbData && <ExampleHerbs onExampleClick={handleSearch} />}
            
            {herbData && herbImage && (
              <div className="animate-fade-in">
                <HerbDisplay herbData={herbData} herbImage={herbImage} />
              </div>
            )}
          </div>
        </main>
        
        <footer className="text-center mt-16 text-gray-500 text-sm">
            <p>Powered by Gemini. Information is for esoteric and entertainment purposes only.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
