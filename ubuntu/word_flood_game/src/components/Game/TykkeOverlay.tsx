import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface TykkeOverlayProps {
  isActive: boolean;
  onAnimationComplete: () => void;
}

const TykkeOverlay: React.FC<TykkeOverlayProps> = ({ isActive, onAnimationComplete }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'dropping' | 'showing' | 'clearing' | 'done'>('dropping');

  useEffect(() => {
    if (!isActive) {
      setPhase('dropping');
      return;
    }

    // Phase 1: Drop animation (1 second)
    const dropTimer = setTimeout(() => {
      setPhase('showing');
    }, 1000);

    // Phase 2: Show "Tykke hjælper!" text (1.5 seconds)
    const showTimer = setTimeout(() => {
      setPhase('clearing');
    }, 2500);

    // Phase 3: Clear effect and complete (0.5 seconds)
    const clearTimer = setTimeout(() => {
      setPhase('done');
      onAnimationComplete();
    }, 3000);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(showTimer);
      clearTimeout(clearTimer);
    };
  }, [isActive, onAnimationComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          style={{ backgroundColor: phase === 'clearing' ? 'rgba(255,255,255,0.3)' : 'transparent' }}
        >
          {/* Tykke image dropping from top */}
          <motion.div
            initial={{ y: -400, rotate: -10 }}
            animate={
              phase === 'dropping'
                ? { y: 0, rotate: 0 }
                : phase === 'clearing'
                ? { scale: 1.2, opacity: 0 }
                : { y: 0, rotate: 0 }
            }
            transition={
              phase === 'dropping'
                ? { type: 'spring', damping: 12, stiffness: 100, duration: 1 }
                : phase === 'clearing'
                ? { duration: 0.5 }
                : {}
            }
            className="relative"
          >
            {/* Glow effect behind the image */}
            <motion.div
              animate={phase === 'showing' ? { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-yellow-400/40 rounded-full blur-3xl -z-10 scale-150"
            />

            {/* Tykke's photo */}
            <motion.img
              src="/tykke.png"
              alt="Tykke"
              className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-full border-4 border-white shadow-2xl"
              animate={phase === 'showing' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </motion.div>

          {/* "Tykke hjælper!" text */}
          <AnimatePresence>
            {(phase === 'showing' || phase === 'clearing') && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="mt-6"
              >
                <motion.h2
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg"
                  style={{
                    textShadow: '0 0 20px rgba(234, 179, 8, 0.8), 0 0 40px rgba(234, 179, 8, 0.6), 0 4px 8px rgba(0,0,0,0.4)'
                  }}
                >
                  {t('tykke.title')}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-white/90 text-center mt-2 drop-shadow-md"
                >
                  {t('tykke.subtitle')}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clearing wave effect */}
          {phase === 'clearing' && (
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TykkeOverlay;
