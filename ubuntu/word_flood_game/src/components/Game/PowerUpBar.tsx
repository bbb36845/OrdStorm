import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Shuffle, Timer } from 'lucide-react';
import { PowerUps, PowerUpType } from '../../types';

interface PowerUpBarProps {
  powerUps: PowerUps;
  onActivate: (type: PowerUpType) => void;
  disabled: boolean;
  pendingPowerUp: PowerUpType | null;
  onPendingDismiss: () => void;
}

const POWER_UP_CONFIG = {
  nuke: {
    icon: Bomb,
    label: 'Nuke',
    description: 'Ryd hele brættet',
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-400',
  },
  shuffle: {
    icon: Shuffle,
    label: 'Bland',
    description: 'Omrokér alle bogstaver',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-400',
  },
  timeFreeze: {
    icon: Timer,
    label: 'Frys',
    description: 'Stop nye bogstaver i 10 sek',
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/50',
    textColor: 'text-cyan-400',
  },
};

const PowerUpBar: React.FC<PowerUpBarProps> = ({
  powerUps,
  onActivate,
  disabled,
  pendingPowerUp,
  onPendingDismiss,
}) => {
  const powerUpTypes: PowerUpType[] = ['nuke', 'shuffle', 'timeFreeze'];

  return (
    <div className="relative">
      {/* Power-up earned notification */}
      <AnimatePresence>
        {pendingPowerUp && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-20"
            onClick={onPendingDismiss}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className={`px-4 py-2 rounded-full bg-gradient-to-r ${POWER_UP_CONFIG[pendingPowerUp].color} shadow-lg`}
            >
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span>+1</span>
                {React.createElement(POWER_UP_CONFIG[pendingPowerUp].icon, { size: 16 })}
                <span>{POWER_UP_CONFIG[pendingPowerUp].label}!</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Power-up bar */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {powerUpTypes.map((type) => {
          const config = POWER_UP_CONFIG[type];
          const count = powerUps[type];
          const Icon = config.icon;
          const hasAny = count > 0;

          return (
            <motion.button
              key={type}
              whileHover={hasAny && !disabled ? { scale: 1.05 } : {}}
              whileTap={hasAny && !disabled ? { scale: 0.95 } : {}}
              onClick={() => hasAny && !disabled && onActivate(type)}
              disabled={!hasAny || disabled}
              className={`
                relative flex items-center gap-1.5 px-3 py-2 rounded-xl
                border-2 transition-all duration-200
                ${hasAny
                  ? `${config.bgColor} ${config.borderColor} cursor-pointer hover:shadow-lg`
                  : 'bg-gray-800/50 border-gray-700/50 opacity-50 cursor-not-allowed'
                }
              `}
              title={`${config.label}: ${config.description}`}
            >
              <Icon
                size={18}
                className={hasAny ? config.textColor : 'text-gray-500'}
              />
              <span className={`text-sm font-bold ${hasAny ? config.textColor : 'text-gray-500'}`}>
                {count}
              </span>

              {/* Glow effect when available */}
              {hasAny && (
                <motion.div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${config.color} opacity-0`}
                  animate={{ opacity: [0, 0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* How to earn hint */}
      <p className="text-center text-xs text-white/40 mt-2">
        Tjen power-ups med lange ord og streaks
      </p>
    </div>
  );
};

export default PowerUpBar;
