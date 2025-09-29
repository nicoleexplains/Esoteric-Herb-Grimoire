import React, { useState, useEffect } from 'react';
import type { Spell, FavoriteHerb } from '../types';
import { SpellbookIcon } from './icons/SpellbookIcon';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { BackIcon } from './icons/BackIcon'; // Assuming a BackIcon exists or is created
import Tooltip from './Tooltip';

interface SpellbookPanelProps {
  isOpen: boolean;
  onClose: () => void;
  spells: Spell[];
  favorites: FavoriteHerb[];
  onAddSpell: (spell: Omit<Spell, 'id'>) => void;
  onUpdateSpell: (spell: Spell) => void;
  onDeleteSpell: (spellId: string) => void;
}

const SpellForm: React.FC<{
    spell?: Spell | null;
    favorites: FavoriteHerb[];
    onSave: (spellData: Omit<Spell, 'id'> | Spell) => void;
    onCancel: () => void;
}> = ({ spell, favorites, onSave, onCancel }) => {
    const [name, setName] = useState(spell?.name || '');
    const [instructions, setInstructions] = useState(spell?.instructions || '');
    const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set(spell?.ingredients || []));

    useEffect(() => {
        // This effect synchronizes the form's state with the `spell` prop.
        // It runs when the component mounts and whenever the `spell` prop changes.
        // This ensures that when the user clicks "Edit", the form is populated with the correct data.
        if (spell) {
            setName(spell.name);
            setInstructions(spell.instructions);
            setSelectedIngredients(new Set(spell.ingredients));
        } else {
            // If there's no spell, it's a new entry, so reset the form.
            setName('');
            setInstructions('');
            setSelectedIngredients(new Set());
        }
    }, [spell]);

    const handleIngredientToggle = (herbName: string) => {
        setSelectedIngredients(prev => {
            const newSet = new Set(prev);
            if (newSet.has(herbName)) {
                newSet.delete(herbName);
            } else {
                newSet.add(herbName);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !instructions.trim() || selectedIngredients.size === 0) {
            alert('Please provide a name, instructions, and at least one ingredient.');
            return;
        }
        const spellData = {
            name: name.trim(),
            instructions: instructions.trim(),
            ingredients: Array.from(selectedIngredients),
        };
        if (spell) {
            onSave({ ...spell, ...spellData });
        } else {
            onSave(spellData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 flex flex-col h-full">
            <h3 className="text-lg font-bold mb-4">{spell ? 'Edit Spell' : 'Create New Spell'}</h3>
            <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                <div>
                    <label htmlFor="spell-name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Spell Name</label>
                    <input id="spell-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Ingredients</label>
                    <div className="max-h-32 overflow-y-auto bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 space-y-1">
                        {favorites.length > 0 ? favorites.map(herb => (
                            <label key={herb.name} className="flex items-center gap-2 text-sm p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                <input type="checkbox" checked={selectedIngredients.has(herb.name)} onChange={() => handleIngredientToggle(herb.name)} className="rounded text-purple-600 focus:ring-purple-500"/>
                                {herb.name}
                            </label>
                        )) : <p className="text-xs text-gray-500 dark:text-gray-400">Add herbs to your Grimoire to use them as ingredients.</p>}
                    </div>
                </div>
                <div>
                    <label htmlFor="spell-instructions" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Instructions</label>
                    <textarea id="spell-instructions" value={instructions} onChange={e => setInstructions(e.target.value)} required rows={8} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm" />
                </div>
            </div>
            <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                <button type="submit" className="bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">Save Spell</button>
            </div>
        </form>
    );
};


const SpellbookPanel: React.FC<SpellbookPanelProps> = (props) => {
    const { isOpen, onClose, spells, favorites, onAddSpell, onUpdateSpell, onDeleteSpell } = props;
    const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
    const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setView('list');
            setSelectedSpell(null);
        }
    }, [isOpen]);

    const handleSaveSpell = (spellData: Omit<Spell, 'id'> | Spell) => {
        if ('id' in spellData) {
            onUpdateSpell(spellData);
        } else {
            onAddSpell(spellData);
        }
        setView('list');
        setSelectedSpell(null);
    };

    const handleViewDetail = (spell: Spell) => {
        setSelectedSpell(spell);
        setView('detail');
    }

    const handleEdit = (spell: Spell) => {
        setSelectedSpell(spell);
        setView('form');
    }

    return (
        <>
            <div className={`fixed inset-0 bg-black/70 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} aria-hidden="true" />
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} role="dialog" aria-modal="true" aria-labelledby="spellbook-heading">
                <div className="flex flex-col h-full">
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            {view !== 'list' && (
                                <Tooltip text="Back to List">
                                    <button onClick={() => setView('list')} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                                      <BackIcon className="w-6 h-6" />
                                    </button>
                                </Tooltip>
                            )}
                             <h2 id="spellbook-heading" className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <SpellbookIcon className="w-6 h-6" /> My Spellbook
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {view === 'list' && (
                                <Tooltip text="Create New Spell">
                                    <button onClick={() => { setSelectedSpell(null); setView('form'); }} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <PlusIcon className="w-6 h-6" />
                                    </button>
                                </Tooltip>
                            )}
                            <Tooltip text="Close">
                                <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <CloseIcon className="w-6 h-6" />
                                </button>
                            </Tooltip>
                        </div>
                    </header>
                    
                    <div className="flex-grow overflow-y-auto">
                        {view === 'list' && (
                            <div className="p-4 space-y-2">
                                {spells.length === 0 ? (
                                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                                        <p>Your spellbook is empty.</p>
                                        <p className="text-sm mt-1">Click the '+' icon to create a new spell.</p>
                                    </div>
                                ) : (
                                    spells.map(spell => (
                                        <div key={spell.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900/50 flex justify-between items-center group">
                                            <button onClick={() => handleViewDetail(spell)} className="flex-grow text-left">
                                                <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-300">{spell.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{spell.ingredients.length} ingredient(s)</p>
                                            </button>
                                            <div className="flex items-center">
                                                <Tooltip text="Edit">
                                                    <button onClick={() => handleEdit(spell)} className="p-2 rounded-full text-gray-400 hover:text-purple-500 dark:hover:text-purple-300">
                                                        <EditIcon className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip text="Delete">
                                                    <button onClick={() => onDeleteSpell(spell.id)} className="p-2 rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        {view === 'form' && <SpellForm spell={selectedSpell} favorites={favorites} onSave={handleSaveSpell} onCancel={() => setView('list')} />}
                        {view === 'detail' && selectedSpell && (
                            <div className="p-4 space-y-4">
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-purple-600 dark:from-green-300 dark:to-purple-400">{selectedSpell.name}</h3>
                                <div>
                                    <h4 className="font-bold text-purple-700 dark:text-purple-300 uppercase text-sm tracking-wider">Ingredients</h4>
                                    <ul className="list-disc list-inside mt-1 text-gray-700 dark:text-gray-300">
                                        {selectedSpell.ingredients.map(ing => <li key={ing}>{ing}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-purple-700 dark:text-purple-300 uppercase text-sm tracking-wider">Instructions</h4>
                                    <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">{selectedSpell.instructions}</p>
                                </div>
                                <button onClick={() => handleEdit(selectedSpell)} className="mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 transition-colors w-full">Edit Spell</button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default SpellbookPanel;