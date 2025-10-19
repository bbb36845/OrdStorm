import React from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full text-sm sm:text-base">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-sky-700">Sådan Spiller Du OrdStorm</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>Formål:</strong> Dan så mange pointgivende ord som muligt, før spillebrættet fyldes helt op!</p>
          
          <p className="font-semibold">Spillets Gang:</p>
          <ul className="list-disc list-inside ml-4 space-y-1.5">
            <li>Klik på bogstaver på brættet for at danne ord. Ord skal være på mindst 3 bogstaver.</li>
            <li>Når du har dannet et ord, klik på "Indsend Ord".</li>
            <li>Gyldige danske ord giver point og fjerner de brugte bogstaver fra brættet.</li>
            <li>Nye bogstaver dukker løbende op på tomme felter.</li>
            <li>Spillet slutter, når brættet er helt fyldt med bogstaver.</li>
          </ul>

          <p className="font-semibold mt-2">Pointsystem:</p>
          <ul className="list-disc list-inside ml-4 space-y-1.5">
            <li>Point gives baseret på ordets længde. Længere ord giver flere point.</li>
            <li><strong>Bonusbogstaver:</strong> Hold øje med <span class="font-bold text-amber-500">gyldne bonusbogstaver</span>! Hvis et bonusbogstav bruges i et gyldigt, indsendt ord, fordobles pointene for <span class="italic">hele det ord</span> (2x).</li>
          </ul>

          <p className="font-semibold mt-2">Tips til Høj Score:</p>
          <ul className="list-disc list-inside ml-4 space-y-1.5">
            <li>Prøv at danne lange ord for at få flest point.</li>
            <li>Udnyt <span class="font-bold text-amber-500">bonusbogstaverne</span> strategisk for at maksimere din score.</li>
            <li>Log ind for at gemme dine highscores og se din placering på "Dagens Bedste" og "All Time Bedste" leaderboards!</li>
            <li>Spillet fortsætter, så længe der er tomme felter – tænk hurtigt!</li>
          </ul>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-base"
        >
          Forstået, luk!
        </button>
      </div>
    </div>
  );
};

export default HowToPlayModal;

