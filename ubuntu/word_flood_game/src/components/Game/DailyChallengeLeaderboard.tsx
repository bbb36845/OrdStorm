import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw, Crown, Medal, Award, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyChallengeLeaderboard } from '../../lib/dailyChallenge';
import { DailyChallengeAttempt } from '../../types';

interface DailyChallengeLeaderboardProps {
  currentUserId: string | null;
  language: 'da' | 'en';
}

const DailyChallengeLeaderboard: React.FC<DailyChallengeLeaderboardProps> = ({
  currentUserId,
  language
}) => {
  const { t } = useTranslation();
  const [scores, setScores] = useState<DailyChallengeAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await getDailyChallengeLeaderboard(language, 10);
      setScores(data);
    } catch (err) {
      console.error('Error fetching daily leaderboard:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [language]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleRefresh = () => {
    fetchLeaderboard(true);
  };

  const getDisplayName = (entry: DailyChallengeAttempt): string => {
    if (entry.profiles) {
      const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
      if (profile?.display_name) return profile.display_name;
      if (profile?.username) return profile.username;
    }
    return t('leaderboard.anonymous', 'Anonymous');
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="rank-gold w-8 h-8 rounded-full flex items-center justify-center">
          <Crown size={16} className="text-white drop-shadow" />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="rank-silver w-8 h-8 rounded-full flex items-center justify-center">
          <Medal size={16} className="text-white drop-shadow" />
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="rank-bronze w-8 h-8 rounded-full flex items-center justify-center">
          <Award size={16} className="text-white drop-shadow" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-bold text-sm">
        {index + 1}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 size={28} className="animate-spin text-orange-500 mb-3" />
        <p className="text-gray-600 font-medium text-sm">{t('daily.loading')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-orange-100 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-orange-500" />
          <h3 className="text-base font-bold text-gray-800">
            {t('daily.leaderboard')}
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            {new Date().toLocaleDateString(language === 'da' ? 'da-DK' : 'en-US', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50
            transition-colors duration-200 disabled:opacity-50"
          title={t('leaderboard.refresh', 'Refresh leaderboard')}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {scores.length === 0 ? (
        <div className="text-center py-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
          <Sparkles size={20} className="text-orange-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-medium">{t('leaderboard.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {scores.map((entry, index) => {
              const isCurrentUser = entry.user_id === currentUserId;
              const displayName = getDisplayName(entry);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                  className={`
                    flex items-center justify-between p-2.5 rounded-xl
                    transition-all duration-200
                    ${isCurrentUser
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 shadow-sm'
                      : index < 3
                        ? 'bg-gradient-to-r from-white to-gray-50 border border-gray-100'
                        : 'bg-white/70 border border-gray-100'}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    {getRankBadge(index)}
                    <div className="flex flex-col">
                      <span className={`font-semibold text-sm ${isCurrentUser ? 'text-orange-700' : 'text-gray-700'}`}>
                        {displayName}
                      </span>
                      {entry.word_count > 0 && (
                        <span className="text-xs text-gray-400">
                          {entry.word_count} {t('leaderboard.words')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`
                      font-bold text-base
                      ${isCurrentUser ? 'text-orange-600' : index === 0 ? 'text-yellow-600' : 'text-gray-800'}
                    `}>
                      {entry.score.toLocaleString(language === 'da' ? 'da-DK' : 'en-US')}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">{t('leaderboard.points')}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DailyChallengeLeaderboard;
