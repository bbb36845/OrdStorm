import React, { useMemo } from 'react';
import { Board, Letter, LetterType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Snowflake, Sparkles, Link, Timer, Lock } from 'lucide-react';

// Check if device prefers reduced motion
const prefersReducedMotion = typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface GameBoardProps {
  board: Board;
  onLetterClick: (letter: Letter) => void;
  currentWord: Letter[];
  isFrozen?: boolean;
}

// Get styling based on letter type
const getLetterTypeStyles = (letterType: LetterType, selected: boolean): string => {
  if (selected) {
    switch (letterType) {
      case 'bonus2x':
        return 'letter-tile-selected bg-gradient-to-br from-yellow-400 to-amber-500 text-white selected-pulse';
      case 'bonus3x':
        return 'letter-tile-selected bg-gradient-to-br from-purple-500 to-pink-500 text-white selected-pulse';
      case 'bomb':
        return 'letter-tile-selected bg-gradient-to-br from-red-500 to-orange-500 text-white selected-pulse';
      case 'wild':
        return 'letter-tile-selected bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 text-white selected-pulse';
      case 'ice':
        return 'letter-tile-selected bg-gradient-to-br from-cyan-300 to-blue-400 text-white selected-pulse';
      case 'chain':
        return 'letter-tile-selected bg-gradient-to-br from-green-400 to-emerald-500 text-white selected-pulse';
      case 'tickingBomb':
        return 'letter-tile-selected bg-gradient-to-br from-red-600 to-red-800 text-white selected-pulse animate-pulse';
      case 'locked':
        return 'letter-tile-selected bg-gradient-to-br from-gray-500 to-gray-700 text-white selected-pulse';
      default:
        return 'letter-tile-selected text-white selected-pulse';
    }
  }

  switch (letterType) {
    case 'bonus2x':
      return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white bonus-shine shadow-lg shadow-yellow-500/30';
    case 'bonus3x':
      return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white bonus-shine shadow-lg shadow-purple-500/30';
    case 'bomb':
      return 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30';
    case 'wild':
      return 'bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 animate-gradient';
    case 'ice':
      return 'bg-gradient-to-br from-cyan-300 to-blue-400 text-white shadow-lg shadow-cyan-500/30';
    case 'chain':
      return 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30';
    case 'tickingBomb':
      return 'bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-red-500/50 animate-pulse';
    case 'locked':
      return 'bg-gradient-to-br from-gray-500 to-gray-700 text-gray-300 shadow-md';
    default:
      return 'letter-tile text-indigo-700 hover:text-indigo-900';
  }
};

// Get icon for special letter types
const getLetterIcon = (letterType: LetterType) => {
  switch (letterType) {
    case 'bonus2x':
      return <span className="text-xs font-bold">2x</span>;
    case 'bonus3x':
      return <span className="text-xs font-bold">3x</span>;
    case 'bomb':
      return <Bomb size={12} />;
    case 'wild':
      return <Sparkles size={12} />;
    case 'ice':
      return <Snowflake size={12} />;
    case 'chain':
      return <Link size={12} />;
    case 'tickingBomb':
      return <Timer size={12} />;
    case 'locked':
      return <Lock size={12} />;
    default:
      return null;
  }
};

const GameBoard: React.FC<GameBoardProps> = ({ board, onLetterClick, currentWord, isFrozen }) => {
  // Memoize selection state for performance
  const selectedIds = useMemo(() => new Set(currentWord.map(l => l.id)), [currentWord]);

  const isSelected = (letterId: string) => selectedIds.has(letterId);

  const getSelectionOrder = (letterId: string) => {
    return currentWord.findIndex(l => l.id === letterId) + 1;
  };

  // Track if touch event was used to prevent double-firing on iOS
  const touchedRef = React.useRef(false);

  // Handle touch start - mark that we're using touch
  const handleTouchStart = () => {
    touchedRef.current = true;
  };

  // Handle touch end - fire the event
  const handleTouchEnd = (letter: Letter, e: React.TouchEvent) => {
    e.preventDefault();
    onLetterClick(letter);
    // Reset after a short delay to allow for new interactions
    setTimeout(() => {
      touchedRef.current = false;
    }, 300);
  };

  // Handle click - only fire if not already handled by touch
  const handleClick = (letter: Letter, e: React.MouseEvent) => {
    if (touchedRef.current) {
      // Already handled by touch, ignore click
      return;
    }
    e.preventDefault();
    onLetterClick(letter);
  };

  return (
    <div
      className={`game-board grid grid-cols-6 gap-2 sm:gap-2.5 p-3 sm:p-4 rounded-2xl relative ${isFrozen ? 'ring-4 ring-cyan-400 ring-opacity-50' : ''}`}
      style={{ touchAction: 'manipulation', WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Freeze overlay - simplified animation */}
      {isFrozen && (
        <div className="absolute inset-0 bg-cyan-400/10 rounded-2xl pointer-events-none z-10 flex items-center justify-center">
          <div className="text-cyan-400 animate-pulse">
            <Snowflake size={48} />
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {board.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const cellKey = `cell-${rowIndex}-${colIndex}`;
            const selected = letter ? isSelected(letter.id) : false;
            const selectionOrder = letter ? getSelectionOrder(letter.id) : 0;
            const letterType = letter?.letterType || 'normal';
            const isSpecial = letterType !== 'normal';
            const icon = letter ? getLetterIcon(letterType) : null;

            return (
              <motion.div
                key={letter ? letter.id : cellKey}
                initial={letter ? { opacity: 0, scale: 0.8 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                layout={false}
                onTouchStart={letter ? handleTouchStart : undefined}
                onTouchEnd={(e) => letter && handleTouchEnd(letter, e)}
                onClick={(e) => letter && handleClick(letter, e)}
                className={`
                  aspect-square rounded-xl flex items-center justify-center
                  text-xl sm:text-2xl font-bold uppercase cursor-pointer
                  relative overflow-hidden
                  ${letter
                    ? getLetterTypeStyles(letterType, selected)
                    : 'empty-cell'
                  }
                `}
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                {letter && (
                  <>
                    {/* Letter content */}
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

                    {/* Special letter type indicator - static for better performance */}
                    {isSpecial && !selected && icon && (
                      <div
                        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-20 ${
                          letterType === 'bonus2x' ? 'bg-yellow-600 text-white' :
                          letterType === 'bonus3x' ? 'bg-purple-600 text-white' :
                          letterType === 'bomb' ? 'bg-red-700 text-white' :
                          letterType === 'wild' ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white' :
                          letterType === 'ice' ? 'bg-cyan-500 text-white' :
                          letterType === 'chain' ? 'bg-emerald-600 text-white' :
                          letterType === 'tickingBomb' ? 'bg-red-900 text-red-200 animate-pulse' :
                          letterType === 'locked' ? 'bg-gray-600 text-gray-200' :
                          'bg-indigo-600 text-white'
                        }`}
                      >
                        {icon}
                      </div>
                    )}

                    {/* Ticking bomb timer display - CSS animation only */}
                    {letterType === 'tickingBomb' && letter.tickingBombTimer !== undefined && !selected && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/70 text-red-400 text-xs font-bold px-1.5 py-0.5 rounded z-20 animate-pulse">
                        {letter.tickingBombTimer}s
                      </div>
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
