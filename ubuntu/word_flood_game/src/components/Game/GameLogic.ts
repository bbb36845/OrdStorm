import { Board, Letter, GameState, LetterType, PowerUpType } from "../../types";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "../../SupabaseClient";

// Danish letter frequency-based weighted selection
const DANISH_WEIGHTED_LETTERS = [
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

// English letter frequency-based weighted selection (no Æ, Ø, Å)
const ENGLISH_WEIGHTED_LETTERS = [
  // Vowels - high frequency
  'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E',  // ~12% - most common in English
  'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A',                       // ~8%
  'I', 'I', 'I', 'I', 'I', 'I', 'I',                            // ~7%
  'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O',                       // ~8%
  'U', 'U', 'U',                                                 // ~3%
  // Consonants
  'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T',                  // ~9%
  'N', 'N', 'N', 'N', 'N', 'N', 'N',                            // ~7%
  'S', 'S', 'S', 'S', 'S', 'S',                                 // ~6%
  'R', 'R', 'R', 'R', 'R', 'R',                                 // ~6%
  'H', 'H', 'H', 'H', 'H', 'H',                                 // ~6%
  'L', 'L', 'L', 'L',                                           // ~4%
  'D', 'D', 'D', 'D',                                           // ~4%
  'C', 'C', 'C',                                                 // ~3%
  'M', 'M', 'M',                                                 // ~3%
  'F', 'F', 'F',                                                 // ~2%
  'W', 'W', 'W',                                                 // ~2%
  'G', 'G', 'G',                                                 // ~2%
  'Y', 'Y', 'Y',                                                 // ~2%
  'P', 'P', 'P',                                                 // ~2%
  'B', 'B',                                                      // ~1%
  'V', 'V',                                                      // ~1%
  'K', 'K',                                                      // ~1%
  'J',                                                           // rare
  'X',                                                           // rare
  'Q',                                                           // rare
  'Z',                                                           // rare
];

// Get weighted letters based on language
export const getWeightedLetters = (language: 'da' | 'en'): string[] => {
  return language === 'en' ? ENGLISH_WEIGHTED_LETTERS : DANISH_WEIGHTED_LETTERS;
};

const MIN_WORD_LENGTH = 3;

// Special letter spawn rates (percentage chance when spawning a special)
// Balanced to help players survive longer (Tetris-style gameplay)
const SPECIAL_LETTER_WEIGHTS: { type: LetterType; weight: number }[] = [
  { type: 'bomb', weight: 28 },         // 28% - Clears 3x3 area (most helpful!)
  { type: 'bonus2x', weight: 22 },      // 22% - 2x multiplier
  { type: 'chain', weight: 15 },        // 15% - Chain clear (helpful)
  { type: 'ice', weight: 12 },          // 12% - Freezes timer (breathing room)
  { type: 'bonus3x', weight: 10 },      // 10% - 3x multiplier
  { type: 'wild', weight: 8 },          // 8% - Wildcard letter
  { type: 'tickingBomb', weight: 5 },   // 5% - Ticking bomb (risk/reward, reduced)
];

// Ticking bomb settings
const TICKING_BOMB_DURATION = 15; // seconds before explosion

// Streak bonus settings
const STREAK_TIMEOUT = 8000; // 8 seconds between words to maintain streak
const STREAK_BONUS_THRESHOLD = 3; // 3+ words in a row for bonus

// --- Server-side Word Validation via Supabase RPC ---
export async function initializeWordList(): Promise<void> {
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
    isWordListLoading: false,
    wordListErrorMessage: null,
    normalLettersSinceLastBonus: 0,
    nextBonusIn: 10 + Math.floor(Math.random() * 21),
    // New power-up and streak tracking
    isFrozen: false,
    freezeEndTime: null,
    wordStreak: 0,
    lastWordTime: null,
    lettersSinceSpecial: 0,
    nextSpecialIn: 8 + Math.floor(Math.random() * 11), // Special every 8-18 letters (more frequent for longer games)
    // Earnable power-ups
    powerUps: { nuke: 0, shuffle: 0, timeFreeze: 0 },
    pendingPowerUp: null,
  };
};

// Helper function to select a random special letter type based on weights
const selectRandomSpecialType = (): LetterType => {
  const totalWeight = SPECIAL_LETTER_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of SPECIAL_LETTER_WEIGHTS) {
    random -= item.weight;
    if (random <= 0) {
      return item.type;
    }
  }
  return 'bonus2x'; // Fallback
};

// Create a letter with specified type
const createLetter = (char: string, row: number, col: number, letterType: LetterType): Letter => {
  const letter: Letter = {
    id: uuidv4(),
    char,
    isBonus: letterType === 'bonus2x' || letterType === 'bonus3x', // Legacy compatibility
    letterType,
    row,
    col,
  };

  // Add ticking bomb timer if applicable
  if (letterType === 'tickingBomb') {
    letter.tickingBombTimer = TICKING_BOMB_DURATION;
    letter.createdAt = Date.now();
  }

  return letter;
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

// Calculate score with all special letter bonuses
const calculateScore = (wordLetters: Letter[], wordStreak: number): number => {
  const word = wordLetters.map(l => l.char).join("");
  if (word.length < MIN_WORD_LENGTH) return 0;

  // Base score
  let score = word.length;

  // Length bonus for longer words
  if (word.length >= 6) score += (word.length - 5) * 3; // +3 per letter over 5
  else if (word.length > 4) score += (word.length - 4) * 2;

  // Special letter multipliers
  let multiplier = 1;

  for (const letter of wordLetters) {
    switch (letter.letterType) {
      case 'bonus2x':
        multiplier = Math.max(multiplier, 2);
        break;
      case 'bonus3x':
        multiplier = Math.max(multiplier, 3);
        break;
      case 'bomb':
      case 'chain':
        // These give bonus points in addition to their effects
        score += 5;
        break;
      case 'ice':
        score += 3;
        break;
      case 'tickingBomb':
        // High risk, high reward - bonus for using it before explosion
        score += 10;
        multiplier = Math.max(multiplier, 2);
        break;
      case 'wild':
        // Wild cards are valuable
        score += 2;
        break;
    }
  }

  // Apply multiplier
  score *= multiplier;

  // Streak bonus (3+ consecutive words)
  if (wordStreak >= STREAK_BONUS_THRESHOLD) {
    const streakMultiplier = 1 + (wordStreak - STREAK_BONUS_THRESHOLD + 1) * 0.25; // +25% per streak level
    score = Math.floor(score * streakMultiplier);
  }

  // Long word bonus
  if (word.length >= 8) {
    score *= 3; // 8+ letters = 3x
  } else if (word.length >= 6) {
    score *= 2; // 6-7 letters = 2x
  }

  // Danish special vowels bonus (Æ, Ø, Å)
  const danishVowels = ['Æ', 'Ø', 'Å'];
  const usedDanishVowels = danishVowels.filter(v => word.includes(v));
  if (usedDanishVowels.length >= 2) {
    score += 10 * usedDanishVowels.length; // +10 per Danish vowel used (if 2+)
  }

  return score;
};

// Clear a 3x3 area around a position (for bomb effect)
const clearArea = (board: Board, centerRow: number, centerCol: number, rows: number, cols: number): Board => {
  const newBoard = board.map(row => [...row]);

  for (let r = centerRow - 1; r <= centerRow + 1; r++) {
    for (let c = centerCol - 1; c <= centerCol + 1; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const letter = newBoard[r][c];
        // Don't clear locked letters with bomb
        if (letter && letter.letterType !== 'locked') {
          newBoard[r][c] = null;
        }
      }
    }
  }

  return newBoard;
};

// Clear all adjacent letters (for chain effect)
const clearAdjacent = (board: Board, centerRow: number, centerCol: number, rows: number, cols: number): Board => {
  const newBoard = board.map(row => [...row]);
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal
    [-1, -1], [-1, 1], [1, -1], [1, 1], // Diagonal
  ];

  for (const [dr, dc] of directions) {
    const r = centerRow + dr;
    const c = centerCol + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      const letter = newBoard[r][c];
      if (letter && letter.letterType !== 'locked') {
        newBoard[r][c] = null;
      }
    }
  }

  return newBoard;
};

// Validation result type to distinguish between invalid words and network errors
export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: 'invalid_word' }
  | { valid: false; reason: 'network_error' };

// Server-side word validation using Supabase RPC with retry logic
export const validateWord = async (word: string, language: 'da' | 'en' = 'da'): Promise<boolean> => {
  const result = await validateWordWithRetry(word, language);
  return result.valid;
};

// Enhanced validation with retry and error distinction
export const validateWordWithRetry = async (
  word: string,
  language: 'da' | 'en' = 'da',
  maxRetries: number = 2
): Promise<ValidationResult> => {
  if (word.length < MIN_WORD_LENGTH) {
    console.log(`[WordValidation] Word "${word}" too short (min ${MIN_WORD_LENGTH})`);
    return { valid: false, reason: 'invalid_word' };
  }

  const wordLower = word.toLowerCase();
  console.log(`[WordValidation] Validating "${wordLower}" (lang: ${language})`);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.rpc('validate_word', {
        word_to_check: wordLower,
        lang: language
      });

      if (error) {
        console.error(`[WordValidation] RPC error (attempt ${attempt + 1}):`, error);
        lastError = new Error(error.message);
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
        }
        continue;
      }

      // Successful response - return the result
      console.log(`[WordValidation] Result for "${wordLower}": ${data === true ? 'VALID' : 'INVALID'}`);
      if (data === true) {
        return { valid: true };
      } else {
        return { valid: false, reason: 'invalid_word' };
      }
    } catch (err) {
      console.error(`[WordValidation] Exception (attempt ${attempt + 1}):`, err);
      lastError = err instanceof Error ? err : new Error('Unknown error');
      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
      }
    }
  }

  // All retries failed - this is a network error
  console.error(`[WordValidation] All attempts failed for "${wordLower}":`, lastError);
  return { valid: false, reason: 'network_error' };
};

// Backward compatibility alias
export const validateDanishWord = async (word: string): Promise<boolean> => {
  return validateWord(word, 'da');
};

// Build the actual word string for validation (using wild card assignments)
export const getWordString = (currentWord: Letter[]): string => {
  return currentWord.map(l => {
    if (l.letterType === 'wild' && l.wildCardAssignment) {
      return l.wildCardAssignment;
    }
    return l.char;
  }).join("");
};

// For display purposes, get the word with actual characters (showing wild card assignments)
export const getDisplayWordString = (currentWord: Letter[]): string => {
  return currentWord.map(l => {
    if (l.letterType === 'wild' && l.wildCardAssignment) {
      return l.wildCardAssignment;
    }
    return l.char;
  }).join("");
};

// Check if all wild cards in current word have been assigned
export const hasUnassignedWildCards = (currentWord: Letter[]): boolean => {
  return currentWord.some(l => l.letterType === 'wild' && !l.wildCardAssignment);
};

// Assign a letter to a wild card
export const assignWildCardLetter = (state: GameState, wildCardId: string, letter: string): GameState => {
  return {
    ...state,
    currentWord: state.currentWord.map(l =>
      l.id === wildCardId ? { ...l, wildCardAssignment: letter } : l
    ),
  };
};

export interface SubmitWordOptions {
  language?: 'da' | 'en';
  errorMessages?: {
    tooShort: string;
    wildcardFirst: string;
    invalidWord: (word: string) => string;
    networkError: string;
  };
}

const DEFAULT_ERROR_MESSAGES = {
  tooShort: "Ordet skal være mindst 3 bogstaver langt.",
  wildcardFirst: "Vælg et bogstav for jokeren først.",
  invalidWord: (word: string) => `"${word}" er ikke et gyldigt dansk ord.`,
  networkError: "Kunne ikke validere ordet. Prøv igen.",
};

export const submitWord = async (state: GameState, options: SubmitWordOptions = {}): Promise<GameState> => {
  const { language = 'da', errorMessages = DEFAULT_ERROR_MESSAGES } = options;

  if (state.currentWord.length < MIN_WORD_LENGTH) {
    return { ...state, errorMessage: errorMessages.tooShort, currentWord: [] };
  }

  // Check if all wild cards have been assigned
  if (hasUnassignedWildCards(state.currentWord)) {
    return { ...state, errorMessage: errorMessages.wildcardFirst };
  }

  // Get the word string (with wild card assignments)
  const submittedWordString = getWordString(state.currentWord);
  const displayWordString = getDisplayWordString(state.currentWord);

  // Debug: Log the letters being submitted
  console.log(`[SubmitWord] Letters:`, state.currentWord.map(l => ({
    char: l.char,
    type: l.letterType,
    wildAssign: l.wildCardAssignment
  })));
  console.log(`[SubmitWord] Word string: "${submittedWordString}" (display: "${displayWordString}")`);

  // Server-side validation via Supabase RPC with retry
  const validationResult = await validateWordWithRetry(submittedWordString, language);

  if (!validationResult.valid) {
    if (validationResult.reason === 'network_error') {
      // Network error - don't clear the word, let user try again
      return {
        ...state,
        errorMessage: errorMessages.networkError,
      };
    }
    // Invalid word - reset streak and clear word
    return {
      ...state,
      currentWord: [],
      wordStreak: 0,
      errorMessage: errorMessages.invalidWord(displayWordString.toUpperCase()),
    };
  }

  // Process special letter effects
  let newBoard = state.board.map(row => [...row]);
  const { rows, cols } = state.boardSize;

  // Check for special effects
  let shouldFreeze = false;

  for (const letter of state.currentWord) {
    switch (letter.letterType) {
      case 'bomb':
        // Clear 3x3 area around the bomb
        newBoard = clearArea(newBoard, letter.row, letter.col, rows, cols);
        break;
      case 'chain':
        // Clear adjacent letters
        newBoard = clearAdjacent(newBoard, letter.row, letter.col, rows, cols);
        break;
      case 'ice':
        shouldFreeze = true;
        break;
    }
  }

  // Clear submitted letters from the board
  newBoard = newBoard.map(row =>
    row.map(letter => {
      if (letter && state.currentWord.find(l => l.id === letter.id)) {
        return null;
      }
      return letter;
    })
  );

  // Update streak
  const now = Date.now();
  const timeSinceLastWord = state.lastWordTime ? now - state.lastWordTime : 0;
  const newStreak = (state.lastWordTime && timeSinceLastWord < STREAK_TIMEOUT)
    ? state.wordStreak + 1
    : 1;

  const wordScore = calculateScore(state.currentWord, newStreak);

  // Check for earned power-ups based on word length and streak
  const wordLength = submittedWordString.length;
  const earnedPowerUps = { ...state.powerUps };
  let pendingPowerUp: PowerUpType | null = null;

  // Word length rewards (only award one per word, prioritize rarest)
  if (wordLength >= 7) {
    earnedPowerUps.nuke += 1;
    pendingPowerUp = 'nuke';
  } else if (wordLength >= 6) {
    earnedPowerUps.shuffle += 1;
    pendingPowerUp = 'shuffle';
  } else if (wordLength >= 5) {
    earnedPowerUps.timeFreeze += 1;
    pendingPowerUp = 'timeFreeze';
  }

  // Streak rewards (can stack with word length rewards)
  if (newStreak === 10) {
    earnedPowerUps.nuke += 1;
    pendingPowerUp = 'nuke'; // Override to show the best reward
  } else if (newStreak === 5) {
    earnedPowerUps.shuffle += 1;
    if (!pendingPowerUp) pendingPowerUp = 'shuffle';
  } else if (newStreak === 3) {
    earnedPowerUps.timeFreeze += 1;
    if (!pendingPowerUp) pendingPowerUp = 'timeFreeze';
  }

  return {
    ...state,
    board: newBoard,
    foundWords: [...state.foundWords, displayWordString.toUpperCase()],
    currentWord: [],
    score: state.score + wordScore,
    errorMessage: null,
    wordStreak: newStreak,
    lastWordTime: now,
    isFrozen: shouldFreeze ? true : state.isFrozen,
    freezeEndTime: shouldFreeze ? Date.now() + 5000 : state.freezeEndTime, // 5 second freeze
    powerUps: earnedPowerUps,
    pendingPowerUp,
  };
};

// Handle ticking bomb explosion (fills surrounding cells)
const handleTickingBombExplosion = (board: Board, bombLetter: Letter, rows: number, cols: number, language: 'da' | 'en' = 'da'): Board => {
  const newBoard = board.map(row => [...row]);
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];

  // Fill empty adjacent cells with random letters
  const weightedLetters = getWeightedLetters(language);
  for (const [dr, dc] of directions) {
    const r = bombLetter.row + dr;
    const c = bombLetter.col + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols && newBoard[r][c] === null) {
      const randomChar = weightedLetters[Math.floor(Math.random() * weightedLetters.length)];
      newBoard[r][c] = createLetter(randomChar, r, c, 'locked'); // Explosion creates locked letters!
    }
  }

  return newBoard;
};

// Update ticking bombs - called every second
export const updateTickingBombs = (state: GameState, language: 'da' | 'en' = 'da'): GameState => {
  const now = Date.now();
  let newBoard = state.board.map(row => [...row]);
  let hasExplosion = false;

  for (let r = 0; r < state.boardSize.rows; r++) {
    for (let c = 0; c < state.boardSize.cols; c++) {
      const letter = newBoard[r][c];
      if (letter && letter.letterType === 'tickingBomb' && letter.createdAt) {
        const elapsed = (now - letter.createdAt) / 1000;
        const remaining = TICKING_BOMB_DURATION - elapsed;

        if (remaining <= 0) {
          // Bomb explodes!
          newBoard = handleTickingBombExplosion(newBoard, letter, state.boardSize.rows, state.boardSize.cols, language);
          // Remove the bomb itself
          newBoard[r][c] = null;
          hasExplosion = true;
        } else {
          // Update timer display
          newBoard[r][c] = { ...letter, tickingBombTimer: Math.ceil(remaining) };
        }
      }
    }
  }

  if (hasExplosion) {
    // Check if board is now full
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
      errorMessage: "💥 Tikkende bombe eksploderede!",
    };
  }

  return { ...state, board: newBoard };
};

// Check and update freeze status
export const updateFreezeStatus = (state: GameState): GameState => {
  if (state.isFrozen && state.freezeEndTime && Date.now() >= state.freezeEndTime) {
    return {
      ...state,
      isFrozen: false,
      freezeEndTime: null,
    };
  }
  return state;
};

export const addLetterToBoard = (state: GameState, language: 'da' | 'en' = 'da'): GameState => {
  if (state.isGameOver) return state;

  // Don't add letters if frozen
  if (state.isFrozen) return state;

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
  const weightedLetters = getWeightedLetters(language);
  const randomChar = weightedLetters[Math.floor(Math.random() * weightedLetters.length)];

  // Determine letter type
  let letterType: LetterType = 'normal';
  let updatedNormalLettersSinceLastBonus = state.normalLettersSinceLastBonus + 1;
  let updatedNextBonusIn = state.nextBonusIn;
  let updatedLettersSinceSpecial = state.lettersSinceSpecial + 1;
  let updatedNextSpecialIn = state.nextSpecialIn;

  // Check for bonus (2x) letter - legacy system
  if (updatedNormalLettersSinceLastBonus >= state.nextBonusIn) {
    letterType = 'bonus2x';
    updatedNormalLettersSinceLastBonus = 0;
    updatedNextBonusIn = 10 + Math.floor(Math.random() * 21);
  }
  // Check for special letter (overrides bonus if triggered)
  else if (updatedLettersSinceSpecial >= state.nextSpecialIn) {
    letterType = selectRandomSpecialType();
    updatedLettersSinceSpecial = 0;
    updatedNextSpecialIn = 8 + Math.floor(Math.random() * 11); // 8-18 letters until next special
    // Reset bonus counter if we spawned a bonus-type special
    if (letterType === 'bonus2x' || letterType === 'bonus3x') {
      updatedNormalLettersSinceLastBonus = 0;
      updatedNextBonusIn = 10 + Math.floor(Math.random() * 21);
    }
  }

  // Wild cards show a special character
  const displayChar = letterType === 'wild' ? '?' : randomChar;

  newBoard[r][c] = createLetter(displayChar, r, c, letterType);

  // Check if board is full
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
    normalLettersSinceLastBonus: updatedNormalLettersSinceLastBonus,
    nextBonusIn: updatedNextBonusIn,
    lettersSinceSpecial: updatedLettersSinceSpecial,
    nextSpecialIn: updatedNextSpecialIn,
  };
};

// ============================================
// POWER-UP ACTIVATION FUNCTIONS
// ============================================

// Activate NUKE - clears entire board
export const activateNuke = (state: GameState): GameState => {
  if (state.powerUps.nuke <= 0 || state.isGameOver) return state;

  // Clear the entire board
  const newBoard = createInitialBoard(state.boardSize.rows, state.boardSize.cols);

  return {
    ...state,
    board: newBoard,
    powerUps: { ...state.powerUps, nuke: state.powerUps.nuke - 1 },
    pendingPowerUp: null,
    errorMessage: null,
  };
};

// Activate SHUFFLE - rearranges all letters randomly
export const activateShuffle = (state: GameState): GameState => {
  if (state.powerUps.shuffle <= 0 || state.isGameOver) return state;

  // Collect all letters
  const letters: Letter[] = [];
  for (let r = 0; r < state.boardSize.rows; r++) {
    for (let c = 0; c < state.boardSize.cols; c++) {
      if (state.board[r][c]) {
        letters.push(state.board[r][c]!);
      }
    }
  }

  // Shuffle letters array (Fisher-Yates)
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  // Place letters back in random positions
  const newBoard = createInitialBoard(state.boardSize.rows, state.boardSize.cols);
  const positions: { r: number; c: number }[] = [];

  for (let r = 0; r < state.boardSize.rows; r++) {
    for (let c = 0; c < state.boardSize.cols; c++) {
      positions.push({ r, c });
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Place letters in shuffled positions
  letters.forEach((letter, idx) => {
    const pos = positions[idx];
    newBoard[pos.r][pos.c] = { ...letter, row: pos.r, col: pos.c };
  });

  return {
    ...state,
    board: newBoard,
    currentWord: [], // Clear current selection as positions changed
    powerUps: { ...state.powerUps, shuffle: state.powerUps.shuffle - 1 },
    pendingPowerUp: null,
    errorMessage: null,
  };
};

// Activate TIME FREEZE - freezes letter spawning for 10 seconds
export const activateTimeFreeze = (state: GameState): GameState => {
  if (state.powerUps.timeFreeze <= 0 || state.isGameOver) return state;

  return {
    ...state,
    isFrozen: true,
    freezeEndTime: Date.now() + 10000, // 10 second freeze
    powerUps: { ...state.powerUps, timeFreeze: state.powerUps.timeFreeze - 1 },
    pendingPowerUp: null,
    errorMessage: null,
  };
};

// Clear pending power-up notification
export const clearPendingPowerUp = (state: GameState): GameState => {
  return { ...state, pendingPowerUp: null };
};

// ============================================
// DAILY CHALLENGE - SEEDED RANDOM FUNCTIONS
// ============================================

import { SeededRandom } from '../../lib/seededRandom';

// Helper function to select a random special letter type based on weights using seeded random
const selectRandomSpecialTypeSeeded = (rng: SeededRandom): LetterType => {
  const totalWeight = SPECIAL_LETTER_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
  let random = rng.next() * totalWeight;

  for (const item of SPECIAL_LETTER_WEIGHTS) {
    random -= item.weight;
    if (random <= 0) {
      return item.type;
    }
  }
  return 'bonus2x'; // Fallback
};

// Seeded version of addLetterToBoard for daily challenges
// Uses SeededRandom to ensure all players get the same letter sequence
export const addLetterToBoardSeeded = (
  state: GameState,
  language: 'da' | 'en' = 'da',
  rng: SeededRandom
): GameState => {
  if (state.isGameOver) return state;

  // Don't add letters if frozen
  if (state.isFrozen) return state;

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

  // Use seeded random to pick empty cell
  const randomEmptyCell = emptyCells[rng.nextInt(0, emptyCells.length)];
  const { r, c } = randomEmptyCell;

  const newBoard = state.board.map(row => [...row]);
  const weightedLetters = getWeightedLetters(language);
  const randomChar = rng.pick(weightedLetters);

  // Determine letter type using seeded random
  let letterType: LetterType = 'normal';
  let updatedNormalLettersSinceLastBonus = state.normalLettersSinceLastBonus + 1;
  let updatedNextBonusIn = state.nextBonusIn;
  let updatedLettersSinceSpecial = state.lettersSinceSpecial + 1;
  let updatedNextSpecialIn = state.nextSpecialIn;

  // Check for bonus (2x) letter - legacy system
  if (updatedNormalLettersSinceLastBonus >= state.nextBonusIn) {
    letterType = 'bonus2x';
    updatedNormalLettersSinceLastBonus = 0;
    updatedNextBonusIn = 10 + rng.nextInt(0, 21);
  }
  // Check for special letter (overrides bonus if triggered)
  else if (updatedLettersSinceSpecial >= state.nextSpecialIn) {
    letterType = selectRandomSpecialTypeSeeded(rng);
    updatedLettersSinceSpecial = 0;
    updatedNextSpecialIn = 8 + rng.nextInt(0, 11); // 8-18 letters until next special
    // Reset bonus counter if we spawned a bonus-type special
    if (letterType === 'bonus2x' || letterType === 'bonus3x') {
      updatedNormalLettersSinceLastBonus = 0;
      updatedNextBonusIn = 10 + rng.nextInt(0, 21);
    }
  }

  // Wild cards show a special character
  const displayChar = letterType === 'wild' ? '?' : randomChar;

  newBoard[r][c] = createLetter(displayChar, r, c, letterType);

  // Check if board is full
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
    normalLettersSinceLastBonus: updatedNormalLettersSinceLastBonus,
    nextBonusIn: updatedNextBonusIn,
    lettersSinceSpecial: updatedLettersSinceSpecial,
    nextSpecialIn: updatedNextSpecialIn,
  };
};

// Initialize game state with seeded random values for daily challenge
export const initializeGameStateSeeded = (rows: number, cols: number, rng: SeededRandom): GameState => {
  return {
    board: createInitialBoard(rows, cols),
    currentWord: [],
    score: 0,
    foundWords: [],
    isGameOver: false,
    boardSize: { rows, cols },
    isLoading: false,
    errorMessage: null,
    isWordListLoading: false,
    wordListErrorMessage: null,
    normalLettersSinceLastBonus: 0,
    nextBonusIn: 10 + rng.nextInt(0, 21), // Seeded initial bonus timing
    // New power-up and streak tracking
    isFrozen: false,
    freezeEndTime: null,
    wordStreak: 0,
    lastWordTime: null,
    lettersSinceSpecial: 0,
    nextSpecialIn: 8 + rng.nextInt(0, 11), // Seeded initial special timing
    // Earnable power-ups
    powerUps: { nuke: 0, shuffle: 0, timeFreeze: 0 },
    pendingPowerUp: null,
  };
};
