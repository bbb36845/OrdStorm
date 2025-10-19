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
  isLoading: boolean; // Used for word submission validation (previously API, now local but can keep for UI consistency)
  errorMessage: string | null;
  isWordListLoading: boolean; // Tracks if the local word list is being loaded
  wordListErrorMessage: string | null; // Stores any error message from loading the word list
  normalLettersSinceLastBonus: number; // Tæller for bonusbogstavslogik
  nextBonusIn: number; // Antal normale bogstaver før næste bonus
}

export interface User {
  username: string;
}

export interface ScoreEntry {
  username: string; // Altid til stede fra vores select
  score: number;
  created_at: string; // ISO dato-streng fra Supabase
  // timestamp feltet er fjernet
}

