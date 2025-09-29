import React, { useState } from 'react';
import type { HerbInfo } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import Tooltip from './Tooltip';

interface ManualAddHerbFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHerb: (herbData: HerbInfo) => Promise<void>;
}

const initialFormData = {
  name: '',
  scientificName: '',
  magicalProperties: '',
  elementalAssociation: '',
  planetaryAssociation: '',
  deityAssociation: '',
  lore: '',
  usage: '',
  herbalOilLore: '',
  herbalOilUsage: '',
};

const FormField: React.FC<{ label: string; id: string; required?: boolean; children: React.ReactNode; description?: string }> = ({ label, id, required, children, description }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
    </div>
);

const ManualAddHerbForm: React.FC<ManualAddHerbFormProps> = ({ isOpen, onClose, onAddHerb }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiredFields = ['name', 'scientificName', 'magicalProperties', 'elementalAssociation', 'planetaryAssociation', 'lore', 'usage'];
    if (requiredFields.some(field => !(formData as any)[field].trim())) {
      alert('Please fill out all required fields.');
      setIsSubmitting(false);
      return;
    }

    const newHerbData: HerbInfo = {
      name: formData.name.trim(),
      scientificName: formData.scientificName.trim(),
      magicalProperties: formData.magicalProperties.split(',').map(p => p.trim()).filter(Boolean),
      elementalAssociation: formData.elementalAssociation.trim(),
      planetaryAssociation: formData.planetaryAssociation.trim(),
      deityAssociation: formData.deityAssociation.split(',').map(d => d.trim()).filter(Boolean),
      lore: formData.lore.trim(),
      usage: formData.usage.trim(),
      herbalOil: (formData.herbalOilLore.trim() || formData.herbalOilUsage.trim())
        ? {
          lore: formData.herbalOilLore.trim(),
          usage: formData.herbalOilUsage.trim(),
        }
        : undefined,
    };

    try {
      await onAddHerb(newHerbData);
      setFormData(initialFormData); // Reset form for next time
    } catch (error) {
      console.error("Submission failed:", error);
      // Error is handled by parent component's state
    } finally {
      // The parent component handles the loading state and closes this modal,
      // so we don't need to set isSubmitting back to false here.
    }
  };
  
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="manual-add-heading" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh]">
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10">
            <h2 id="manual-add-heading" className="text-xl font-bold text-gray-800 dark:text-gray-200">Add a New Herb</h2>
            <Tooltip text="Close">
              <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close form">
                <CloseIcon className="w-6 h-6" />
              </button>
            </Tooltip>
          </header>
          
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Common Name" id="name" required>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3" />
                </FormField>
                <FormField label="Scientific Name" id="scientificName" required>
                    <input type="text" name="scientificName" id="scientificName" value={formData.scientificName} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3" />
                </FormField>
            </div>

            <FormField label="Magical Properties" id="magicalProperties" required description="Comma-separated (e.g., Protection, Love)">
                <input type="text" name="magicalProperties" id="magicalProperties" value={formData.magicalProperties} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3" />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Elemental Association" id="elementalAssociation" required>
                    <input type="text" name="elementalAssociation" id="elementalAssociation" value={formData.elementalAssociation} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3" />
                </FormField>
                <FormField label="Planetary Association" id="planetaryAssociation" required>
                    <input type="text" name="planetaryAssociation" id="planetaryAssociation" value={formData.planetaryAssociation} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3" />
                </FormField>
            </div>
            
            <FormField label="Deity Associations" id="deityAssociation" description="Optional, comma-separated">
                <input type="text" name="deityAssociation" id="deityAssociation" value={formData.deityAssociation} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3" />
            </FormField>

            <FormField label="Arcane Lore" id="lore" required>
                <textarea name="lore" id="lore" value={formData.lore} onChange={handleChange} rows={4} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3"></textarea>
            </FormField>

             <FormField label="Ritual Usage" id="usage" required>
                <textarea name="usage" id="usage" value={formData.usage} onChange={handleChange} rows={4} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3"></textarea>
            </FormField>
            
            <fieldset className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <legend className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2">Esoteric Oil (Optional)</legend>
              <div className="space-y-4">
                <FormField label="Oil Lore" id="herbalOilLore">
                  <textarea name="herbalOilLore" id="herbalOilLore" value={formData.herbalOilLore} onChange={handleChange} rows={3} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3"></textarea>
                </FormField>
                <FormField label="Oil Usage" id="herbalOilUsage">
                  <textarea name="herbalOilUsage" id="herbalOilUsage" value={formData.herbalOilUsage} onChange={handleChange} rows={3} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3"></textarea>
                </FormField>
              </div>
            </fieldset>

          </form>

          <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-md transition duration-300"
            >
              {isSubmitting ? 'Adding...' : 'Add to Grimoire'}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default ManualAddHerbForm;