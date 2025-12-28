export interface Letter {
  id: string;
  char: string;
  isBonus: boolean;
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

