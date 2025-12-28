// Earnable power-ups that players can activate at will
export type PowerUpType = 'nuke' | 'shuffle' | 'timeFreeze';

export interface PowerUps {
  nuke: number;      // Clears entire board
  shuffle: number;   // Rearranges all letters
  timeFreeze: number; // Freezes spawning for 10 seconds
}

// Special letter types
export type LetterType =
  | 'normal'      // Regular letter
  | 'bonus2x'     // 2x multiplier (existing isBonus)
  | 'bonus3x'     // 3x multiplier
  | 'bomb'        // Clears 3x3 area when used
  | 'wild'        // Can be any letter (wildcard)
  | 'ice'         // Freezes timer for 5 seconds when used
  | 'chain'       // Clears adjacent letters when used
  | 'tickingBomb' // Explodes if not used in time
  | 'locked';     // Can only be removed by using in a word

export interface Letter {
  id: string;
  char: string;
  isBonus: boolean; // Legacy - kept for compatibility, use letterType instead
  letterType: LetterType;
  row: number; // Position on board (for bomb/chain effects)
  col: number;
  tickingBombTimer?: number; // Seconds remaining before explosion (for tickingBomb type)
  createdAt?: number; // Timestamp for ticking bomb countdown
  wildCardAssignment?: string; // The letter assigned to a wild card (when selected in currentWord)
}

export type Board = (Letter | null)[][];

export interface GameState {
  board: Board;
  currentWord: Letter[];
  score: number;
  foundWords: string[];
  isGameOver: boolean;
  boardSize: { rows: number; cols: number };
  isLoading: boolean; // Used for word submission validation via Supabase RPC
  errorMessage: string | null;
  isWordListLoading: boolean; // Legacy - kept for compatibility but always false now (server-side validation)
  wordListErrorMessage: string | null; // Legacy - kept for compatibility
  normalLettersSinceLastBonus: number; // Tæller for bonusbogstavslogik
  nextBonusIn: number; // Antal normale bogstaver før næste bonus

  // Power-up and streak tracking
  isFrozen: boolean; // Timer is frozen (from ice letter)
  freezeEndTime: number | null; // When freeze ends (timestamp)
  wordStreak: number; // Consecutive valid words submitted
  lastWordTime: number | null; // Timestamp of last word submission

  // Special letter spawn tracking
  lettersSinceSpecial: number; // Letters since last special (non-bonus) letter
  nextSpecialIn: number; // Letters until next special spawns

  // Earnable power-ups
  powerUps: PowerUps;
  pendingPowerUp: PowerUpType | null; // Power-up just earned (for animation/notification)

  // Tykke (dog) helper - random event that clears the board once per game
  tykkeUsed: boolean;
  tykkeActive: boolean; // Currently showing Tykke animation
}

export interface User {
  id: string;
  username: string;
  email?: string;
}

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  games_played: number;
  total_score: number;
  highest_score: number;
  longest_word: string | null;
  current_streak: number;
  longest_streak: number;
  last_played_at: string | null;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface ScoreEntry {
  id: string;
  user_id: string;
  score: number;
  words_found: string[];
  word_count: number;
  longest_word: string | null;
  game_mode: string;
  difficulty: string;
  duration_seconds: number | null;
  created_at: string;
  daily_date: string | null;
  // Joined from profiles
  profiles?: {
    username: string | null;
    display_name: string | null;
  };
}

// Game mode type
export type GameMode = 'endless' | 'daily';

// Daily challenge types
export interface DailyChallenge {
  challenge_date: string;
  seed: string;
  language: 'da' | 'en';
}

export interface DailyChallengeAttempt {
  id: string;
  user_id: string;
  challenge_date: string;
  language: 'da' | 'en';
  score: number;
  words_found: string[];
  word_count: number;
  longest_word: string | null;
  completed_at: string;
  // Joined from profiles
  profiles?: {
    username: string | null;
    display_name: string | null;
  };
}

// Share result types
export interface ShareableResult {
  score: number;
  wordCount: number;
  longestWord: string | null;
  date: string;
  language: 'da' | 'en';
  gameMode: GameMode;
  rank?: number;
}

