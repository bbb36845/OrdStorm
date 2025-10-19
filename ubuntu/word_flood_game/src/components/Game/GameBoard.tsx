import React from 'react';
import { Board, Letter } from '../../types';
import { motion } from 'framer-motion'; // For animations

interface GameBoardProps {
  board: Board;
  onLetterClick: (letter: Letter) => void;
  currentWord: Letter[]; // Added to track selected letters
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onLetterClick, currentWord }) => {
  const isSelected = (letterId: string) => {
    return currentWord.some(l => l.id === letterId);
  };

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-2 p-1 sm:p-2 bg-sky-100 rounded-lg shadow-inner select-none">
      {board.map((row, rowIndex) =>
        row.map((letter, colIndex) => {
          const letterId = letter ? letter.id : `empty-${rowIndex}-${colIndex}`;
          return (
            <motion.div
              key={letterId}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.2 }}
              className={`
                aspect-square rounded-md flex items-center justify-center 
                text-xl sm:text-2xl font-bold uppercase cursor-pointer 
                transition-all duration-150 ease-in-out transform active:scale-90
                ${letter
                  ? isSelected(letter.id)
                    ? letter.isBonus
                      ? 'bg-yellow-600 text-white shadow-xl scale-110 border-2 border-yellow-700 ring-2 ring-yellow-400'
                      : 'bg-yellow-400 text-white shadow-lg scale-105 border-2 border-yellow-500 ring-2 ring-yellow-300'
                    : letter.isBonus
                      ? 'bg-yellow-500 text-white shadow-lg hover:bg-yellow-400 font-extrabold border-2 border-yellow-600 ring-2 ring-yellow-300 bonus-shine'
                      : 'bg-white text-sky-700 shadow-md hover:bg-sky-50'
                  : 'bg-sky-200/70 shadow-sm' // Empty cell style
                }
              `}
              onClick={() => letter && onLetterClick(letter)}
            >
              {letter ? letter.char : ''}
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default GameBoard;

