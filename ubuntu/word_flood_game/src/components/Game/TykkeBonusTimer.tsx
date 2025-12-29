import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface TykkeBonusTimerProps {
  isActive: boolean;
  endTime: number | null;
}

const TykkeBonusTimer: React.FC<TykkeBonusTimerProps> = ({ isActive, endTime }) => {
  const { t } = useTranslation();
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    if (!isActive || !endTime) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setSecondsRemaining(remaining);
    };

    // Update immediately
    updateTimer();

    // Update every 100ms for smooth countdown
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [isActive, endTime]);

  // Calculate color based on time remaining
  const getTimerColor = () => {
    if (secondsRemaining > 30) return 'from-green-400 to-emerald-500';
    if (secondsRemaining > 10) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="fixed top-4 right-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm border-2 border-yellow-400/50 shadow-lg"
          style={{
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)'
          }}
        >
          {/* 3x badge */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className={`w-8 h-8 flex items-center justify-center bg-gradient-to-br ${getTimerColor()} rounded-full`}
          >
            <span className="text-sm font-black text-white">3x</span>
          </motion.div>

          {/* Timer display */}
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium text-yellow-400/80">{t('tykkeBonus.bonusRound')}</span>
            <motion.span
              key={secondsRemaining}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`text-lg font-bold bg-gradient-to-r ${getTimerColor()} bg-clip-text text-transparent`}
            >
              {secondsRemaining}s
            </motion.span>
          </div>

          {/* Pulsing ring when low time */}
          {secondsRemaining <= 10 && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-red-500"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TykkeBonusTimer;
