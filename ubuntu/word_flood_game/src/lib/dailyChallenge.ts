import { supabase } from '../SupabaseClient';
import { DailyChallenge, DailyChallengeAttempt } from '../types';
import { SeededRandom } from './seededRandom';

// Get today's daily challenge from Supabase
export async function getDailyChallenge(language: 'da' | 'en'): Promise<DailyChallenge | null> {
  try {
    const { data, error } = await supabase.rpc('get_daily_challenge', {
      p_language: language
    });

    if (error) {
      console.error('Error fetching daily challenge:', error);
      return null;
    }

    if (data && data.length > 0) {
      return {
        challenge_date: data[0].out_challenge_date,
        seed: data[0].out_seed,
        language: data[0].out_lang as 'da' | 'en'
      };
    }

    return null;
  } catch (err) {
    console.error('Error in getDailyChallenge:', err);
    return null;
  }
}

// Check if user has already completed today's challenge
export async function hasCompletedDailyChallenge(userId: string, language: 'da' | 'en'): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('has_completed_daily_challenge', {
      p_user_id: userId,
      p_language: language
    });

    if (error) {
      console.error('Error checking daily challenge completion:', error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error('Error in hasCompletedDailyChallenge:', err);
    return false;
  }
}

// Save daily challenge result
export async function saveDailyChallengeResult(
  userId: string,
  language: 'da' | 'en',
  score: number,
  wordsFound: string[],
  longestWord: string | null
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('save_daily_challenge_result', {
      p_user_id: userId,
      p_language: language,
      p_score: score,
      p_words_found: wordsFound,
      p_longest_word: longestWord
    });

    if (error) {
      console.error('Error saving daily challenge result:', error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error('Error in saveDailyChallengeResult:', err);
    return false;
  }
}

// Get daily challenge leaderboard
export async function getDailyChallengeLeaderboard(
  language: 'da' | 'en',
  limit: number = 10
): Promise<DailyChallengeAttempt[]> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_challenge_attempts')
      .select(`
        *,
        profiles:user_id (
          username,
          display_name
        )
      `)
      .eq('challenge_date', today)
      .eq('language', language)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching daily leaderboard:', error);
      return [];
    }

    return (data || []) as DailyChallengeAttempt[];
  } catch (err) {
    console.error('Error in getDailyChallengeLeaderboard:', err);
    return [];
  }
}

// Get user's daily challenge result for today
export async function getUserDailyResult(
  userId: string,
  language: 'da' | 'en'
): Promise<DailyChallengeAttempt | null> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_challenge_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_date', today)
      .eq('language', language)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - not an error
        return null;
      }
      console.error('Error fetching user daily result:', error);
      return null;
    }

    return data as DailyChallengeAttempt;
  } catch (err) {
    console.error('Error in getUserDailyResult:', err);
    return null;
  }
}

// Get user's rank in today's daily challenge
export async function getUserDailyRank(
  userId: string,
  language: 'da' | 'en'
): Promise<number | null> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get user's score
    const userResult = await getUserDailyResult(userId, language);
    if (!userResult) return null;

    // Count how many scores are higher
    const { count, error } = await supabase
      .from('daily_challenge_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_date', today)
      .eq('language', language)
      .gt('score', userResult.score);

    if (error) {
      console.error('Error calculating rank:', error);
      return null;
    }

    // Rank is count of higher scores + 1
    return (count || 0) + 1;
  } catch (err) {
    console.error('Error in getUserDailyRank:', err);
    return null;
  }
}

// Create a seeded random generator for daily challenge
export function createDailyChallengeRandom(seed: string): SeededRandom {
  return new SeededRandom(seed);
}
