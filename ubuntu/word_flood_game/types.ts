export interface Letter {
  id: string;
  char: string;
  isBonus?: boolean; // Added for bonus letter
}

export type Board = (Letter | null)[][];

export interface ScoreEntry {
  score: number;
  timestamp: number; // Unix timestamp (milliseconds since epoch)
}

export interface GameState {
  board: Board;
  currentWord: Letter[];
  score: number;
  foundWords: string[];
  isGameOver: boolean;
  boardSize: { rows: number; cols: number };
  isLoading: boolean; 
  errorMessage: string | null;
  isWordListLoading: boolean; 
  wordListErrorMessage: string | null;
  bonusLetterCountdown: number; // Added for bonus letter logic
}

export interface User {
  username: string;
}

