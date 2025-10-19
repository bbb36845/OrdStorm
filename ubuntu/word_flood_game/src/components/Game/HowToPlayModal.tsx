import React from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-sky-700">Sådan Spiller Du Ordflom</h2>
        <div className="space-y-2 text-gray-700">
          <p><strong>Formål:</strong> Dan ord før spillebrættet fyldes helt op!</p>
          <p><strong>Regler:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Klik på bogstaver for at danne ord (minimum 3 bogstaver).</li>
            <li>Indsend gyldige ord for at fjerne bogstaverne fra brættet og score point.</li>
            <li>Nye bogstaver vil med tiden fylde brættet op nedefra.</li>
            <li>Spillet slutter, når brættet er helt fyldt op.</li>
            <li>Længere ord giver flere point!</li>
          </ul>
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Fokuser på at fjerne længere ord for at opnå højere scores.</li>
            <li>Hold øje med tomme pladser – de fyldes hurtigt op!</li>
            <li>Log ind for at gemme dine highscores (funktion på vej!).</li>
          </ul>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Luk
        </button>
      </div>
    </div>
  );
};

export default HowToPlayModal;

