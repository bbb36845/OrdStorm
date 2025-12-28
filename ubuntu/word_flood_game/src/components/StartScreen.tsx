import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Zap, Info, Calendar, Infinity as InfinityIcon } from 'lucide-react';
import { Language } from '../i18n';
import { GameMode } from '../types';

interface StartScreenProps {
  onStart: (mode: GameMode) => void;
  onLanguageSelect: (lang: Language) => void;
  selectedLanguage: Language;
  onShowHowToPlay: () => void;
  dailyChallengeCompleted?: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onLanguageSelect,
  selectedLanguage,
  onShowHowToPlay,
  dailyChallengeCompleted = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen animated-gradient-bg p-4 relative overflow-hidden">
      {/* Floating background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-indigo-300/15 rounded-full blur-2xl"
        />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10"
      >
        {/* Logo and Title */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <Zap className="w-16 h-16 text-yellow-300 drop-shadow-lg mx-auto" />
        </motion.div>

        <motion.h1
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl sm:text-7xl font-extrabold text-white mb-4 drop-shadow-lg"
        >
          LetsWord
        </motion.h1>

        <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
          {t('startScreen.subtitle', 'Form words from falling letters before the board fills up!')}
        </p>

        {/* Language Selection */}
        <div className="mb-8">
          <p className="text-white/60 text-sm mb-4 uppercase tracking-wider font-medium">
            {t('startScreen.selectLanguage', 'Select Language')}
          </p>
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onLanguageSelect('da')}
              className={`
                flex flex-col items-center gap-2 px-8 py-5 rounded-2xl transition-all relative
                ${selectedLanguage === 'da'
                  ? 'bg-white shadow-2xl ring-4 ring-yellow-400/50'
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                }
              `}
            >
              <span className="text-4xl">🇩🇰</span>
              <span className={`font-semibold ${selectedLanguage === 'da' ? 'text-gray-800' : 'text-white'}`}>
                Dansk
              </span>
              {selectedLanguage === 'da' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onLanguageSelect('en')}
              className={`
                flex flex-col items-center gap-2 px-8 py-5 rounded-2xl transition-all relative
                ${selectedLanguage === 'en'
                  ? 'bg-white shadow-2xl ring-4 ring-yellow-400/50'
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                }
              `}
            >
              <span className="text-4xl">🇬🇧</span>
              <span className={`font-semibold ${selectedLanguage === 'en' ? 'text-gray-800' : 'text-white'}`}>
                English
              </span>
              {selectedLanguage === 'en' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </motion.button>
          </div>
        </div>

        {/* Game Mode Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          {/* Daily Challenge Button */}
          <motion.button
            whileHover={{ scale: dailyChallengeCompleted ? 1 : 1.05 }}
            whileTap={{ scale: dailyChallengeCompleted ? 1 : 0.95 }}
            onClick={() => !dailyChallengeCompleted && onStart('daily')}
            disabled={dailyChallengeCompleted}
            className={`flex items-center justify-center gap-3 px-8 py-4
              ${dailyChallengeCompleted
                ? 'bg-gray-400/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 btn-premium'
              }
              text-white text-lg font-bold rounded-2xl shadow-2xl
              transition-all relative`}
          >
            <Calendar size={24} />
            <div className="text-left">
              <div>{t('startScreen.dailyChallenge', 'Daily Challenge')}</div>
              {dailyChallengeCompleted && (
                <div className="text-xs font-normal opacity-80">
                  {t('daily.alreadyCompleted', 'Completed today')}
                </div>
              )}
            </div>
            {dailyChallengeCompleted && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </motion.button>

          {/* Endless Mode Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStart('endless')}
            className="flex items-center justify-center gap-3 px-8 py-4
              bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
              text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-green-500/30
              transition-all btn-premium"
          >
            <InfinityIcon size={24} />
            {t('startScreen.endless', 'Endless Mode')}
          </motion.button>
        </div>

        {/* How to Play */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowHowToPlay}
          className="flex items-center justify-center gap-2 mx-auto px-6 py-3
            bg-white/20 hover:bg-white/30 backdrop-blur-sm
            text-white font-medium rounded-xl transition-all"
        >
          <Info size={18} />
          {t('howToPlay.button')}
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-white/40 text-xs font-medium">
          {t('app.footer')}
        </p>
      </motion.footer>
    </div>
  );
};

export default StartScreen;
