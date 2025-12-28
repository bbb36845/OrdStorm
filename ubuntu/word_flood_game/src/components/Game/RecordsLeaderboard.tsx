import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../SupabaseClient';
import {
  Loader2, AlertTriangle, Trophy, RefreshCw, Crown, Medal, Award,
  Sparkles, Zap, Timer, Type, Flame, Hash, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecordCategory } from '../../types';

interface ProfileData {
  username: string | null;
  display_name: string | null;
}

interface RecordEntry {
  id: string;
  user_id: string;
  category: RecordCategory;
  value: number;
  word: string | null;
  language: 'da' | 'en';
  created_at: string;
  profiles: ProfileData | ProfileData[] | null;
}

interface RecordsLeaderboardProps {
  currentUserId: string | null;
  language?: 'da' | 'en';
  refreshKey?: number;
}

type CategoryConfig = {
  key: RecordCategory;
  icon: React.ReactNode;
  formatValue: (value: number, word: string | null, t: (key: string) => string) => string;
  isLowerBetter?: boolean;
};

const RecordsLeaderboard: React.FC<RecordsLeaderboardProps> = ({
  currentUserId,
  language = 'da',
  refreshKey = 0
}) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<Record<RecordCategory, RecordEntry[]>>({
    fastest_word: [],
    longest_word: [],
    highest_word_score: [],
    longest_streak: [],
    most_words_game: [],
    total_score: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory>('fastest_word');

  const categories: CategoryConfig[] = [
    {
      key: 'fastest_word',
      icon: <Timer size={16} className="text-blue-500" />,
      formatValue: (value, word) => `${(value / 1000).toFixed(2)}s${word ? ` (${word})` : ''}`,
      isLowerBetter: true
    },
    {
      key: 'longest_word',
      icon: <Type size={16} className="text-purple-500" />,
      formatValue: (value, word) => word || `${value} ${t('records.letters')}`
    },
    {
      key: 'highest_word_score',
      icon: <Zap size={16} className="text-yellow-500" />,
      formatValue: (value, word) => `${value} pts${word ? ` (${word})` : ''}`
    },
    {
      key: 'longest_streak',
      icon: <Flame size={16} className="text-orange-500" />,
      formatValue: (value) => `${value}x`
    },
    {
      key: 'most_words_game',
      icon: <Hash size={16} className="text-green-500" />,
      formatValue: (value) => `${value} ${t('records.words')}`
    },
    {
      key: 'total_score',
      icon: <TrendingUp size={16} className="text-indigo-500" />,
      formatValue: (value) => value.toLocaleString(language === 'da' ? 'da-DK' : 'en-US')
    }
  ];

  const fetchRecordsData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const newRecords: Record<RecordCategory, RecordEntry[]> = {
        fastest_word: [],
        longest_word: [],
        highest_word_score: [],
        longest_streak: [],
        most_words_game: [],
        total_score: []
      };

      // Fetch records for each category
      for (const cat of categories) {
        const { data, error: fetchError } = await supabase
          .from('records')
          .select(`
            id,
            user_id,
            category,
            value,
            word,
            language,
            created_at,
            profiles (
              username,
              display_name
            )
          `)
          .eq('category', cat.key)
          .eq('language', language)
          .order('value', { ascending: cat.isLowerBetter ?? false })
          .limit(10);

        if (fetchError) {
          console.error(`Error fetching ${cat.key} records:`, fetchError);
          continue;
        }

        newRecords[cat.key] = (data as RecordEntry[]) || [];
      }

      setRecords(newRecords);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('records.unknownError', 'An unknown error occurred'));
      }
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [language, t]);

  useEffect(() => {
    fetchRecordsData();
  }, [fetchRecordsData, refreshKey]);

  const handleRefresh = () => {
    fetchRecordsData(true);
  };

  const getDisplayName = (entry: RecordEntry): string => {
    const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
    if (profile?.display_name) return profile.display_name;
    if (profile?.username) return profile.username;
    return t('leaderboard.anonymous', 'Anonymous');
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="rank-gold w-7 h-7 rounded-full flex items-center justify-center">
          <Crown size={14} className="text-white drop-shadow" />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="rank-silver w-7 h-7 rounded-full flex items-center justify-center">
          <Medal size={14} className="text-white drop-shadow" />
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="rank-bronze w-7 h-7 rounded-full flex items-center justify-center">
          <Award size={14} className="text-white drop-shadow" />
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-bold text-xs">
        {index + 1}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 size={28} className="animate-spin text-sky-500 mb-3" />
        <p className="text-sky-600 font-medium text-sm">{t('leaderboard.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-4">
        <AlertTriangle size={28} className="text-amber-500 mb-2" />
        <p className="text-gray-700 font-semibold text-sm mb-1">{t('leaderboard.couldNotLoad', 'Could not load')}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg
            font-medium transition-colors flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} />
          {t('leaderboard.tryAgain', 'Try again')}
        </button>
      </div>
    );
  }

  const currentCategoryConfig = categories.find(c => c.key === selectedCategory)!;
  const currentRecords = records[selectedCategory];

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {t('records.title', 'Records')}
          </h2>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50
            transition-colors duration-200 disabled:opacity-50"
          title={t('leaderboard.refresh', 'Refresh')}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {categories.map((cat) => (
          <motion.button
            key={cat.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory(cat.key)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
              transition-all duration-200
              ${selectedCategory === cat.key
                ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {cat.icon}
            <span className="hidden sm:inline">{t(`records.categories.${cat.key}`)}</span>
          </motion.button>
        ))}
      </div>

      {/* Category Title */}
      <div className="flex items-center gap-2 mb-3">
        {currentCategoryConfig.icon}
        <h3 className="text-sm font-bold text-gray-700">
          {t(`records.categories.${selectedCategory}`)}
        </h3>
      </div>

      {/* Records List */}
      {currentRecords.length === 0 ? (
        <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
          <Sparkles size={20} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-medium">{t('leaderboard.empty')}</p>
          <p className="text-gray-400 text-xs mt-1">{t('leaderboard.beFirst', 'Be the first!')}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence>
            {currentRecords.map((entry, index) => {
              const isCurrentUser = currentUserId && entry.user_id === currentUserId;
              const displayName = getDisplayName(entry);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 25 }}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className={`
                    flex items-center justify-between p-2.5 rounded-lg
                    transition-all duration-200 cursor-default
                    ${isCurrentUser
                      ? 'bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-2 border-sky-200 shadow-sm'
                      : index < 3
                        ? 'bg-gradient-to-r from-white to-gray-50 border border-gray-100 shadow-sm'
                        : 'bg-white/70 border border-gray-100 hover:bg-white'}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    {getRankBadge(index)}
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isCurrentUser ? 'text-sky-700' : 'text-gray-700'} text-sm`}>
                        {displayName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs text-sky-500">{t('leaderboard.you', 'You')}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`
                      font-bold text-sm
                      ${isCurrentUser ? 'text-indigo-600' : index === 0 ? 'text-yellow-600' : 'text-gray-800'}
                    `}>
                      {currentCategoryConfig.formatValue(entry.value, entry.word, t)}
                    </span>
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

export default RecordsLeaderboard;
