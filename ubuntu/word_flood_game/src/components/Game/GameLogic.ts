import { Board, Letter, GameState } from "../../types";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "../../SupabaseClient";

// Danish letter frequency-based weighted selection
// Vowels (A, E, I, O, U, Y, Æ, Ø, Å) are more common and weighted higher
const WEIGHTED_LETTERS = [
  // Vowels - high frequency
  'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E',  // ~17% - most common in Danish
  'A', 'A', 'A', 'A', 'A', 'A', 'A',                  // ~8%
  'I', 'I', 'I', 'I', 'I', 'I',                       // ~7%
  'O', 'O', 'O', 'O', 'O',                            // ~5%
  'N', 'N', 'N', 'N', 'N', 'N', 'N',                  // ~7% - common consonant
  'R', 'R', 'R', 'R', 'R', 'R', 'R',                  // ~8%
  'T', 'T', 'T', 'T', 'T', 'T',                       // ~6%
  'S', 'S', 'S', 'S', 'S', 'S',                       // ~6%
  'D', 'D', 'D', 'D', 'D',                            // ~5%
  'L', 'L', 'L', 'L', 'L',                            // ~5%
  'G', 'G', 'G', 'G',                                  // ~4%
  'K', 'K', 'K', 'K',                                  // ~4%
  'M', 'M', 'M', 'M',                                  // ~4%
  'U', 'U', 'U',                                       // ~2%
  'B', 'B', 'B',                                       // ~2%
  'F', 'F', 'F',                                       // ~2%
  'V', 'V', 'V',                                       // ~2%
  'H', 'H', 'H',                                       // ~2%
  'P', 'P',                                            // ~1%
  'Y', 'Y',                                            // ~1%
  'Æ', 'Æ',                                            // ~1%
  'Ø', 'Ø',                                            // ~1%
  'Å', 'Å',                                            // ~1%
  'J', 'J',                                            // ~1%
  'C',                                                 // rare
  'W',                                                 // rare
  'X',                                                 // rare
  'Z',                                                 // rare
  'Q',                                                 // very rare
];

const MIN_WORD_LENGTH = 3;

// --- Server-side Word Validation via Supabase RPC ---
// No more client-side dictionary loading - validation happens on the server

export async function initializeWordList(): Promise<void> {
  // No-op: We no longer load a dictionary client-side
  // Word validation is now done via Supabase RPC
  console.log("Word validation ready (server-side via Supabase RPC)");
}

export const createInitialBoard = (rows: number, cols: number): Board => {
  const board: Board = [];
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < cols; j++) {
      board[i][j] = null; 
    }
  }
  return board;
};

export const initializeGameState = (rows: number, cols: number): GameState => {
  return {
    board: createInitialBoard(rows, cols),
    currentWord: [],
    score: 0,
    foundWords: [],
    isGameOver: false,
    boardSize: { rows, cols },
    isLoading: false,
    errorMessage: null,
    isWordListLoading: false, // No longer loading - server-side validation is instant
    wordListErrorMessage: null,
    normalLettersSinceLastBonus: 0,
    nextBonusIn: 10 + Math.floor(Math.random() * 21), // Tilfældigt mellem 10 og 30
  };
};

export const handleLetterClick = (state: GameState, clickedLetter: Letter): GameState => {
  if (state.currentWord.find(l => l.id === clickedLetter.id)) {
    return state; 
  }
  return {
    ...state,
    currentWord: [...state.currentWord, clickedLetter],
  };
};

export const clearCurrentWord = (state: GameState): GameState => {
  return {
    ...state,
    currentWord: [],
  };
};

const calculateScore = (wordLetters: Letter[]): number => {
  const word = wordLetters.map(l => l.char).join("");
  if (word.length < MIN_WORD_LENGTH) return 0;
  
  let score = word.length;
  if (word.length > 4) score += (word.length - 4) * 2; 

  const hasBonusLetter = wordLetters.some(letter => letter.isBonus);
  if (hasBonusLetter) {
    score *= 2;
  }
  
  return score;
};

// Server-side word validation using Supabase RPC
export const validateDanishWord = async (word: string): Promise<boolean> => {
  if (word.length < MIN_WORD_LENGTH) return false;

  try {
    const { data, error } = await supabase.rpc('validate_word', {
      word_to_check: word.toLowerCase()
    });

    if (error) {
      console.error("Error validating word:", error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error("Error calling validate_word RPC:", err);
    return false;
  }
};

export const submitWord = async (state: GameState): Promise<GameState> => {
  if (state.currentWord.length < MIN_WORD_LENGTH) {
    return { ...state, errorMessage: "Ordet skal være mindst 3 bogstaver langt.", currentWord: [] };
  }

  const submittedWordString = state.currentWord.map(l => l.char).join("");

  // Server-side validation via Supabase RPC
  const isValidWord = await validateDanishWord(submittedWordString);

  if (!isValidWord) {
    return {
      ...state,
      currentWord: [],
      errorMessage: `"${submittedWordString.toUpperCase()}" er ikke et gyldigt dansk ord.`,
    };
  }

  // Clear submitted letters from the board - NO GRAVITY
  const newBoard = state.board.map(row =>
    row.map(letter => {
      if (letter && state.currentWord.find(l => l.id === letter.id)) {
        return null; // Make the cell empty
      }
      return letter;
    })
  );

  const wordScore = calculateScore(state.currentWord);

  return {
    ...state,
    board: newBoard,
    foundWords: [...state.foundWords, submittedWordString.toUpperCase()],
    currentWord: [],
    score: state.score + wordScore,
    errorMessage: null,
  };
};

// Gravity function is no longer used by submitWord, but kept for potential future use or other mechanics
// const applyGravity = (board: Board, rows: number, cols: number): Board => { ... };

export const addLetterToBoard = (state: GameState): GameState => {
  if (state.isGameOver) return state;

  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < state.boardSize.rows; r++) {
    for (let c = 0; c < state.boardSize.cols; c++) {
      if (state.board[r][c] === null) {
        emptyCells.push({ r, c });
      }
    }
  }

  if (emptyCells.length === 0) {
    return { ...state, isGameOver: true };
  }

  const randomEmptyCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const { r, c } = randomEmptyCell;

  const newBoard = state.board.map(row => [...row]);
  const randomChar = WEIGHTED_LETTERS[Math.floor(Math.random() * WEIGHTED_LETTERS.length)];
  
  let isNewLetterBonus = false;
  let updatedNormalLettersSinceLastBonus = state.normalLettersSinceLastBonus + 1;
  let updatedNextBonusIn = state.nextBonusIn;

  if (updatedNormalLettersSinceLastBonus >= state.nextBonusIn) {
    isNewLetterBonus = true;
    updatedNormalLettersSinceLastBonus = 0;
    updatedNextBonusIn = 10 + Math.floor(Math.random() * 21); // Nyt interval for næste bonus
  }

  newBoard[r][c] = { id: uuidv4(), char: randomChar, isBonus: isNewLetterBonus };
  
  let isNowFull = true;
  for (let i = 0; i < state.boardSize.rows; i++) {
    for (let j = 0; j < state.boardSize.cols; j++) {
      if (newBoard[i][j] === null) {
        isNowFull = false;
        break;
      }
    }
    if (!isNowFull) break;
  }
  console.log("[GameLogic/addLetterToBoard] Setting isGameOver to:", isNowFull, "Empty cells remaining:", emptyCells.length -1 ); // -1 because we just filled one

  return { 
    ...state, 
    board: newBoard, 
    isGameOver: isNowFull,
    normalLettersSinceLastBonus: updatedNormalLettersSinceLastBonus,
    nextBonusIn: updatedNextBonusIn,
  };
};

