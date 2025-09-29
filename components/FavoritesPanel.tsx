import React, { useState, useMemo } from 'react';
import type { FavoriteHerb } from '../types';
import { BookIcon } from './icons/BookIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ExportIcon } from './icons/ExportIcon';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import Tooltip from './Tooltip';

interface FavoritesPanelProps {
  favorites: FavoriteHerb[];
  categories: string[];
  isOpen: boolean;
  onClose: () => void;
  onSelectFavorite: (herb: FavoriteHerb) => void;
  onRemoveFavorite: (herbName: string) => void;
  onClearFavorites: () => void;
  onExportFavorites: () => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onAssignCategory: (herbName: string, category: string) => void;
  onOpenManualAdd: () => void;
}

const CategoryHeader: React.FC<{
  categoryName: string;
  count: number;
  onDelete: () => void;
  onRename: (newName: string) => void;
}> = ({ categoryName, count, onDelete, onRename }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(categoryName);

    const handleRename = () => {
        if (name.trim() && name.trim() !== categoryName) {
            onRename(name.trim());
        }
        setIsEditing(false);
    };

    return (
        <div className="flex justify-between items-center w-full text-left">
            {isEditing ? (
                <div className="flex-grow flex items-center gap-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        onBlur={handleRename}
                        className="flex-grow bg-gray-200 dark:bg-gray-900/80 border border-purple-400 dark:border-purple-600 rounded-md py-1 px-2 text-sm"
                        autoFocus
                    />
                    <button onClick={handleRename} className="p-1 text-green-500 hover:text-green-400">
                        <CheckIcon className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div className="flex-grow flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <span className="font-bold">{categoryName}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({count})</span>
                </div>
            )}
            {!isEditing && categoryName !== 'Uncategorized' && (
                <div className="flex items-center">
                    <Tooltip text="Rename">
                        <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-purple-500 dark:hover:text-purple-300">
                            <EditIcon className="w-4 h-4" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Delete">
                        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
            )}
        </div>
    );
};

const FavoritesPanel: React.FC<FavoritesPanelProps> = (props) => {
  const { favorites, categories, isOpen, onClose, onSelectFavorite, onRemoveFavorite, onClearFavorites, onExportFavorites, onAddCategory, onDeleteCategory, onRenameCategory, onAssignCategory, onOpenManualAdd } = props;
  
  const [newCategory, setNewCategory] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };
  
  const categorizedFavorites = useMemo(() => {
    const grouped: Record<string, FavoriteHerb[]> = { 'Uncategorized': [] };
    categories.forEach(cat => grouped[cat] = []);

    favorites.forEach(herb => {
        if (herb.category && categories.includes(herb.category)) {
            grouped[herb.category].push(herb);
        } else {
            grouped['Uncategorized'].push(herb);
        }
    });

    return Object.entries(grouped).filter(([_, herbs]) => herbs.length > 0);
  }, [favorites, categories]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose} aria-hidden="true" />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" aria-modal="true" aria-labelledby="favorites-heading">
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="favorites-heading" className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <BookIcon className="w-6 h-6" /> My Grimoire
            </h2>
            <div className="flex items-center gap-2">
              <Tooltip text="Add New Herb">
                <button onClick={onOpenManualAdd} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Add new herb manually">
                  <PlusIcon className="w-6 h-6"/>
                </button>
              </Tooltip>
              <Tooltip text="Close">
                <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close panel">
                  <CloseIcon className="w-6 h-6" />
                </button>
              </Tooltip>
            </div>
          </header>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="e.g., Protection Spells" className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm" />
              <Tooltip text="Add Category">
                <button type="submit" className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"><PlusIcon className="w-5 h-5"/></button>
              </Tooltip>
            </form>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {favorites.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                <p>Your grimoire is empty.</p>
                <p className="text-sm mt-1">Add herbs by clicking the heart icon.</p>
              </div>
            ) : (
                categorizedFavorites.map(([categoryName, herbs]) => (
                    <div key={categoryName} className="bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                        <button onClick={() => toggleCategory(categoryName)} className="w-full flex justify-between items-center p-2 bg-gray-200/50 dark:bg-gray-800/60 rounded-t-lg">
                            <CategoryHeader 
                                categoryName={categoryName} 
                                count={herbs.length}
                                onDelete={() => onDeleteCategory(categoryName)}
                                onRename={(newName) => onRenameCategory(categoryName, newName)}
                            />
                             <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${collapsedCategories[categoryName] ? '' : 'rotate-180'}`} />
                        </button>
                        {!collapsedCategories[categoryName] && (
                             <div className="p-2 space-y-2">
                                {herbs.map(herb => (
                                    <div key={herb.name} className="flex items-center gap-2 p-2 rounded-lg group bg-white dark:bg-gray-800">
                                      <div className="flex-grow cursor-pointer flex items-center gap-2" onClick={() => onSelectFavorite(herb)}>
                                        <img src={herb.image} alt={herb.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                                        <div className="flex-grow">
                                          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-300">{herb.name}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">{herb.scientificName}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                         <select 
                                            value={herb.category || 'none'}
                                            onChange={(e) => onAssignCategory(herb.name, e.target.value)}
                                            onClick={(e) => e.stopPropagation()} // Prevent card click
                                            className="text-xs bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md py-1 pl-2 pr-6 appearance-none"
                                         >
                                            <option value="none">Uncategorized</option>
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                         </select>
                                        <Tooltip text="Remove">
                                          <button onClick={() => onRemoveFavorite(herb.name)} className="p-2 rounded-full text-gray-400 hover:text-red-500" aria-label={`Remove ${herb.name}`}>
                                            <TrashIcon className="w-4 h-4" />
                                          </button>
                                        </Tooltip>
                                      </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}
          </div>

          {favorites.length > 0 && (
            <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <Tooltip text="Export Grimoire as PDF">
                  <button onClick={onExportFavorites} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                      <ExportIcon className="w-5 h-5" /> Export
                  </button>
              </Tooltip>
              <button onClick={onClearFavorites} className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold">
                Clear All
              </button>
            </footer>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesPanel;