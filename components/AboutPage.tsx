import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import Tooltip from './Tooltip';

interface AboutPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-50 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-heading"
      >
        <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl shadow-purple-900/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10">
            <h2 id="about-heading" className="text-xl font-bold text-gray-800 dark:text-gray-200">
              About the Grimoire
            </h2>
            <Tooltip text="Close">
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors"
                aria-label="Close about page"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </Tooltip>
          </header>
          <div className="p-6 md:p-8 text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
            <section>
              <h3 className="text-lg font-bold text-purple-600 dark:text-purple-300 mb-2">Purpose</h3>
              <p>
                The Esoteric Herb Grimoire is a digital companion for modern mystics, herbalists, and the curious. It serves as a portal to uncover the rich tapestry of magical lore, elemental associations, and ritualistic uses of plants and herbs from around the world.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-bold text-purple-600 dark:text-purple-300 mb-2">Technology</h3>
              <p>
                This application is brought to life by the power of Google's Gemini API. The detailed esoteric information and the mystical, artistic imagery for each plant are generated in real-time by advanced AI models. This allows for a dynamic and ever-expanding grimoire that learns and creates as you explore.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-bold text-purple-600 dark:text-purple-300 mb-2">Disclaimer</h3>
              <p>
                The information provided within this grimoire is intended for esoteric study, folklore exploration, and entertainment purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;