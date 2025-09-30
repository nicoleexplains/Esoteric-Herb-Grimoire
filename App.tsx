import React, { useState, useEffect, useMemo } from 'react';
import { getHerbInfo, generateHerbImage } from './services/geminiService';
import { generatePdfReport, generateSingleHerbPdf } from './services/reportService';
import type { HerbInfo, FavoriteHerb, Spell } from './types';
import SearchBar from './components/SearchBar';
import HerbDisplay from './components/HerbDisplay';
import Loader from './components/Loader';
import ExampleHerbs from './components/ExampleHerbs';
import FavoritesPanel from './components/FavoritesPanel';
import AboutPage from './components/AboutPage';
import SearchHistory from './components/SearchHistory';
import ThemeToggle from './components/ThemeToggle';
import ManualAddHerbForm from './components/ManualAddHerbForm';
import { BookIcon } from './components/icons/BookIcon';
import { InfoIcon } from './components/icons/InfoIcon';
import { SpellbookIcon } from './components/icons/SpellbookIcon';
import SpellbookPanel from './components/SpellbookPanel';
import Tooltip from './components/Tooltip';

export type Theme = 'light' | 'dark' | 'system';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [herbData, setHerbData] = useState<HerbInfo | null>(null);
  const [herbImage, setHerbImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSingleExporting, setIsSingleExporting] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteHerb[]>(() => {
    try {
        const saved = localStorage.getItem('grimoire-favorites');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
        return [];
    }
  });

  const [spells, setSpells] = useState<Spell[]>(() => {
    try {
      const saved = localStorage.getItem('grimoire-spells');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse spells from localStorage", e);
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
  const [isSpellbookOpen, setIsSpellbookOpen] = useState<boolean>(false);
  const [isAboutPageOpen, setIsAboutPageOpen] = useState<boolean>(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState<boolean>(false);

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('grimoire-theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      return savedTheme;
    }
    return 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('grimoire-theme') || 'system';
    if (savedTheme === 'light') return 'light';
    if (savedTheme === 'dark') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('grimoire-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('grimoire-spells', JSON.stringify(spells));
  }, [spells]);
  
  useEffect(() => {
    localStorage.setItem('grimoire-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('grimoire-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('grimoire-theme', theme);
    const root = window.document.documentElement;

    if (theme === 'light') {
      root.classList.remove('dark');
      setEffectiveTheme('light');
    } else if (theme === 'dark') {
      root.classList.add('dark');
      setEffectiveTheme('dark');
    } else { // theme is 'system'
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (mediaQuery.matches) {
          root.classList.add('dark');
          setEffectiveTheme('dark');
        } else {
          root.classList.remove('dark');
          setEffectiveTheme('light');
        }
      };
      handleChange(); // Apply initial system theme
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

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
  
  const handleDownloadImage = (image: string, name: string) => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `${name.replace(/\s+/g, '_').toLowerCase()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualAddHerb = async (newHerbData: HerbInfo) => {
    setIsManualAddOpen(false);
    setIsLoading(true);
    setError(null);
    setHerbData(null);
    setHerbImage(null);
    
    try {
      if (favorites.some(fav => fav.name.toLowerCase() === newHerbData.name.toLowerCase())) {
        throw new Error(`The herb "${newHerbData.name}" already exists in your Grimoire.`);
      }
      
      const imageUrl = await generateHerbImage(newHerbData.name);
      
      const newFavorite: FavoriteHerb = {
        ...newHerbData,
        image: imageUrl,
      };
      
      setFavorites(prev => [newFavorite, ...prev]);
      setIsFavoritesPanelOpen(true);

    } catch (e: any) {
      setError(e.message || 'An unknown error occurred while adding the herb.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = useMemo(() => {
    if (!herbData) return false;
    return favorites.some(fav => fav.name.toLowerCase() === herbData.name.toLowerCase());
  }, [herbData, favorites]);

  const toggleFavorite = () => {
    if (!herbData || !herbImage) return;

    if (isFavorite) {
      setFavorites(prev => prev.filter(fav => fav.name.toLowerCase() !== herbData.name.toLowerCase()));
    } else {
      const newFavorite: FavoriteHerb = {
        ...herbData,
        image: herbImage,
      };
      setFavorites(prev => [newFavorite, ...prev]);
    }
  };
  
  const handleSelectFavorite = (herb: FavoriteHerb) => {
      const { image, category, ...baseHerbInfo } = herb;
      setHerbData(baseHerbInfo);
      setHerbImage(image);
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

  const handleExportSingleHerb = async () => {
    if (!herbData || !herbImage || isSingleExporting) return;
    setIsSingleExporting(true);
    try {
      const herbToExport: FavoriteHerb = { ...herbData, image: herbImage };
      const associatedSpellsForHerb = spells.filter(spell => 
        spell.ingredients.some(ing => ing.toLowerCase() === herbData.name.toLowerCase())
      );
      await generateSingleHerbPdf(herbToExport, associatedSpellsForHerb);
    } catch (err) {
      console.error("Failed to generate single herb PDF:", err);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setIsSingleExporting(false);
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

  const handleAddSpell = (spell: Omit<Spell, 'id'>) => {
    const newSpell = { ...spell, id: Date.now().toString() };
    setSpells(prev => [newSpell, ...prev]);
  };

  const handleUpdateSpell = (updatedSpell: Spell) => {
    setSpells(prev => prev.map(s => s.id === updatedSpell.id ? updatedSpell : s));
  };

  const handleDeleteSpell = (spellId: string) => {
    if (window.confirm("Are you sure you want to delete this spell?")) {
      setSpells(prev => prev.filter(s => s.id !== spellId));
    }
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
            <Tooltip text="My Spellbook">
                <button onClick={() => setIsSpellbookOpen(true)} className="p-3 rounded-full bg-black/10 dark:bg-gray-800/50 hover:bg-black/20 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 transition-colors" aria-label="Open spellbook">
                    <SpellbookIcon className="w-7 h-7" />
                </button>
            </Tooltip>
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
            <ThemeToggle theme={theme} effectiveTheme={effectiveTheme} setTheme={setTheme} />
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
                spells={spells}
                onToggleFavorite={toggleFavorite}
                onExport={handleExportSingleHerb}
                isExporting={isSingleExporting}
                onDownloadImage={handleDownloadImage}
            />
          )}
          {!herbData && !isLoading && !error && <ExampleHerbs onExampleClick={handleSearch} />}
        </div>
      </main>

      <AboutPage isOpen={isAboutPageOpen} onClose={() => setIsAboutPageOpen(false)} />
      <SpellbookPanel
        isOpen={isSpellbookOpen}
        onClose={() => setIsSpellbookOpen(false)}
        spells={spells}
        favorites={favorites}
        onAddSpell={handleAddSpell}
        onUpdateSpell={handleUpdateSpell}
        onDeleteSpell={handleDeleteSpell}
      />
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
        onOpenManualAdd={() => setIsManualAddOpen(true)}
      />
      <ManualAddHerbForm 
        isOpen={isManualAddOpen}
        onClose={() => setIsManualAddOpen(false)}
        onAddHerb={handleManualAddHerb}
      />
    </div>
  );
}

export default App;