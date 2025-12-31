import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface TykkeRelaxOverlayProps {
  isActive: boolean;
  onAnimationComplete: () => void;
}

const TykkeRelaxOverlay: React.FC<TykkeRelaxOverlayProps> = ({ isActive, onAnimationComplete }) => {
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

    // Phase 2: Show text (3 seconds), then start the relax mode
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
            {/* Calming glow effect behind the image - soft cyan/teal */}
            <motion.div
              animate={phase === 'showing' ? {
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 rounded-full blur-3xl -z-10 scale-[2]"
            />

            {/* Tykke's relax photo with soft border */}
            <motion.img
              src="/tykke_relax.png"
              alt="Tykke Relax"
              className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-full border-8 shadow-2xl"
              style={{ borderColor: '#22d3d1' }}
              animate={phase === 'showing' ? {
                scale: [1, 1.03, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Zzz badge for relax */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={phase === 'showing' ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.3 }}
              className="absolute -top-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full border-4 border-white shadow-xl"
            >
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl sm:text-3xl font-black text-white"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              >
                Zzz
              </motion.span>
            </motion.div>
          </motion.div>

          {/* "Tykke hjælper, hvil poterne" text */}
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
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-cyan-300"
                  style={{
                    WebkitTextStroke: '1px rgba(255,255,255,0.3)',
                    filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.8)) drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                  }}
                >
                  {t('tykkeRelax.title')}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl sm:text-2xl font-bold mt-4 text-white"
                  style={{
                    textShadow: '0 0 10px rgba(34, 211, 238, 0.8), 0 2px 4px rgba(0,0,0,0.9)'
                  }}
                >
                  {t('tykkeRelax.subtitle')}
                </motion.p>

                {/* Countdown hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.7, 1] }}
                  transition={{ delay: 0.6, duration: 1.5 }}
                  className="text-lg font-medium mt-3 text-cyan-300"
                >
                  60 {t('tykkeRelax.seconds')}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating bubble particles for relaxing effect */}
          {phase === 'showing' && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: (Math.random() - 0.5) * 300,
                    y: 200,
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{
                    y: -200,
                    opacity: [0, 0.6, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.4
                  }}
                  className="absolute w-6 h-6 bg-cyan-400/50 rounded-full"
                  style={{
                    boxShadow: '0 0 15px rgba(34, 211, 238, 0.6)'
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

export default TykkeRelaxOverlay;
