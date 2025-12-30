import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../SupabaseClient';
import { Loader2, AlertTriangle, Trophy, RefreshCw, Crown, Medal, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileData {
  username: string | null;
  display_name: string | null;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  created_at: string;
  profiles: ProfileData | ProfileData[] | null;
}

interface LeaderboardProps {
  currentUserId: string | null;
  onRefresh?: () => void;
  language?: 'da' | 'en';
}

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'allTime';

const getDateRangeForPeriod = (period: TimePeriod): { startISO: string; endISO: string } | null => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      break;
    case 'weekly':
      // Start of current week (Monday)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday, 0, 0, 0, 0);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      break;
    case 'allTime':
      return null; // No date filter
  }

  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return {
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
  };
};

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUserId, language = 'da' }) => {
  const { t } = useTranslation();
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('daily');

  const fetchLeaderboardData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const dateRange = getDateRangeForPeriod(selectedPeriod);

      let query = supabase
        .from('scores')
        .select(`
          id,
          user_id,
          score,
          created_at,
          profiles (
            username,
            display_name
          )
        `)
        .eq('language', language)
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(10);

      // Apply date filter if not all-time
      if (dateRange) {
        query = query
          .gte('created_at', dateRange.startISO)
          .lte('created_at', dateRange.endISO);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching scores:", fetchError);
        throw new Error('Could not load leaderboard');
      }
      setScores((data as LeaderboardEntry[]) || []);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching leaderboard.");
      }
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [language, selectedPeriod]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const handleRefresh = () => {
    fetchLeaderboardData(true);
  };

  const getDisplayName = (entry: LeaderboardEntry): string => {
    const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
    if (profile?.display_name) return profile.display_name;
    if (profile?.username) return profile.username;
    return t('leaderboard.anonymous', 'Anonymous');
  };

  const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
      case 'daily': return t('leaderboard.daily');
      case 'weekly': return t('leaderboard.weekly');
      case 'monthly': return t('leaderboard.monthly');
      case 'yearly': return t('leaderboard.yearly');
      case 'allTime': return t('leaderboard.allTime');
    }
  };

  const periodSubtitle = useMemo((): string => {
    const now = new Date();
    const locale = language === 'da' ? 'da-DK' : 'en-US';

    switch (selectedPeriod) {
      case 'daily':
        return now.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
      case 'weekly': {
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
        return `${monday.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${now.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`;
      }
      case 'monthly':
        return now.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      case 'yearly':
        return now.getFullYear().toString();
      case 'allTime':
        return '';
    }
  }, [selectedPeriod, language]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <AlertTriangle size={32} className="text-amber-500 mb-3" />
        <p className="text-gray-700 font-semibold mb-1">{t('leaderboard.couldNotLoad', 'Could not load')}</p>
        <p className="text-gray-500 text-sm text-center mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg
            font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} />
          {t('leaderboard.tryAgain', 'Try again')}
        </button>
      </div>
    );
  }

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

  const periods: TimePeriod[] = ['daily', 'weekly', 'monthly', 'yearly', 'allTime'];

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={22} className="text-yellow-500" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {t('leaderboard.title')}
          </h2>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-gray-400 hover:text-sky-600 hover:bg-sky-50
            transition-colors duration-200 disabled:opacity-50"
          title={t('leaderboard.refresh', 'Refresh leaderboard')}
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-xl overflow-x-auto">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`
              flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
              ${selectedPeriod === period
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {getPeriodLabel(period)}
          </button>
        ))}
      </div>

      {/* Period subtitle */}
      {periodSubtitle && (
        <div className="text-center text-xs text-gray-400 font-medium mb-3">
          {periodSubtitle}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-sky-500 mb-3" />
          <p className="text-sky-600 font-medium">{t('leaderboard.loading')}</p>
        </div>
      ) : (
        /* Score list */
        <div>
          {scores.length === 0 ? (
            <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
              <Sparkles size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">{t('leaderboard.empty')}</p>
              <p className="text-gray-400 text-xs mt-1">{t('leaderboard.beFirst', 'Be the first on the list!')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map((entry, index) => {
                const isCurrentUser = currentUserId && entry.user_id === currentUserId;
                const displayName = getDisplayName(entry);

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 25 }}
                    className={`
                      flex items-center justify-between p-3 rounded-xl
                      transition-all duration-200 cursor-default
                      ${isCurrentUser
                        ? 'bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-2 border-sky-200 shadow-md'
                        : index < 3
                          ? 'bg-gradient-to-r from-white to-gray-50 border border-gray-100 shadow-sm'
                          : 'bg-white/70 border border-gray-100 hover:bg-white hover:shadow-sm'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {getRankBadge(index)}
                      <div className="flex flex-col">
                        <span className={`font-semibold ${isCurrentUser ? 'text-sky-700' : 'text-gray-700'} ${index < 3 ? 'text-base' : 'text-sm'}`}>
                          {displayName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs text-sky-500">{t('leaderboard.you', 'You')}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`
                        font-bold
                        ${isCurrentUser ? 'text-indigo-600' : index === 0 ? 'text-yellow-600' : 'text-gray-800'}
                        ${index < 3 ? 'text-xl' : 'text-lg'}
                      `}>
                        {entry.score.toLocaleString(language === 'da' ? 'da-DK' : 'en-US')}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{t('leaderboard.points')}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(Leaderboard);
