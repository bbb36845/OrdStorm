import React, { useState, useEffect, useCallback, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./SupabaseClient";
import GameBoard from "./components/Game/GameBoard";
import HowToPlayModal from "./components/Game/HowToPlayModal";
import AuthForm from "./components/Auth/AuthForm";
import Leaderboard from "./components/Game/Leaderboard";
import { useConfetti } from "./components/Game/Confetti";
import { GameState, Letter, User, Profile } from "./types";
import {
  initializeGameState,
  handleLetterClick as logicHandleLetterClick,
  clearCurrentWord as logicClearCurrentWord,
  submitWord as logicSubmitWord,
  addLetterToBoard as logicAddLetterToBoard,
  initializeWordList
} from "./components/Game/GameLogic";
import {
  Info,
  LogIn,
  LogOut,
  Repeat,
  Send,
  Trash2,
  XCircle,
  Loader2,
  Trophy,
  Upload,
  X,
  Sparkles,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocalScore {
  score: number;
  wordsFound: string[];
  longestWord: string | null;
  timestamp: number;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGameState(6, 6));
  const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Confetti effects
  const { celebrateWord, celebrateLongWord, celebrateGameOver } = useConfetti();
  const prevScoreRef = useRef(0);
  const prevFoundWordsRef = useRef<string[]>([]);

  // Supabase Auth State
  const [_session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Local scores for guest users
  const [localScores, setLocalScores] = useState<LocalScore[]>([]);
  const [personalBest, setPersonalBest] = useState<number>(0);

  // State for prompting save after game
  const [scoreToSave, setScoreToSave] = useState<{
    score: number;
    wordsFound: string[];
    longestWord: string | null;
  } | null>(null);
  const [_isSavingScore, setIsSavingScore] = useState(false);
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
    prevScoreRef.current = gameState.score;
  }, [gameState.foundWords, gameState.score, celebrateWord, celebrateLongWord]);

  // Celebrate game over
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0) {
      setTimeout(() => {
        celebrateGameOver(gameState.score);
      }, 500);
    }
  }, [gameState.isGameOver, gameState.score, celebrateGameOver]);

  // Initialize Supabase Auth listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Spiller',
          email: session.user.email
        });
        fetchProfile(session.user.id);
      }
      setIsLoadingAuth(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Spiller',
          email: session.user.email
        });
        fetchProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data as Profile);
      setPersonalBest(data.highest_score || 0);
    }
  };

  // Load local scores from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("ordstorm_local_scores");
    if (stored) {
      const scores = JSON.parse(stored) as LocalScore[];
      setLocalScores(scores);
      if (!currentUser && scores.length > 0) {
        setPersonalBest(Math.max(...scores.map(s => s.score)));
      }
    }
  }, [currentUser]);

  // Save local scores to localStorage
  useEffect(() => {
    if (localScores.length > 0) {
      localStorage.setItem("ordstorm_local_scores", JSON.stringify(localScores));
    }
  }, [localScores]);

  // Update personal best when profile changes
  useEffect(() => {
    if (profile) {
      setPersonalBest(profile.highest_score || 0);
    }
  }, [profile]);

  // Initialize word validation (now instant - server-side via Supabase RPC)
  useEffect(() => {
    initializeWordList(); // Just logs ready status, no actual loading
    setGameState(prev => ({ ...prev, isWordListLoading: false }));
  }, []);

  // Handle game over
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0) {
      const longestWord = gameState.foundWords.reduce((a, b) => a.length >= b.length ? a : b, '');

      if (currentUser) {
        // Logged in - save to Supabase automatically
        saveScoreToSupabase(gameState.score, gameState.foundWords, longestWord);
      } else {
        // Guest - save locally and prompt for account
        const newLocalScore: LocalScore = {
          score: gameState.score,
          wordsFound: gameState.foundWords,
          longestWord: longestWord || null,
          timestamp: Date.now()
        };
        setLocalScores(prev => [...prev, newLocalScore].sort((a, b) => b.score - a.score).slice(0, 10));
        setPersonalBest(prev => Math.max(prev, gameState.score));

        // Prompt to save to leaderboard
        setScoreToSave({
          score: gameState.score,
          wordsFound: gameState.foundWords,
          longestWord: longestWord || null
        });
      }
    }
  }, [gameState.isGameOver, gameState.score, currentUser]);

  // Save score to Supabase
  const saveScoreToSupabase = async (score: number, wordsFound: string[], longestWord: string | null) => {
    if (!currentUser) return;

    setIsSavingScore(true);
    try {
      const { error } = await supabase
        .from('scores')
        .insert({
          user_id: currentUser.id,
          score,
          words_found: wordsFound,
          word_count: wordsFound.length,
          longest_word: longestWord,
          game_mode: 'endless',
          difficulty: 'medium'
        });

      if (error) {
        console.error('Error saving score:', error);
      } else {
        // Refresh profile to get updated stats
        fetchProfile(currentUser.id);
        // Refresh leaderboard to show new score
        setLeaderboardRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      setIsSavingScore(false);
    }
  };

  // Auth handlers
  const handleAuthSubmit = async (credentials: { email: string; password: string; username?: string }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isRegisterMode) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              username: credentials.username,
              display_name: credentials.username
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setAuthError('Denne email er allerede registreret. Prøv at logge ind.');
          } else {
            setAuthError(error.message);
          }
        } else if (data.user) {
          setIsAuthModalOpen(false);
          // If there's a score to save, save it now
          if (scoreToSave) {
            setTimeout(() => {
              saveScoreToSupabase(scoreToSave.score, scoreToSave.wordsFound, scoreToSave.longestWord);
              setScoreToSave(null);
            }, 1000);
          }
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error) {
          if (error.message.includes('Invalid login')) {
            setAuthError('Forkert email eller adgangskode');
          } else {
            setAuthError(error.message);
          }
        } else {
          setIsAuthModalOpen(false);
          if (scoreToSave) {
            setTimeout(() => {
              saveScoreToSupabase(scoreToSave.score, scoreToSave.wordsFound, scoreToSave.longestWord);
              setScoreToSave(null);
            }, 1000);
          }
        }
      }
    } catch (err) {
      setAuthError('Der opstod en fejl. Prøv igen.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfile(null);
  };

  // Game handlers
  const currentWordString = gameState.currentWord.map((l) => l.char).join("");

  const onLetterClickHandler = useCallback(
    (letter: Letter) => {
      if (gameState.isGameOver || gameState.isLoading || gameState.isWordListLoading) return;
      setGameState((prevState) => logicHandleLetterClick(prevState, letter));
    },
    [gameState.isGameOver, gameState.isLoading, gameState.isWordListLoading]
  );

  const onClearWordHandler = useCallback(() => {
    if (gameState.isGameOver || gameState.isLoading || gameState.isWordListLoading) return;
    setGameState((prevState) => logicClearCurrentWord(prevState));
  }, [gameState.isGameOver, gameState.isLoading, gameState.isWordListLoading]);

  const onSubmitWordHandler = useCallback(async () => {
    if (gameState.isGameOver || gameState.isLoading || gameState.isWordListLoading || currentWordString.length < 3) return;
    setGameState((prevState) => ({ ...prevState, isLoading: true, errorMessage: null }));
    try {
      const newState = await logicSubmitWord(gameState);
      setGameState({ ...newState, isLoading: false });
    } catch (error) {
      console.error("Error submitting word:", error);
      setGameState((prevState) => ({ ...prevState, isLoading: false, errorMessage: "Fejl ved validering af ord." }));
    }
  }, [gameState, currentWordString.length]);

  const handleRestartGame = useCallback(() => {
    setGameState(initializeGameState(6, 6));
    setGameState(prev => ({ ...prev, isWordListLoading: false, wordListErrorMessage: prev.wordListErrorMessage }));
    setScoreToSave(null);
  }, []);

  // Game loop - add letters
  useEffect(() => {
    if (gameState.isGameOver || gameState.isWordListLoading) {
      return;
    }
    const addLetterInterval = setInterval(() => {
      setGameState(prevState => {
        if (prevState.isGameOver) return prevState;
        return logicAddLetterToBoard(prevState);
      });
    }, 1000);
    return () => clearInterval(addLetterInterval);
  }, [gameState.isGameOver, gameState.isWordListLoading]);

  // Loading state
  if (isLoadingAuth) {
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
            OrdStorm
          </motion.h1>
          <Loader2 size={48} className="animate-spin text-white/90 mx-auto" />
          <p className="mt-4 text-white/80 text-sm">Indlæser spil...</p>
        </motion.div>
      </div>
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
      <header className="w-full max-w-4xl mb-6 flex justify-between items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Zap className="w-8 h-8 text-yellow-300 drop-shadow-lg" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            OrdStorm
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline text-sm text-white/90 font-medium drop-shadow">
                {currentUser.username}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 glass-card hover:bg-white/90
                  text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm font-medium btn-premium"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Log ud</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setIsAuthModalOpen(true); setIsRegisterMode(false); setAuthError(null); }}
              className="flex items-center gap-1.5 px-3 py-2 glass-card hover:bg-white/90
                text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm font-medium btn-premium"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Log ind</span>
            </button>
          )}

          <button
            onClick={() => setIsHowToPlayModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 glass-card hover:bg-white/90
              text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm font-medium btn-premium"
          >
            <Info size={16} />
            <span className="hidden sm:inline">Sådan spiller du</span>
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
                <p className="mt-3 text-sky-600 font-medium">Validerer ord...</p>
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

          {/* Game content */}
          {!gameState.isGameOver ? (
            <GameBoard board={gameState.board} onLetterClick={onLetterClickHandler} currentWord={gameState.currentWord} />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[312px] flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100/50 relative overflow-hidden"
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
                Spillet er slut!
              </motion.p>

              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2 relative z-10"
              >
                {gameState.score} point
              </motion.p>

              {currentUser && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-gray-500 mt-2 relative z-10"
                >
                  Personlig rekord: <span className="font-semibold text-indigo-500">{personalBest}</span>
                </motion.p>
              )}

              {/* Save to leaderboard prompt for guests */}
              {!currentUser && scoreToSave && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 text-center relative z-10"
                >
                  <p className="text-sm text-gray-600 mb-3">Gem din score på leaderboardet?</p>
                  <button
                    onClick={() => { setIsAuthModalOpen(true); setIsRegisterMode(true); setAuthError(null); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 mx-auto
                      bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700
                      text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all btn-premium"
                  >
                    <Upload size={18} />
                    Gem Score
                  </button>
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestartGame}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50
                  text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all relative z-10"
              >
                <Repeat size={18} />
                Spil igen
              </motion.button>
            </motion.div>
          )}

          {/* Current word display */}
          <div className="mt-6 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nuværende ord</p>
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
                <span className="text-gray-300 text-lg font-normal">Vælg bogstaver...</span>
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

          {/* Score and stats */}
          <div className="mt-5 flex justify-between items-center px-2 py-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" />
              <span className="text-gray-600 font-medium">Score:</span>
              <motion.span
                key={gameState.score}
                initial={{ scale: 1.3, color: "#22c55e" }}
                animate={{ scale: 1, color: "#4f46e5" }}
                className="font-bold text-2xl"
              >
                {gameState.score}
              </motion.span>
            </div>
            {personalBest > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Trophy size={14} className="text-yellow-500" />
                <span>Rekord:</span>
                <span className="font-semibold text-indigo-500">{personalBest}</span>
              </div>
            )}
          </div>

          {/* Found words */}
          {gameState.foundWords.length > 0 && (
            <div className="mt-3 px-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Fundne ord ({gameState.foundWords.length})</p>
              <div className="text-xs text-gray-600 flex flex-wrap gap-1">
                {gameState.foundWords.slice(-8).map((word, i) => (
                  <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                    {word}
                  </span>
                ))}
                {gameState.foundWords.length > 8 && (
                  <span className="px-2 py-0.5 text-gray-400">+{gameState.foundWords.length - 8} mere</span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!gameState.isGameOver && (
            <div className="mt-6 grid grid-cols-2 gap-3">
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
                Ryd
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
                Indsend
              </motion.button>
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
          <Leaderboard key={leaderboardRefreshKey} currentUserId={currentUser?.id || null} />
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
          &copy; 2025 Mark Jensen &middot; <span className="text-white/80">OrdStorm</span>
        </p>
      </motion.footer>

      {/* How to Play Modal */}
      <HowToPlayModal isOpen={isHowToPlayModalOpen} onClose={() => setIsHowToPlayModalOpen(false)} />

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsAuthModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {isRegisterMode ? "Opret konto" : "Log ind"}
              </h2>

              {scoreToSave && (
                <p className="text-sm text-gray-500 mb-6">
                  Opret en konto for at gemme din score på {scoreToSave.score} point!
                </p>
              )}

              <AuthForm
                isRegister={isRegisterMode}
                onSubmit={handleAuthSubmit}
                onToggleMode={() => { setIsRegisterMode(!isRegisterMode); setAuthError(null); }}
                errorMessage={authError}
                isLoading={authLoading}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
