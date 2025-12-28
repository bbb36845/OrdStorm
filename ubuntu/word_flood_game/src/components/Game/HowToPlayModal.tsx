import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Bomb, Snowflake, Sparkles, Link, Timer, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={24} />
            {t('howToPlay.title')}
          </h2>

          <div className="space-y-5 text-gray-700">
            {/* Goal */}
            <section>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{t('howToPlay.goal')}</h3>
              <p className="text-sm">{t('howToPlay.goalText')}</p>
            </section>

            {/* Basic rules */}
            <section>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{t('howToPlay.rules')}</h3>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li>{t('howToPlay.rule1')}</li>
                <li>{t('howToPlay.rule2')}</li>
                <li>{t('howToPlay.rule3')}</li>
                <li>{t('howToPlay.rule4')}</li>
              </ul>
            </section>

            {/* Special letters */}
            <section>
              <h3 className="font-semibold text-lg text-gray-800 mb-3">{t('howToPlay.specialLetters')}</h3>
              <div className="grid gap-2.5">
                {/* 2x Bonus */}
                <div className="flex items-center gap-3 p-2.5 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow">
                    2x
                  </div>
                  <div>
                    <span className="font-medium text-yellow-700">2x</span>
                    <p className="text-xs text-gray-600">{t('howToPlay.bonus2x')}</p>
                  </div>
                </div>

                {/* 3x Bonus */}
                <div className="flex items-center gap-3 p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow">
                    3x
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">3x</span>
                    <p className="text-xs text-gray-600">{t('howToPlay.bonus3x')}</p>
                  </div>
                </div>

                {/* Bomb */}
                <div className="flex items-center gap-3 p-2.5 bg-red-50 rounded-xl border border-red-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shadow">
                    <Bomb size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-red-700"><Bomb className="inline w-4 h-4" /></span>
                    <p className="text-xs text-gray-600">{t('howToPlay.bomb')}</p>
                  </div>
                </div>

                {/* Wild */}
                <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-cyan-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">?</span>
                    <p className="text-xs text-gray-600">{t('howToPlay.wild')}</p>
                  </div>
                </div>

                {/* Ice */}
                <div className="flex items-center gap-3 p-2.5 bg-cyan-50 rounded-xl border border-cyan-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-300 to-blue-400 flex items-center justify-center text-white shadow">
                    <Snowflake size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-cyan-700"><Snowflake className="inline w-4 h-4" /></span>
                    <p className="text-xs text-gray-600">{t('howToPlay.ice')}</p>
                  </div>
                </div>

                {/* Chain */}
                <div className="flex items-center gap-3 p-2.5 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow">
                    <Link size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-green-700"><Link className="inline w-4 h-4" /></span>
                    <p className="text-xs text-gray-600">{t('howToPlay.chain')}</p>
                  </div>
                </div>

                {/* Ticking Bomb */}
                <div className="flex items-center gap-3 p-2.5 bg-red-100 rounded-xl border border-red-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow animate-pulse">
                    <Timer size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-red-800"><Timer className="inline w-4 h-4" /></span>
                    <p className="text-xs text-gray-600">{t('howToPlay.tickingBomb')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Streak system */}
            <section>
              <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center gap-2">
                <Flame className="text-orange-500" size={20} />
                Streak
              </h3>
              <p className="text-sm text-gray-600">
                {t('howToPlay.streakDesc', 'Submit 3+ words in a row (within 8 seconds between each word) to get a streak bonus! The longer your streak, the more bonus points you get.')}
              </p>
            </section>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
              text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {t('howToPlay.close')}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HowToPlayModal;
