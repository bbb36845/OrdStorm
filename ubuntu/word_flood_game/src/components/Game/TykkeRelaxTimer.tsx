import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface TykkeRelaxTimerProps {
  isActive: boolean;
  endTime: number | null;
}

const TykkeRelaxTimer: React.FC<TykkeRelaxTimerProps> = ({ isActive, endTime }) => {
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

  // Calculate color based on time remaining - stays calming colors
  const getTimerColor = () => {
    if (secondsRemaining > 30) return 'from-cyan-400 to-teal-500';
    if (secondsRemaining > 10) return 'from-teal-400 to-cyan-500';
    return 'from-cyan-500 to-teal-600';
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="fixed top-4 left-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm border-2 border-cyan-400/50 shadow-lg"
          style={{
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)'
          }}
        >
          {/* Zzz badge */}
          <motion.div
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-8 h-8 flex items-center justify-center bg-gradient-to-br ${getTimerColor()} rounded-full`}
          >
            <span className="text-xs font-black text-white">Zzz</span>
          </motion.div>

          {/* Timer display */}
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium text-cyan-400/80">{t('tykkeRelax.relaxMode')}</span>
            <motion.span
              key={secondsRemaining}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-lg font-bold bg-gradient-to-r ${getTimerColor()} bg-clip-text text-transparent`}
            >
              {secondsRemaining}s
            </motion.span>
          </div>

          {/* Gentle pulse when ending soon */}
          {secondsRemaining <= 10 && (
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full border-2 border-cyan-400"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TykkeRelaxTimer;
