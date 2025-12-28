import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "./SupabaseClient";
import GameBoard from "./components/Game/GameBoard";
import HowToPlayModal from "./components/Game/HowToPlayModal";
import WildCardPicker from "./components/Game/WildCardPicker";
import PowerUpBar from "./components/Game/PowerUpBar";
import UsernameForm from "./components/Auth/UsernameForm";
import Leaderboard from "./components/Game/Leaderboard";
import StartScreen from "./components/StartScreen";
import ShareResultButton from "./components/Game/ShareResultButton";
import DailyChallengeLeaderboard from "./components/Game/DailyChallengeLeaderboard";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { useConfetti } from "./components/Game/Confetti";
import { GameState, Letter, PowerUpType, GameMode, DailyChallenge, ShareableResult } from "./types";
import { Language } from "./i18n";
import {
  initializeGameState,
  initializeGameStateSeeded,
  handleLetterClick as logicHandleLetterClick,
  clearCurrentWord as logicClearCurrentWord,
  submitWord as logicSubmitWord,
  addLetterToBoard as logicAddLetterToBoard,
  addLetterToBoardSeeded as logicAddLetterToBoardSeeded,
  updateTickingBombs as logicUpdateTickingBombs,
  updateFreezeStatus as logicUpdateFreezeStatus,
  assignWildCardLetter as logicAssignWildCardLetter,
  activateNuke as logicActivateNuke,
  activateShuffle as logicActivateShuffle,
  activateTimeFreeze as logicActivateTimeFreeze,
  clearPendingPowerUp as logicClearPendingPowerUp,
  getDisplayWordString,
  initializeWordList
} from "./components/Game/GameLogic";
import { SeededRandom } from "./lib/seededRandom";
import {
  getDailyChallenge,
  hasCompletedDailyChallenge,
  saveDailyChallengeResult,
  getUserDailyRank
} from "./lib/dailyChallenge";
import {
  Info,
  Repeat,
  Send,
  Trash2,
  XCircle,
  Loader2,
  Trophy,
  Upload,
  X,
  Sparkles,
  Zap,
  User,
  Flame,
  Snowflake
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";

const STORAGE_KEY_USERNAME = "letsword_username";
const STORAGE_KEY_USER_ID = "letsword_user_id";

// Inner component that uses the language context
const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [gameState, setGameState] = useState<GameState>(() => initializeGameState(6, 6));
  const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  // Game started state - show start screen first
  const [gameStarted, setGameStarted] = useState(false);

  // Game mode state
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [_dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [dailyRank, setDailyRank] = useState<number | null>(null);
  const seededRngRef = useRef<SeededRandom | null>(null);

  // Wild card picker state
  const [isWildCardPickerOpen, setIsWildCardPickerOpen] = useState(false);
  const [pendingWildCardId, setPendingWildCardId] = useState<string | null>(null);

  // Confetti effects
  const { celebrateWord, celebrateLongWord, celebrateGameOver } = useConfetti();
  const prevFoundWordsRef = useRef<string[]>([]);

  // Simple user state - just username and ID stored in localStorage
  const [username, setUsername] = useState<string | null>(null);
  const [anonUserId, setAnonUserId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Personal best score
  const [personalBest, setPersonalBest] = useState<number>(0);

  // State for prompting save after game
  const [scoreToSave, setScoreToSave] = useState<{
    score: number;
    wordsFound: string[];
    longestWord: string | null;
  } | null>(null);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);

  // Track score changes for confetti
  useEffect(() => {
    if (gameState.foundWords.length > prevFoundWordsRef.current.length) {
      const newWord = gameState.foundWords[gameState.foundWords.length - 1];
      if (newWord) {
        if (newWord.length >= 5) {
          celebrateLongWord();
        } else {
          celebrateWord(newWord.length);
        }
      }
    }
    prevFoundWordsRef.current = gameState.foundWords;
  }, [gameState.foundWords, celebrateWord, celebrateLongWord]);

  // Celebrate game over
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0) {
      setTimeout(() => {
        celebrateGameOver(gameState.score);
      }, 500);
    }
  }, [gameState.isGameOver, gameState.score, celebrateGameOver]);

  // Load saved username and user ID from localStorage, verify user still exists in DB
  useEffect(() => {
    const loadUser = async () => {
      const savedUsername = localStorage.getItem(STORAGE_KEY_USERNAME);
      const savedUserId = localStorage.getItem(STORAGE_KEY_USER_ID);

      if (savedUsername && savedUserId) {
        // Verify user still exists in the database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', savedUserId)
          .single();

        if (error || !profile) {
          // User no longer exists in DB - clear localStorage
          console.log('Stored user not found in database, clearing local storage');
          localStorage.removeItem(STORAGE_KEY_USERNAME);
          localStorage.removeItem(STORAGE_KEY_USER_ID);
        } else {
          // User exists - restore session
          setUsername(profile.username || savedUsername);
          setAnonUserId(savedUserId);
          // Fetch personal best for this user
          fetchPersonalBest(savedUserId);
        }
      }
      setIsLoadingUser(false);
    };

    loadUser();
  }, []);

  // Fetch personal best score from Supabase
  const fetchPersonalBest = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setPersonalBest(data.score);
      }
    } catch (err) {
      console.error('Error fetching personal best:', err);
    }
  };

  // Check daily challenge completion status when user or language changes
  useEffect(() => {
    const checkDailyCompletion = async () => {
      if (anonUserId) {
        const completed = await hasCompletedDailyChallenge(anonUserId, language);
        setDailyChallengeCompleted(completed);
        if (completed) {
          const rank = await getUserDailyRank(anonUserId, language);
          setDailyRank(rank);
        }
      } else {
        setDailyChallengeCompleted(false);
        setDailyRank(null);
      }
    };
    checkDailyCompletion();
  }, [anonUserId, language]);

  // Initialize word validation (now instant - server-side via Supabase RPC)
  useEffect(() => {
    initializeWordList(); // Just logs ready status, no actual loading
    setGameState(prev => ({ ...prev, isWordListLoading: false }));
  }, []);

  // Handle game over
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0) {
      const longestWord = gameState.foundWords.reduce((a, b) => a.length >= b.length ? a : b, '');

      // Handle daily challenge completion
      if (gameMode === 'daily' && anonUserId) {
        const saveDailyResult = async () => {
          const saved = await saveDailyChallengeResult(
            anonUserId,
            language,
            gameState.score,
            gameState.foundWords,
            longestWord || null
          );
          if (saved) {
            setDailyChallengeCompleted(true);
            const rank = await getUserDailyRank(anonUserId, language);
            setDailyRank(rank);
          }
        };
        saveDailyResult();
      }

      // Handle endless mode score saving
      if (gameMode === 'endless') {
        if (username && anonUserId) {
          // User has username - save to Supabase automatically
          saveScoreToSupabase(anonUserId, gameState.score, gameState.foundWords, longestWord, language);
        } else {
          // No username yet - prompt for one
          setScoreToSave({
            score: gameState.score,
            wordsFound: gameState.foundWords,
            longestWord: longestWord || null
          });
        }
      }

      // Update personal best locally
      if (gameState.score > personalBest) {
        setPersonalBest(gameState.score);
      }
    }
  }, [gameState.isGameOver]);

  // Save score to Supabase
  const saveScoreToSupabase = async (
    userId: string,
    score: number,
    wordsFound: string[],
    longestWord: string | null,
    lang: 'da' | 'en' = 'da'
  ) => {
    try {
      const { error } = await supabase
        .from('scores')
        .insert({
          user_id: userId,
          score,
          words_found: wordsFound,
          word_count: wordsFound.length,
          longest_word: longestWord,
          game_mode: 'endless',
          difficulty: 'medium',
          language: lang
        });

      if (error) {
        console.error('Error saving score:', error);
      } else {
        // Refresh leaderboard to show new score
        setLeaderboardRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error saving score:', err);
    }
  };

  // Handle username submission - creates anonymous user and saves score
  const handleUsernameSubmit = async (newUsername: string) => {
    setIsSavingUsername(true);
    setUsernameError(null);

    try {
      // Sign in anonymously to get a user ID
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

      if (authError) {
        console.error('Auth error:', authError);
        setUsernameError('Kunne ikke oprette bruger. Prøv igen.');
        setIsSavingUsername(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setUsernameError('Kunne ikke oprette bruger. Prøv igen.');
        setIsSavingUsername(false);
        return;
      }

      // Create profile with username
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: newUsername,
          display_name: newUsername
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        // Check if username is taken
        if (profileError.message.includes('duplicate') || profileError.message.includes('unique')) {
          setUsernameError('Dette brugernavn er allerede taget. Prøv et andet.');
          setIsSavingUsername(false);
          return;
        }
        setUsernameError('Kunne ikke gemme brugernavn. Prøv igen.');
        setIsSavingUsername(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY_USERNAME, newUsername);
      localStorage.setItem(STORAGE_KEY_USER_ID, userId);

      // Update state
      setUsername(newUsername);
      setAnonUserId(userId);

      // Save the pending score if there is one
      if (scoreToSave) {
        await saveScoreToSupabase(userId, scoreToSave.score, scoreToSave.wordsFound, scoreToSave.longestWord, language);
        setScoreToSave(null);
      }

      setIsUsernameModalOpen(false);
    } catch (err) {
      console.error('Error creating user:', err);
      setUsernameError('Der opstod en fejl. Prøv igen.');
    } finally {
      setIsSavingUsername(false);
    }
  };

  // Game handlers
  const currentWordString = getDisplayWordString(gameState.currentWord);

  const onLetterClickHandler = useCallback(
    (letter: Letter) => {
      if (gameState.isGameOver || gameState.isLoading || gameState.isWordListLoading) return;

      // Check if this letter is already in the current word
      const alreadySelected = gameState.currentWord.find(l => l.id === letter.id);
      if (alreadySelected) return;

      // If it's a wild card, show the letter picker
      if (letter.letterType === 'wild') {
        // First add the letter to the word
        setGameState((prevState) => logicHandleLetterClick(prevState, letter));
        // Then show the picker
        setPendingWildCardId(letter.id);
        setIsWildCardPickerOpen(true);
      } else {
        setGameState((prevState) => logicHandleLetterClick(prevState, letter));
      }
    },
    [gameState.isGameOver, gameState.isLoading, gameState.isWordListLoading, gameState.currentWord]
  );

  // Handle wild card letter selection
  const onWildCardSelect = useCallback((selectedLetter: string) => {
    if (pendingWildCardId) {
      setGameState((prevState) => logicAssignWildCardLetter(prevState, pendingWildCardId, selectedLetter));
    }
    setIsWildCardPickerOpen(false);
    setPendingWildCardId(null);
  }, [pendingWildCardId]);

  // Handle wild card picker cancel
  const onWildCardCancel = useCallback(() => {
    // Remove the wild card from the current word if cancelled
    if (pendingWildCardId) {
      setGameState((prevState) => ({
        ...prevState,
        currentWord: prevState.currentWord.filter(l => l.id !== pendingWildCardId),
      }));
    }
    setIsWildCardPickerOpen(false);
    setPendingWildCardId(null);
  }, [pendingWildCardId]);

  // Power-up activation handlers
  const onPowerUpActivate = useCallback((type: PowerUpType) => {
    if (gameState.isGameOver || gameState.isLoading) return;

    switch (type) {
      case 'nuke':
        setGameState((prevState) => logicActivateNuke(prevState));
        break;
      case 'shuffle':
        setGameState((prevState) => logicActivateShuffle(prevState));
        break;
      case 'timeFreeze':
        setGameState((prevState) => logicActivateTimeFreeze(prevState));
        break;
    }
  }, [gameState.isGameOver, gameState.isLoading]);

  const onPendingPowerUpDismiss = useCallback(() => {
    setGameState((prevState) => logicClearPendingPowerUp(prevState));
  }, []);

  // Auto-dismiss pending power-up notification after 2 seconds
  useEffect(() => {
    if (gameState.pendingPowerUp) {
      const timer = setTimeout(() => {
        setGameState((prevState) => logicClearPendingPowerUp(prevState));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.pendingPowerUp]);

  const onClearWordHandler = useCallback(() => {
    if (gameState.isGameOver || gameState.isLoading || gameState.isWordListLoading) return;
    setGameState((prevState) => logicClearCurrentWord(prevState));
  }, [gameState.isGameOver, gameState.isLoading, gameState.isWordListLoading]);

  const onSubmitWordHandler = useCallback(async () => {
    if (gameState.isGameOver || gameState.isLoading || gameState.isWordListLoading || currentWordString.length < 3) return;
    setGameState((prevState) => ({ ...prevState, isLoading: true, errorMessage: null }));
    try {
      const newState = await logicSubmitWord(gameState, {
        language,
        errorMessages: {
          tooShort: t('validation.tooShort'),
          wildcardFirst: t('validation.wildcardFirst'),
          invalidWord: (word: string) => t('validation.invalidWord', { word }),
          networkError: t('validation.networkError'),
        }
      });
      setGameState({ ...newState, isLoading: false });
    } catch (error) {
      console.error("Error submitting word:", error);
      setGameState((prevState) => ({ ...prevState, isLoading: false, errorMessage: t('validation.genericError', 'Error validating word.') }));
    }
  }, [gameState, currentWordString.length, language, t]);

  const handleRestartGame = useCallback(() => {
    // Go back to start screen to allow language change
    setGameStarted(false);
    setGameState(initializeGameState(6, 6));
    setGameState(prev => ({ ...prev, isWordListLoading: false }));
    setScoreToSave(null);
  }, []);

  // Game loop - add letters (only when game has started)
  useEffect(() => {
    if (!gameStarted || gameState.isGameOver || gameState.isWordListLoading) {
      return;
    }
    const addLetterInterval = setInterval(() => {
      setGameState(prevState => {
        if (prevState.isGameOver) return prevState;
        // Use seeded random for daily challenges, regular random for endless
        if (gameMode === 'daily' && seededRngRef.current) {
          return logicAddLetterToBoardSeeded(prevState, language, seededRngRef.current);
        }
        return logicAddLetterToBoard(prevState, language);
      });
    }, 1440); // 1.44 seconds between letters (20% slower than before)
    return () => clearInterval(addLetterInterval);
  }, [gameStarted, gameState.isGameOver, gameState.isWordListLoading, language, gameMode]);

  // Ticking bomb update loop - every 500ms to update bomb timers
  useEffect(() => {
    if (gameState.isGameOver) return;

    const tickingBombInterval = setInterval(() => {
      setGameState(prevState => {
        if (prevState.isGameOver) return prevState;
        return logicUpdateTickingBombs(prevState, language);
      });
    }, 500);

    return () => clearInterval(tickingBombInterval);
  }, [gameState.isGameOver, language]);

  // Freeze timer update - check if freeze should end
  useEffect(() => {
    if (!gameState.isFrozen) return;

    const freezeCheckInterval = setInterval(() => {
      setGameState(prevState => logicUpdateFreezeStatus(prevState));
    }, 100);

    return () => clearInterval(freezeCheckInterval);
  }, [gameState.isFrozen]);

  // Handle start game
  const handleStartGame = useCallback(async (mode: GameMode) => {
    setGameMode(mode);

    if (mode === 'daily') {
      // Fetch today's daily challenge
      const challenge = await getDailyChallenge(language);
      if (!challenge) {
        console.error('Could not load daily challenge');
        return;
      }
      setDailyChallenge(challenge);

      // Create seeded RNG from challenge seed
      const rng = new SeededRandom(challenge.seed);
      seededRngRef.current = rng;

      // Initialize game state with seeded random
      setGameStarted(true);
      setGameState(initializeGameStateSeeded(6, 6, rng));
      setGameState(prev => ({ ...prev, isWordListLoading: false }));
    } else {
      // Endless mode - regular random
      seededRngRef.current = null;
      setGameStarted(true);
      setGameState(initializeGameState(6, 6));
      setGameState(prev => ({ ...prev, isWordListLoading: false }));
    }
  }, [language]);

  // Handle language selection from start screen
  const handleLanguageSelect = useCallback((lang: Language) => {
    setLanguage(lang);
  }, [setLanguage]);

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen animated-gradient-bg">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.h1
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg"
          >
            {t('app.title')}
          </motion.h1>
          <Loader2 size={48} className="animate-spin text-white/90 mx-auto" />
          <p className="mt-4 text-white/80 text-sm">{t('app.loading')}</p>
        </motion.div>
      </div>
    );
  }

  // Show start screen if game hasn't started
  if (!gameStarted) {
    return (
      <>
        <StartScreen
          onStart={handleStartGame}
          onLanguageSelect={handleLanguageSelect}
          selectedLanguage={language}
          onShowHowToPlay={() => setIsHowToPlayModalOpen(true)}
          dailyChallengeCompleted={dailyChallengeCompleted}
        />
        <HowToPlayModal isOpen={isHowToPlayModalOpen} onClose={() => setIsHowToPlayModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen animated-gradient-bg p-4 font-sans antialiased relative overflow-hidden">
      {/* Floating background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-indigo-300/15 rounded-full blur-2xl"
        />
      </div>

      {/* Header */}
      <header className="w-full max-w-4xl mb-4 sm:mb-6 flex justify-between items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 sm:gap-2"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Zap className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-300 drop-shadow-lg" />
          </motion.div>
          <h1 className="text-xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            {t('app.title')}
          </h1>
          {gameMode === 'daily' && (
            <span className="ml-2 px-2 py-0.5 bg-orange-500/90 text-white text-xs font-bold rounded-full">
              {t('daily.title')}
            </span>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 sm:gap-3"
        >
          {username && (
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 glass-card rounded-xl">
              <User size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-gray-700 font-medium max-w-[60px] sm:max-w-none truncate">{username}</span>
            </div>
          )}

          {/* Language indicator */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 glass-card rounded-xl">
            <span className="text-base sm:text-lg">{language === 'da' ? '🇩🇰' : '🇬🇧'}</span>
            <span className="text-sm text-gray-700 font-medium hidden sm:inline">
              {language === 'da' ? 'Dansk' : 'English'}
            </span>
          </div>

          <button
            onClick={() => setIsHowToPlayModalOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 glass-card hover:bg-white/90
              text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm font-medium btn-premium"
          >
            <Info size={16} />
            <span className="hidden sm:inline">{t('howToPlay.button')}</span>
          </button>
        </motion.div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-4xl relative z-10">
        {/* Game Area */}
        <main className="glass-card p-4 sm:p-6 rounded-3xl shadow-2xl w-full lg:w-3/5 relative">
          {/* Loading overlay */}
          <AnimatePresence>
            {gameState.isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 rounded-2xl"
              >
                <Loader2 size={40} className="animate-spin text-sky-500" />
                <p className="mt-3 text-sky-600 font-medium">{t('leaderboard.loading')}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Word list error */}
          {gameState.wordListErrorMessage && (
            <div className="absolute inset-0 bg-red-50/95 flex flex-col items-center justify-center z-20 rounded-2xl p-4">
              <XCircle size={40} className="text-red-500 mb-3" />
              <p className="text-red-700 font-semibold">Fejl ved indlæsning af ordbog</p>
              <p className="text-red-600 text-sm text-center mt-2">{gameState.wordListErrorMessage}</p>
            </div>
          )}

          {/* Freeze indicator */}
          {gameState.isFrozen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-full shadow-lg"
            >
              <Snowflake size={16} className="animate-spin" />
              <span className="text-sm font-semibold">{t('game.frozen')}</span>
            </motion.div>
          )}

          {/* Streak indicator */}
          {gameState.wordStreak >= 3 && !gameState.isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg"
            >
              <Flame size={14} />
              <span className="text-sm font-bold">{t('game.streak', { count: gameState.wordStreak })}</span>
            </motion.div>
          )}

          {/* Game content */}
          {!gameState.isGameOver ? (
            <>
              <GameBoard
                board={gameState.board}
                onLetterClick={onLetterClickHandler}
                currentWord={gameState.currentWord}
                isFrozen={gameState.isFrozen}
              />

              {/* Power-ups bar */}
              <div className="mt-4">
                <PowerUpBar
                  powerUps={gameState.powerUps}
                  onActivate={onPowerUpActivate}
                  disabled={gameState.isLoading || gameState.isGameOver}
                  pendingPowerUp={gameState.pendingPowerUp}
                  onPendingDismiss={onPendingPowerUpDismiss}
                />
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[320px] py-8 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100/50 relative overflow-hidden"
            >
              {/* Background sparkles */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-2xl"
                />
              </div>

              <motion.div
                className="trophy-bounce relative z-10"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <Trophy size={56} className="text-yellow-500 drop-shadow-lg" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl -z-10"
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-800 mt-3 relative z-10"
              >
                {t('gameOver.title')}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2 relative z-10"
              >
                {t('gameOver.points', { score: gameState.score })}
              </motion.p>

              {personalBest > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-gray-500 mt-2 relative z-10"
                >
                  {t('gameOver.personalBest', { score: personalBest })}
                </motion.p>
              )}

              {/* Save to leaderboard prompt - only show if no username yet */}
              {!username && scoreToSave && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 text-center relative z-10"
                >
                  <p className="text-sm text-gray-600 mb-3">{t('gameOver.savePrompt')}</p>
                  <button
                    onClick={() => { setIsUsernameModalOpen(true); setUsernameError(null); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 mx-auto
                      bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                      text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all btn-premium"
                  >
                    <Upload size={18} />
                    {t('gameOver.saveScore')}
                  </button>
                </motion.div>
              )}

              {/* Score saved confirmation */}
              {username && !scoreToSave && gameMode === 'endless' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-sm text-green-600 mt-3 relative z-10 font-medium"
                >
                  {t('gameOver.scoreSaved')}
                </motion.p>
              )}

              {/* Daily challenge rank */}
              {gameMode === 'daily' && dailyRank && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-lg font-bold text-amber-600 mt-3 relative z-10"
                >
                  {dailyRank <= 3 ? (dailyRank === 1 ? '🥇' : dailyRank === 2 ? '🥈' : '🥉') : '🏅'} {t('daily.rank', { rank: dailyRank })}
                </motion.p>
              )}

              {/* Share button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-4 relative z-10"
              >
                <ShareResultButton
                  result={{
                    score: gameState.score,
                    wordCount: gameState.foundWords.length,
                    longestWord: gameState.foundWords.reduce((a, b) => a.length >= b.length ? a : b, '') || null,
                    date: new Date().toLocaleDateString(language === 'da' ? 'da-DK' : 'en-GB'),
                    language,
                    gameMode,
                    rank: dailyRank || undefined
                  } as ShareableResult}
                />
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestartGame}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50
                  text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all relative z-10"
              >
                <Repeat size={18} />
                {t('gameOver.playAgain')}
              </motion.button>

              {/* Daily Challenge Leaderboard */}
              {gameMode === 'daily' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-6 w-full max-w-sm relative z-10"
                >
                  <DailyChallengeLeaderboard
                    currentUserId={anonUserId}
                    language={language}
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Current word display */}
          <div className="mt-4 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('game.currentWord')}</p>
            <motion.div
              className="text-2xl sm:text-3xl font-bold h-12 flex items-center justify-center bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl shadow-inner px-6 border border-gray-100"
              animate={currentWordString.length >= 3 ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {currentWordString ? (
                <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentWordString}
                </span>
              ) : (
                <span className="text-gray-300 text-lg font-normal">{t('game.selectLetters')}</span>
              )}
            </motion.div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {gameState.errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-red-500 mt-2 text-center font-medium"
              >
                {gameState.errorMessage}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Action buttons - placed right after current word for mobile visibility */}
          {!gameState.isGameOver && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClearWordHandler}
                disabled={currentWordString.length === 0 || gameState.isLoading || gameState.isWordListLoading}
                className="flex items-center justify-center gap-2 py-3 px-4
                  bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100
                  text-gray-700 font-semibold rounded-xl shadow-sm border border-gray-200
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} />
                {t('game.clear')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSubmitWordHandler}
                disabled={currentWordString.length < 3 || gameState.isLoading || gameState.isWordListLoading}
                className="flex items-center justify-center gap-2 py-3 px-4
                  bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                  text-white font-semibold rounded-xl shadow-lg hover:shadow-xl
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 btn-premium"
              >
                <Send size={18} />
                {t('game.submit')}
              </motion.button>
            </div>
          )}

          {/* Score and stats */}
          <div className="mt-4 flex justify-between items-center px-2 py-2 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-gray-600 font-medium text-sm">{t('game.score')}:</span>
              <motion.span
                key={gameState.score}
                initial={{ scale: 1.3, color: "#22c55e" }}
                animate={{ scale: 1, color: "#4f46e5" }}
                className="font-bold text-xl"
              >
                {gameState.score}
              </motion.span>
            </div>
            {personalBest > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Trophy size={14} className="text-yellow-500" />
                <span>{t('game.personalBest')}:</span>
                <span className="font-semibold text-indigo-500">{personalBest}</span>
              </div>
            )}
          </div>

          {/* Found words - at bottom, scrollable if needed */}
          {gameState.foundWords.length > 0 && (
            <div className="mt-3 px-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('game.wordsFound')} ({gameState.foundWords.length})</p>
              <div className="text-xs text-gray-600 flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                {gameState.foundWords.slice(-8).map((word, i) => (
                  <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                    {word}
                  </span>
                ))}
                {gameState.foundWords.length > 8 && (
                  <span className="px-2 py-0.5 text-gray-400">+{gameState.foundWords.length - 8}</span>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Leaderboard */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 sm:p-6 rounded-3xl shadow-2xl w-full lg:w-2/5"
        >
          <Leaderboard key={`${leaderboardRefreshKey}-${language}`} currentUserId={anonUserId} language={language} />
        </motion.aside>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center relative z-10"
      >
        <p className="text-white/60 text-xs font-medium">
          {t('app.footer')}
        </p>
      </motion.footer>

      {/* How to Play Modal */}
      <HowToPlayModal isOpen={isHowToPlayModalOpen} onClose={() => setIsHowToPlayModalOpen(false)} />

      {/* Wild Card Letter Picker */}
      <WildCardPicker
        isOpen={isWildCardPickerOpen}
        onSelect={onWildCardSelect}
        onCancel={onWildCardCancel}
      />

      {/* Username Modal */}
      <AnimatePresence mode="wait">
        {isUsernameModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
            onClick={() => setIsUsernameModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full relative"
              style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsUsernameModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                {t('auth.saveYourScore')}
              </h2>

              <UsernameForm
                onSubmit={handleUsernameSubmit}
                isLoading={isSavingUsername}
                errorMessage={usernameError}
                score={scoreToSave?.score}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main App component wrapped with LanguageProvider
const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
      <Analytics />
    </LanguageProvider>
  );
};

export default App;
