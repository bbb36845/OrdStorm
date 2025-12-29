import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface TykkeBonusOverlayProps {
  isActive: boolean;
  onAnimationComplete: () => void;
}

const TykkeBonusOverlay: React.FC<TykkeBonusOverlayProps> = ({ isActive, onAnimationComplete }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'dropping' | 'showing' | 'done'>('dropping');

  useEffect(() => {
    if (!isActive) {
      setPhase('dropping');
      return;
    }

    // Phase 1: Drop animation (1.5 seconds)
    const dropTimer = setTimeout(() => {
      setPhase('showing');
    }, 1500);

    // Phase 2: Show "TYKKE BONUS RUNDE" text (3 seconds), then start the bonus
    const completeTimer = setTimeout(() => {
      setPhase('done');
      onAnimationComplete();
    }, 4500);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive, onAnimationComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          {/* Tykke image dropping from top */}
          <motion.div
            initial={{ y: -400, rotate: -10 }}
            animate={
              phase === 'dropping'
                ? { y: 0, rotate: 0 }
                : { y: 0, rotate: 0 }
            }
            transition={
              phase === 'dropping'
                ? { type: 'spring', damping: 10, stiffness: 80, duration: 1.5 }
                : {}
            }
            className="relative"
          >
            {/* Epic glow effect behind the image - golden for bonus round */}
            <motion.div
              animate={phase === 'showing' ? {
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
                rotate: [0, 180, 360]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-full blur-3xl -z-10 scale-[2]"
            />

            {/* Tykke's photo with golden border for bonus */}
            <motion.img
              src="/tykke.png"
              alt="Tykke"
              className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-full border-8 shadow-2xl"
              style={{ borderColor: '#fbbf24' }}
              animate={phase === 'showing' ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            />

            {/* 3x badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={phase === 'showing' ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.3 }}
              className="absolute -top-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-white shadow-xl"
            >
              <span className="text-2xl sm:text-3xl font-black text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                3x
              </span>
            </motion.div>
          </motion.div>

          {/* "TYKKE BONUS RUNDE" text */}
          <AnimatePresence>
            {phase === 'showing' && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="mt-8 text-center"
              >
                <motion.h2
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300"
                  style={{
                    WebkitTextStroke: '1px rgba(255,255,255,0.3)',
                    filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8)) drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                  }}
                >
                  {t('tykkeBonus.title')}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl sm:text-2xl font-bold mt-4 text-white"
                  style={{
                    textShadow: '0 0 10px rgba(251, 191, 36, 0.8), 0 2px 4px rgba(0,0,0,0.9)'
                  }}
                >
                  {t('tykkeBonus.subtitle')}
                </motion.p>

                {/* Countdown hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.7, 1] }}
                  transition={{ delay: 0.6, duration: 1.5 }}
                  className="text-lg font-medium mt-3 text-yellow-300"
                >
                  60 {t('tykkeBonus.seconds')}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sparkle particles */}
          {phase === 'showing' && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{
                    x: Math.cos(i * 30 * Math.PI / 180) * 200,
                    y: Math.sin(i * 30 * Math.PI / 180) * 200,
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                  className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                  style={{
                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)'
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TykkeBonusOverlay;
