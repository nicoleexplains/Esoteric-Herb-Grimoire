import React, { useState, useCallback, useEffect } from 'react';
import type { HerbInfo, FavoriteHerb } from './types';
import { getHerbInfo, generateHerbImage } from './services/geminiService';
import SearchBar from './components/SearchBar';
import HerbDisplay from './components/HerbDisplay';
import Loader from './components/Loader';
import ExampleHerbs from './components/ExampleHerbs';
import FavoritesPanel from './components/FavoritesPanel';
import { LeafIcon } from './components/icons/LeafIcon';
import { BookIcon } from './components/icons/BookIcon';

const App: React.FC = () => {
  const [herbData, setHerbData] = useState<HerbInfo | null>(null);
  const [herbImage, setHerbImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteHerb[]>([]);
  const [isFavoritesPanelOpen, setIsFavoritesPanelOpen] = useState<boolean>(false);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('esoteric-herb-favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage:", error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('esoteric-herb-favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites to localStorage:", error);
    }
  }, [favorites]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query || isLoading) return;

    setIsLoading(true);
    setError(null);
    setHerbData(null);
    setHerbImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

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

  const toggleFavorite = () => {
    if (!herbData || !herbImage) return;

    const isFavorite = favorites.some(fav => fav.name.toLowerCase() === herbData.name.toLowerCase());

    if (isFavorite) {
      setFavorites(prev => prev.filter(fav => fav.name.toLowerCase() !== herbData.name.toLowerCase()));
    } else {
      const newFavorite: FavoriteHerb = { ...herbData, herbImage };
      setFavorites(prev => [...prev, newFavorite]);
    }
  };

  const removeFavorite = (herbNameToRemove: string) => {
    setFavorites(prev => prev.filter(fav => fav.name.toLowerCase() !== herbNameToRemove.toLowerCase()));
  };
  
  const showFavorite = (favorite: FavoriteHerb) => {
    setHerbData(favorite);
    setHerbImage(favorite.herbImage);
    setIsFavoritesPanelOpen(false);
    setError(null);
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const isCurrentHerbFavorite = herbData ? favorites.some(fav => fav.name.toLowerCase() === herbData.name.toLowerCase()) : false;

  return (
    <div className="min-h-screen bg-gray-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <header className="relative text-center mb-10">
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
          <button
            onClick={() => setIsFavoritesPanelOpen(true)}
            className="absolute top-0 right-0 flex items-center gap-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-2 px-4 border border-gray-600 rounded-full shadow transition duration-300 transform hover:scale-105"
            aria-label="Open my grimoire"
          >
            <BookIcon className="w-5 h-5" />
            <span className="hidden md:inline">My Grimoire</span>
            {favorites.length > 0 && (
                <span className="bg-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{favorites.length}</span>
            )}
          </button>
        </header>

        <main>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          
          <div className="mt-12">
            {isLoading && <Loader />}
            {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>}
            
            {!isLoading && !error && !herbData && <ExampleHerbs onExampleClick={handleSearch} />}
            
            {herbData && herbImage && (
              <div className="animate-fade-in">
                <HerbDisplay 
                  herbData={herbData} 
                  herbImage={herbImage}
                  isFavorite={isCurrentHerbFavorite}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            )}
          </div>
        </main>
        
        <footer className="text-center mt-16 text-gray-500 text-sm">
            <p>Powered by Gemini. Information is for esoteric and entertainment purposes only.</p>
        </footer>
      </div>

      <FavoritesPanel 
        isOpen={isFavoritesPanelOpen}
        favorites={favorites}
        onSelect={showFavorite}
        onRemove={removeFavorite}
        onClose={() => setIsFavoritesPanelOpen(false)}
      />
    </div>
  );
};

export default App;
