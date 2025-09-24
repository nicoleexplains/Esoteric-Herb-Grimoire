
import React from 'react';
import { LeafIcon } from './icons/LeafIcon';

const Loader: React.FC = () => {
  const messages = [
    "Consulting ancient texts...",
    "Gathering moonlight...",
    "Distilling arcane energies...",
    "Whispering to the woods...",
    "Scrying for visions...",
    "Polishing the crystal ball..."
  ];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prev => {
        const currentIndex = messages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center p-8 flex flex-col items-center justify-center">
      <LeafIcon className="w-16 h-16 text-green-400 animate-pulse" />
      <p className="mt-4 text-lg text-purple-300 font-semibold transition-opacity duration-500">{message}</p>
    </div>
  );
};

export default Loader;
