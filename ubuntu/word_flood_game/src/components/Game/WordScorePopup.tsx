import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WordScorePopupProps {
  score: number | null;
  word: string | null;
  bonusInfo?: {
    streak?: number;
    tykkeBonusActive?: boolean;
  };
}

const WordScorePopup: React.FC<WordScorePopupProps> = ({ score, word, bonusInfo }) => {
  if (score === null || word === null) return null;

  const hasStreak = bonusInfo?.streak && bonusInfo.streak >= 3;
  const hasTykkeBonus = bonusInfo?.tykkeBonusActive;

  return (
    <AnimatePresence>
      {score !== null && (
        <motion.div
          key={`${word}-${score}-${Date.now()}`}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{
            duration: 0.3,
            exit: { duration: 0.5 }
          }}
          className="fixed left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          style={{ top: '35%' }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Main score */}
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.4 }}
              className={`text-4xl sm:text-5xl font-black ${
                hasTykkeBonus
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400'
                  : hasStreak
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500'
              }`}
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                WebkitTextStroke: '1px rgba(255,255,255,0.3)'
              }}
            >
              +{score}
            </motion.div>

            {/* Bonus indicators */}
            <div className="flex items-center gap-2 mt-1">
              {hasTykkeBonus && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-lg"
                >
                  3x BONUS
                </motion.span>
              )}
              {hasStreak && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg"
                >
                  {bonusInfo.streak}x STREAK
                </motion.span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WordScorePopup;
