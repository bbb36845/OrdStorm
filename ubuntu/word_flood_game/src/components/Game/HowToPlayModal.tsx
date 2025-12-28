import React from 'react';
import { X, Bomb, Snowflake, Sparkles, Link, Timer, Lock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
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
            Sådan Spiller Du LetsWord
          </h2>

          <div className="space-y-5 text-gray-700">
            {/* Basic rules */}
            <section>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Grundlæggende Regler</h3>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li>Klik på bogstaver for at danne ord (minimum 3 bogstaver)</li>
                <li>Indsend gyldige danske ord for at score point</li>
                <li>Nye bogstaver dukker op hvert 1,2 sekund</li>
                <li>Spillet slutter når brættet er helt fyldt</li>
              </ul>
            </section>

            {/* Special letters */}
            <section>
              <h3 className="font-semibold text-lg text-gray-800 mb-3">Specielle Bogstaver</h3>
              <div className="grid gap-2.5">
                {/* 2x Bonus */}
                <div className="flex items-center gap-3 p-2.5 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow">
                    2x
                  </div>
                  <div>
                    <span className="font-medium text-yellow-700">2x Bonus</span>
                    <p className="text-xs text-gray-600">Fordobler ordets score</p>
                  </div>
                </div>

                {/* 3x Bonus */}
                <div className="flex items-center gap-3 p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow">
                    3x
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">3x Bonus</span>
                    <p className="text-xs text-gray-600">Tredobler ordets score</p>
                  </div>
                </div>

                {/* Bomb */}
                <div className="flex items-center gap-3 p-2.5 bg-red-50 rounded-xl border border-red-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shadow">
                    <Bomb size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-red-700">Bombe</span>
                    <p className="text-xs text-gray-600">Rydder et 3x3 felt rundt om sig</p>
                  </div>
                </div>

                {/* Wild */}
                <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-cyan-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">Joker (?)</span>
                    <p className="text-xs text-gray-600">Vises som ? - kan bruges som et hvilket som helst bogstav</p>
                  </div>
                </div>

                {/* Ice */}
                <div className="flex items-center gap-3 p-2.5 bg-cyan-50 rounded-xl border border-cyan-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-300 to-blue-400 flex items-center justify-center text-white shadow">
                    <Snowflake size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-cyan-700">Is</span>
                    <p className="text-xs text-gray-600">Fryser nye bogstaver i 5 sekunder</p>
                  </div>
                </div>

                {/* Chain */}
                <div className="flex items-center gap-3 p-2.5 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow">
                    <Link size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Kæde</span>
                    <p className="text-xs text-gray-600">Rydder alle tilstødende bogstaver</p>
                  </div>
                </div>

                {/* Ticking Bomb */}
                <div className="flex items-center gap-3 p-2.5 bg-red-100 rounded-xl border border-red-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow animate-pulse">
                    <Timer size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-red-800">Tikkende Bombe</span>
                    <p className="text-xs text-gray-600">Brug den inden 15 sek - ellers eksploderer den og fylder felter!</p>
                  </div>
                </div>

                {/* Locked */}
                <div className="flex items-center gap-3 p-2.5 bg-gray-100 rounded-xl border border-gray-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-gray-300 shadow">
                    <Lock size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Låst</span>
                    <p className="text-xs text-gray-600">Kan kun fjernes ved at bruge det i et ord</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Streak system */}
            <section>
              <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center gap-2">
                <Flame className="text-orange-500" size={20} />
                Streak Bonus
              </h3>
              <p className="text-sm text-gray-600">
                Indsend 3+ ord i træk (inden for 8 sekunder mellem hvert ord) for at få en streak-bonus!
                Jo længere din streak, jo flere bonuspoint får du.
              </p>
            </section>

            {/* Scoring */}
            <section>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Pointsystem</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Basispoint = antal bogstaver</li>
                <li>6+ bogstaver = 2x score</li>
                <li>8+ bogstaver = 3x score</li>
                <li>Brug af Æ, Ø, Å sammen = ekstra bonus</li>
              </ul>
            </section>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
              text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Forstået!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HowToPlayModal;
