import React, { useState, useEffect } from 'react';
import { getHerbInfo, generateHerbImage } from './services/geminiService';
import { generatePdfReport } from './services/reportService';
import type { HerbInfo, FavoriteHerb } from './types';
import SearchBar from './components/SearchBar';
import HerbDisplay from './components/HerbDisplay';
import Loader from './components/Loader';
import ExampleHerbs from './components/ExampleHerbs';
import FavoritesPanel from './components/FavoritesPanel';
import AboutPage from './components/AboutPage';
import SearchHistory from './components/SearchHistory';
import ThemeToggle from './components/ThemeToggle';
import { BookIcon } from './components/icons/BookIcon';
import { InfoIcon } from './components/icons/InfoIcon';
import Tooltip from './components/Tooltip';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [herbData, setHerbData] = useState<HerbInfo | null>(null);
  const [herbImage, setHerbImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteHerb[]>(() => {
    try {
        const saved = localStorage.getItem('grimoire-favorites');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
        return [];
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('grimoire-categories');
      return saved ? JSON.parse(saved) : ['Healing', 'Protection', 'Divination'];
    } catch (e) {
      console.error("Failed to parse categories from localStorage", e);
      return ['Healing', 'Protection', 'Divination'];
    }
  });

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem('grimoire-history');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to parse history from localStorage", e);
        return [];
    }
  });

  const [isFavoritesPanelOpen, setIsFavoritesPanelOpen] = useState<boolean>(false);
  const [isAboutPageOpen, setIsAboutPageOpen] = useState<boolean>(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('grimoire-favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  useEffect(() => {
    localStorage.setItem('grimoire-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('grimoire-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const updateSearchHistory = (query: string) => {
    setSearchHistory(prev => {
      const lowerCaseQuery = query.toLowerCase();
      const newHistory = [query, ...prev.filter(item => item.toLowerCase() !== lowerCaseQuery)];
      return newHistory.slice(0, 10); // Keep last 10
    });
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setHerbData(null);
    setHerbImage(null);
    updateSearchHistory(query);

    try {
      const infoPromise = getHerbInfo(query);
      const imagePromise = generateHerbImage(query);

      const [info, imageUrl] = await Promise.all([infoPromise, imagePromise]);
      
      setHerbData(info);
      setHerbImage(imageUrl);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = herbData ? favorites.some(fav => fav.name.toLowerCase() === herbData.name.toLowerCase()) : false;

  const toggleFavorite = () => {
    if (!herbData || !herbImage) return;

    if (isFavorite) {
      setFavorites(prev => prev.filter(fav => fav.name.toLowerCase() !== herbData.name.toLowerCase()));
    } else {
      setFavorites(prev => [{ ...herbData, image: herbImage, category: undefined }, ...prev]);
    }
  };
  
  const handleSelectFavorite = (herb: FavoriteHerb) => {
      setHerbData(herb);
      setHerbImage(herb.image);
      setIsFavoritesPanelOpen(false);
      setError(null);
      setIsLoading(false);
  };

  const handleRemoveFavorite = (herbName: string) => {
    setFavorites(prev => prev.filter(fav => fav.name !== herbName));
  };
  
  const handleClearFavorites = () => {
      if (window.confirm("Are you sure you want to clear your entire Grimoire? This cannot be undone.")) {
        setFavorites([]);
      }
  };

  const handleExportFavorites = async () => {
    if (isExporting) return;
    if (favorites.length === 0) {
      alert("Your grimoire is empty. Add some herbs to export.");
      return;
    }
    setIsExporting(true);
    try {
      await generatePdfReport(favorites, categories);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };
  
  const handleAddCategory = (categoryName: string) => {
    const trimmedName = categoryName.trim();
    if (trimmedName && !categories.find(c => c.toLowerCase() === trimmedName.toLowerCase())) {
        setCategories(prev => [...prev, trimmedName]);
    } else {
        alert("Category name cannot be empty or already exist.");
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
      if (window.confirm(`Are you sure you want to delete the "${categoryName}" category? Herbs in this category will become uncategorized.`)) {
          setCategories(prev => prev.filter(c => c !== categoryName));
          setFavorites(prev => prev.map(f => f.category === categoryName ? { ...f, category: undefined } : f));
      }
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
      const trimmedNewName = newName.trim();
      if (!trimmedNewName || (trimmedNewName.toLowerCase() !== oldName.toLowerCase() && categories.find(c => c.toLowerCase() === trimmedNewName.toLowerCase()))) {
          alert("Category name cannot be empty or already exist.");
          return;
      }
      setCategories(prev => prev.map(c => c === oldName ? trimmedNewName : c));
      setFavorites(prev => prev.map(f => f.category === oldName ? { ...f, category: trimmedNewName } : f));
  };

  const handleAssignCategory = (herbName: string, category: string) => {
      setFavorites(prev => prev.map(f => f.name === herbName ? { ...f, category: category === 'none' ? undefined : category } : f));
  };

  const handleGoHome = () => {
    setHerbData(null);
    setHerbImage(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-20 dark:opacity-5"></div>
      
      <header className="relative z-20 p-4 grid grid-cols-3 items-center w-full">
        <div className="w-full">
            {/* Left Spacer */}
        </div>
        <div className="w-full text-center">
            <Tooltip text="Go to Home Screen">
                <button onClick={handleGoHome} className="focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-lg -m-2 p-2 transition">
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-purple-600 dark:from-green-300 dark:to-purple-400 tracking-wide">
                        Esoteric Herb Grimoire
                    </h1>
                </button>
            </Tooltip>
        </div>
        <div className="w-full flex items-center justify-end gap-2">
            <Tooltip text="My Grimoire">
                <button onClick={() => setIsFavoritesPanelOpen(true)} className="p-3 rounded-full bg-black/10 dark:bg-gray-800/50 hover:bg-black/20 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 transition-colors" aria-label="Open favorites">
                    <BookIcon className="w-7 h-7" />
                </button>
            </Tooltip>
            <Tooltip text="About">
                <button onClick={() => setIsAboutPageOpen(true)} className="p-3 rounded-full bg-black/10 dark:bg-gray-800/50 hover:bg-black/20 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 transition-colors" aria-label="Open about page">
                    <InfoIcon className="w-7 h-7" />
                </button>
            </Tooltip>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">Unveil the hidden magic of the botanical world. Enter a plant's name to consult the grimoire.</p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        <SearchHistory history={searchHistory} onHistoryClick={handleSearch} onClearHistory={handleClearHistory} />

        <div className="mt-12">
          {isLoading && <Loader />}
          {error && <div className="text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg max-w-lg mx-auto">{error}</div>}
          {herbData && herbImage && !isLoading && (
            <HerbDisplay 
                herbData={herbData} 
                herbImage={herbImage} 
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
            />
          )}
          {!herbData && !isLoading && !error && <ExampleHerbs onExampleClick={handleSearch} />}
        </div>
      </main>

      <AboutPage isOpen={isAboutPageOpen} onClose={() => setIsAboutPageOpen(false)} />
      <FavoritesPanel 
        isOpen={isFavoritesPanelOpen}
        onClose={() => setIsFavoritesPanelOpen(false)}
        favorites={favorites}
        categories={categories}
        onSelectFavorite={handleSelectFavorite}
        onRemoveFavorite={handleRemoveFavorite}
        onClearFavorites={handleClearFavorites}
        onExportFavorites={handleExportFavorites}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onRenameCategory={handleRenameCategory}
        onAssignCategory={handleAssignCategory}
      />
    </div>
  );
}

export default App;