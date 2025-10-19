import { Board, Letter, GameState } from "../types";
import { v4 as uuidv4 } from 'uuid';

const DANISH_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ";
const MIN_WORD_LENGTH = 3;
const BONUS_LETTER_MIN_INTERVAL = 10;
const BONUS_LETTER_MAX_INTERVAL = 30;

// --- Local Word List Logic ---
let wordSet: Set<string> | null = null;
let isLoadingWordList = false;
let wordListError: string | null = null;

async function fetchWordList(): Promise<Set<string>> {
  const response = await fetch('/assets/danish_words.txt');
  if (!response.ok) {
    throw new Error(`Failed to load word list: ${response.statusText}`);
  }
  const text = await response.text();
  const words = text.split(/\r?\n/).map(word => word.trim().toLowerCase()).filter(word => word.length >= MIN_WORD_LENGTH);
  return new Set(words);
}

export async function initializeWordList(): Promise<void> {
  if (wordSet || isLoadingWordList) {
    return;
  }
  isLoadingWordList = true;
  wordListError = null;
  try {
    wordSet = await fetchWordList();
    console.log(`Danish word list loaded successfully. ${wordSet.size} words.`);
  } catch (error) {
    console.error("Error initializing word list:", error);
    wordListError = error instanceof Error ? error.message : "Unknown error loading word list";
    wordSet = new Set(); 
  }
  isLoadingWordList = false;
}
// --- End of Local Word List Logic ---

const getRandomBonusCountdown = (): number => {
  return Math.floor(Math.random() * (BONUS_LETTER_MAX_INTERVAL - BONUS_LETTER_MIN_INTERVAL + 1)) + BONUS_LETTER_MIN_INTERVAL;
};

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
    isWordListLoading: true, 
    wordListErrorMessage: wordListError,
    bonusLetterCountdown: getRandomBonusCountdown(),
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

const calculateScore = (word: string, hasBonusLetter: boolean): number => {
  if (word.length < MIN_WORD_LENGTH) return 0;
  let score = word.length;
  if (word.length > 4) score += (word.length - 4) * 2; 
  return hasBonusLetter ? score * 2 : score;
};

export const validateDanishWord = (word: string): boolean => {
  if (!wordSet) {
    console.error("Word list not initialized yet.");
    return false; 
  }
  if (word.length < MIN_WORD_LENGTH) return false;
  return wordSet.has(word.toLowerCase());
};

export const submitWord = (state: GameState): GameState => {
  if (state.currentWord.length < MIN_WORD_LENGTH) {
    return { ...state, errorMessage: "Ordet skal være mindst 3 bogstaver langt.", currentWord: [] };
  }
  if (!wordSet || isLoadingWordList) {
    return { ...state, errorMessage: "Ordbogen indlæses stadig, prøv igen om et øjeblik.", currentWord: [] };
  }
  if (wordListError && !wordSet.size) { 
     return { ...state, errorMessage: `Fejl ved indlæsning af ordbog: ${wordListError}. Kan ikke validere ord.`, currentWord: [] };
  }

  const submittedWordString = state.currentWord.map(l => l.char).join("");
  const isValidWord = validateDanishWord(submittedWordString);

  if (!isValidWord) {
    return {
      ...state,
      currentWord: [], 
      errorMessage: `"${submittedWordString.toUpperCase()}" er ikke et gyldigt dansk ord.`,
    };
  }

  const hasBonusLetterInWord = state.currentWord.some(letter => letter.isBonus);

  const newBoard = state.board.map(row =>
    row.map(letter => {
      if (letter && state.currentWord.find(l => l.id === letter.id)) {
        return null; 
      }
      return letter;
    })
  );

  const wordScore = calculateScore(submittedWordString, hasBonusLetterInWord);

  return {
    ...state,
    board: newBoard, 
    foundWords: [...state.foundWords, submittedWordString.toUpperCase()],
    currentWord: [],
    score: state.score + wordScore,
    errorMessage: null, 
  };
};

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
  const randomChar = DANISH_ALPHABET[Math.floor(Math.random() * DANISH_ALPHABET.length)];
  
  let newBonusLetterCountdown = state.bonusLetterCountdown - 1;
  let isNewLetterBonus = false;

  if (newBonusLetterCountdown <= 0) {
    isNewLetterBonus = true;
    newBonusLetterCountdown = getRandomBonusCountdown();
    // Remove any existing bonus letters from the board to ensure only one at a time
    for (let i = 0; i < state.boardSize.rows; i++) {
      for (let j = 0; j < state.boardSize.cols; j++) {
        if (newBoard[i][j] && newBoard[i][j]?.isBonus) {
          newBoard[i][j] = { ...newBoard[i][j]!, isBonus: false };
        }
      }
    }
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

  return { 
    ...state, 
    board: newBoard, 
    isGameOver: isNowFull,
    bonusLetterCountdown: newBonusLetterCountdown,
  };
};

