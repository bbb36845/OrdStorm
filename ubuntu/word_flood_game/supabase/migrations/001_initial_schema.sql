-- OrdStorm Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ktglmdwhoqqpooekfbmg/sql

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Stats
  games_played INTEGER DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  longest_word TEXT,

  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_played_at DATE,

  -- Progression
  xp BIGINT DEFAULT 0,
  level INTEGER DEFAULT 1
);

-- ============================================
-- 2. SCORES TABLE (game results)
-- ============================================
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  words_found TEXT[] DEFAULT '{}',
  word_count INTEGER DEFAULT 0,
  longest_word TEXT,
  game_mode TEXT DEFAULT 'endless', -- endless, timed, daily
  difficulty TEXT DEFAULT 'medium', -- easy, medium, hard, expert
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- For daily challenges
  daily_date DATE,

  -- Indexes for leaderboard queries
  CONSTRAINT positive_score CHECK (score >= 0)
);

-- ============================================
-- 3. DAILY CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE UNIQUE NOT NULL,
  seed TEXT NOT NULL, -- Random seed for letter generation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  name_da TEXT NOT NULL, -- Danish name
  name_en TEXT NOT NULL, -- English name
  description_da TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  category TEXT -- score, words, streak, special
);

-- ============================================
-- 5. USER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON public.scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scores_score ON public.scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_daily ON public.scores(daily_date, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_game_mode ON public.scores(game_mode, score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_highest_score ON public.profiles(highest_score DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- SCORES policies
CREATE POLICY "Scores are viewable by everyone"
  ON public.scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own scores"
  ON public.scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores"
  ON public.scores FOR UPDATE
  USING (auth.uid() = user_id);

-- DAILY CHALLENGES policies (read-only for users)
CREATE POLICY "Daily challenges are viewable by everyone"
  ON public.daily_challenges FOR SELECT
  USING (true);

-- ACHIEVEMENTS policies (read-only)
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- USER ACHIEVEMENTS policies
CREATE POLICY "User achievements are viewable by everyone"
  ON public.user_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile stats after game
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    games_played = games_played + 1,
    total_score = total_score + NEW.score,
    highest_score = GREATEST(highest_score, NEW.score),
    longest_word = CASE
      WHEN NEW.longest_word IS NOT NULL AND (longest_word IS NULL OR LENGTH(NEW.longest_word) > LENGTH(longest_word))
      THEN NEW.longest_word
      ELSE longest_word
    END,
    xp = xp + (NEW.score / 10), -- 1 XP per 10 points
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats when score is inserted
DROP TRIGGER IF EXISTS on_score_created ON public.scores;
CREATE TRIGGER on_score_created
  AFTER INSERT ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats();

-- Function to calculate user level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount BIGINT)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  -- Level 1: 0 XP, Level 2: 100 XP, Level 3: 400 XP, Level 4: 900 XP, etc.
  RETURN FLOOR(SQRT(xp_amount / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- SEED ACHIEVEMENTS
-- ============================================
INSERT INTO public.achievements (id, name_da, name_en, description_da, description_en, icon, xp_reward, category) VALUES
  ('first_game', 'Første Spil', 'First Game', 'Spil dit første spil', 'Play your first game', '🎮', 10, 'special'),
  ('score_100', 'Hundrede Point', 'Century', 'Scor 100 point i ét spil', 'Score 100 points in a single game', '💯', 20, 'score'),
  ('score_500', 'Høj Scorer', 'High Scorer', 'Scor 500 point i ét spil', 'Score 500 points in a single game', '🌟', 50, 'score'),
  ('score_1000', 'Mester Scorer', 'Master Scorer', 'Scor 1000 point i ét spil', 'Score 1000 points in a single game', '🏆', 100, 'score'),
  ('word_6', 'Ordsmeden', 'Wordsmith', 'Find et ord med 6+ bogstaver', 'Find a word with 6+ letters', '📝', 30, 'words'),
  ('word_8', 'Ordfinder', 'Word Finder', 'Find et ord med 8+ bogstaver', 'Find a word with 8+ letters', '📚', 50, 'words'),
  ('word_10', 'Ordmester', 'Word Master', 'Find et ord med 10+ bogstaver', 'Find a word with 10+ letters', '👑', 100, 'words'),
  ('streak_7', 'Uge Streak', 'Week Streak', 'Spil 7 dage i træk', 'Play 7 days in a row', '🔥', 70, 'streak'),
  ('streak_30', 'Måneds Streak', 'Month Streak', 'Spil 30 dage i træk', 'Play 30 days in a row', '⚡', 300, 'streak'),
  ('games_10', 'Dedikeret', 'Dedicated', 'Spil 10 spil', 'Play 10 games', '🎯', 25, 'special'),
  ('games_100', 'Veteran', 'Veteran', 'Spil 100 spil', 'Play 100 games', '🎖️', 100, 'special')
ON CONFLICT (id) DO NOTHING;
