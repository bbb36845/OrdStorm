import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface WildCardPickerProps {
  isOpen: boolean;
  onSelect: (letter: string) => void;
  onCancel: () => void;
}

const DANISH_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z', 'Æ', 'Ø', 'Å'
];

const ENGLISH_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'
];

const WildCardPicker: React.FC<WildCardPickerProps> = ({ isOpen, onSelect, onCancel }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  if (!isOpen) return null;

  const alphabet = language === 'da' ? DANISH_ALPHABET : ENGLISH_ALPHABET;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white p-5 rounded-2xl shadow-2xl max-w-sm w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{t('wildcard.title')}</h2>
              <p className="text-xs text-gray-500">{t('wildcard.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {alphabet.map((letter) => (
              <motion.button
                key={letter}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(letter)}
                className="aspect-square rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100
                  hover:from-indigo-200 hover:to-purple-200
                  text-indigo-700 font-bold text-lg
                  shadow-sm hover:shadow-md transition-all
                  flex items-center justify-center"
              >
                {letter}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WildCardPicker;
