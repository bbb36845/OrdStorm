import React from 'react';
import { Board, Letter } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface GameBoardProps {
  board: Board;
  onLetterClick: (letter: Letter) => void;
  currentWord: Letter[];
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onLetterClick, currentWord }) => {
  const isSelected = (letterId: string) => {
    return currentWord.some(l => l.id === letterId);
  };

  // Get selection order for visual feedback
  const getSelectionOrder = (letterId: string) => {
    return currentWord.findIndex(l => l.id === letterId) + 1;
  };

  return (
    <div className="game-board grid grid-cols-6 gap-2 sm:gap-2.5 p-3 sm:p-4 rounded-2xl select-none">
      <AnimatePresence mode="popLayout">
        {board.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const cellKey = `cell-${rowIndex}-${colIndex}`;
            const selected = letter ? isSelected(letter.id) : false;
            const selectionOrder = letter ? getSelectionOrder(letter.id) : 0;

            return (
              <motion.div
                key={letter ? letter.id : cellKey}
                initial={letter ? { opacity: 0, scale: 0.3 } : { opacity: 0.5 }}
                animate={letter ? {
                  opacity: 1,
                  scale: selected ? 1.05 : 1,
                  y: selected ? -3 : 0,
                } : { opacity: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                whileHover={letter ? { scale: 1.03 } : {}}
                whileTap={letter ? { scale: 0.97 } : {}}
                onClick={() => letter && onLetterClick(letter)}
                className={`
                  aspect-square rounded-xl flex items-center justify-center
                  text-xl sm:text-2xl font-bold uppercase cursor-pointer
                  relative overflow-hidden
                  ${letter
                    ? selected
                      ? letter.isBonus
                        ? 'letter-tile-selected letter-tile-bonus text-white selected-pulse'
                        : 'letter-tile-selected text-white selected-pulse'
                      : letter.isBonus
                        ? 'letter-tile-bonus text-white bonus-shine'
                        : 'letter-tile text-indigo-700 hover:text-indigo-900'
                    : 'empty-cell'
                  }
                `}
              >
                {/* Letter content */}
                {letter && (
                  <>
                    <span className="relative z-10 drop-shadow-sm">{letter.char}</span>

                    {/* Selection order badge */}
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-lg z-20"
                      >
                        {selectionOrder}
                      </motion.div>
                    )}

                    {/* Bonus star indicator */}
                    {letter.isBonus && !selected && (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute -top-1 -right-1 text-yellow-200 z-20"
                      >
                        <svg className="w-4 h-4 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </motion.div>
                    )}

                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 shimmer opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                  </>
                )}
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard;

