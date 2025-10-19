import React, { useState, useEffect, useCallback } from "react";
import GameBoard from "./components/Game/GameBoard";
import HowToPlayModal from "./components/Game/HowToPlayModal";
import AuthForm from "./components/Auth/AuthForm";
import Leaderboard from "./components/Game/Leaderboard";
import { GameState, Letter, User, ScoreEntry } from "./types";
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
  Save, // Added for save score button
  UserPlus, // Added for register button
  Trophy,
  Star // Tilføj Star for test
} from "lucide-react";
import { supabase } from "./SupabaseClient.ts"; // Prøv med .ts extension
// Test kommentar for at tvinge re-lint

const App: React.FC = () => {
  // Flyt state deklarationer herop
  const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [highScores, setHighScores] = useState<Record<string, ScoreEntry[]>>({}); 
  const [personalBest, setPersonalBest] = useState<number>(0); 
  const [scoreToSavePostLogin, setScoreToSavePostLogin] = useState<number | null>(null);
  const [promptLoginToSave, setPromptLoginToSave] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>(() => initializeGameState(6, 6));
  console.log(`[App Render] isGameOver: ${gameState.isGameOver}, Score: ${gameState.score}, promptLogin: ${promptLoginToSave}, isLoading: ${gameState.isLoading}, wordListLoading: ${gameState.isWordListLoading}`);

  useEffect(() => {
    console.log("[Initial Load Effect] Attempting to load data from localStorage.");
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        console.log("[Initial Load Effect] Current user loaded:", parsedUser);
      } catch (e) {
        console.error("[Initial Load Effect] Error parsing stored user:", e);
        localStorage.removeItem("currentUser");
      }
    }
    // localStorage for highScores håndteres ikke længere her, da Supabase er kilden
  }, []);

  useEffect(() => {
    console.log("[WordList Init Effect] Running.");
    const initWords = async () => {
      setGameState(prev => ({ ...prev, isWordListLoading: true, wordListErrorMessage: null }));
      await initializeWordList();
      setGameState(prev => ({ ...prev,isWordListLoading: false,wordListErrorMessage: prev.wordListErrorMessage}));
      console.log("[WordList Init Effect] Word list initialized.");
    };
    initWords();
  }, []);

  const saveScore = useCallback(async (scoreToSave: number, userToSaveFor?: User) => {
    console.log("[saveScore Online] Initiated. scoreToSave:", scoreToSave, "userToSaveFor:", userToSaveFor?.username, "currentUser:", currentUser?.username);
    const user = userToSaveFor || currentUser;
    if (!(user && user.username && typeof scoreToSave === 'number' && !isNaN(scoreToSave) && scoreToSave > 0)) {
      console.warn("[saveScore Online] VALIDATION FAILED. User or score invalid. User:", user?.username, "Score:", scoreToSave);
      return;
    }
    console.log("[saveScore Online] Validation PASSED for user:", user.username, "with score:", scoreToSave);
    try {
      const { data, error } = await supabase.from('scores').insert([{ username: user.username, score: scoreToSave }]);
      if (error) {
        console.error("[saveScore Online] Error inserting score into Supabase:", error);
        setGameState(prevState => ({...prevState, errorMessage: "Din score kunne ikke gemmes online. Prøv igen senere."}))
        return;
      }
      console.log("[saveScore Online] Score inserted successfully into Supabase:", data);
      // Trigger re-fetch in Leaderboard or update a shared state if Leaderboard needs to know immediately
    } catch (error) {
      console.error("[saveScore Online] Unexpected error during Supabase insert:", error);
      setGameState(prevState => ({...prevState, errorMessage: "En uventet fejl opstod under online lagring."}))
    }
  }, [currentUser]);

  useEffect(() => {
    console.log(`[GameOver Check Effect] Running. isGameOver: ${gameState.isGameOver}, Score: ${gameState.score}, User: ${currentUser?.username}`);
    if (gameState.isGameOver && gameState.score > 0) {
      console.log("[GameOver Check Effect] Conditions MET (isGameOver=true, score > 0).");
      if (currentUser) {
        console.log("[GameOver Check Effect] Logged in user (", currentUser.username, ") - calling saveScore directly with score:", gameState.score);
        saveScore(gameState.score);
      } else {
        console.log("[GameOver Check Effect] User NOT logged in. Setting scoreToSavePostLogin and promptLoginToSave.");
        setScoreToSavePostLogin(gameState.score);
        setPromptLoginToSave(true);
      }
    } else if (gameState.isGameOver) {
      console.log("[GameOver Check Effect] Game is over, but score is 0 or less. Score:", gameState.score);
    }
  }, [gameState.isGameOver, gameState.score, currentUser]);

  const handleRestartGame = useCallback(() => {
    console.log("[handleRestartGame] Called. Current gameState.isGameOver:", gameState.isGameOver, "Score:", gameState.score, "User:", currentUser?.username);
    if (!gameState.isGameOver && gameState.score > 0 && currentUser) {
      console.log("[handleRestartGame] Conditions met to save score (game not over, score > 0, user logged in).");
      saveScore(gameState.score);
    }
    setGameState(initializeGameState(6, 6));
    setPromptLoginToSave(false);
    setScoreToSavePostLogin(null);
    // Ensure word list loading state is reset if initWords isn't re-run by its own effect
    setGameState(prev => ({ ...prev, isWordListLoading: false, wordListErrorMessage: null})); 
  }, [currentUser, saveScore, gameState.isGameOver, gameState.score]);

  useEffect(() => {
    console.log(`[Letter Interval Effect] Running. isGameOver: ${gameState.isGameOver}, wordListLoading: ${gameState.isWordListLoading}, promptLogin: ${promptLoginToSave}`);
    if (gameState.isGameOver || gameState.isWordListLoading || promptLoginToSave) {
      console.log("[Letter Interval Effect] Conditions met to PREVENT starting/continuing interval.");
      return; // Stopper intervallet eller forhindrer det i at starte
    }
    console.log("[Letter Interval Effect] Setting up new letter interval.");
    const addLetterInterval = setInterval(() => {
      setGameState(prevState => {
        console.log(`[Interval Tick] Interval Fired. PrevState.isGameOver: ${prevState.isGameOver}`);
        if (prevState.isGameOver) {
            console.log("[Interval Tick] Game is already over in prevState, returning prevState.");
            return prevState; 
        }
        const newState = logicAddLetterToBoard(prevState);
        console.log(`[Interval Tick] New state from logicAddLetterToBoard. newState.isGameOver: ${newState.isGameOver}`);
        return newState;
      });
    }, 1000);
    return () => {
      console.log("[Letter Interval Effect] Cleanup: Clearing interval.");
      clearInterval(addLetterInterval);
    };
  }, [gameState.isGameOver, gameState.isWordListLoading, promptLoginToSave]);

  const handleAuthSubmit = (credentials: { username: string; password?: string }) => {
    setAuthLoading(true);
    setAuthError(null);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      let authSuccessful = false;
      let newlyRegisteredUser: User | null = null;

      if (isRegisterMode) {
        if (users[credentials.username]) {
          setAuthError("Brugernavnet eksisterer allerede.");
        } else {
          users[credentials.username] = { username: credentials.username, password: credentials.password };
          localStorage.setItem("users", JSON.stringify(users));
          newlyRegisteredUser = { username: credentials.username };
          setCurrentUser(newlyRegisteredUser);
          setIsAuthModalOpen(false);
          authSuccessful = true;
        }
      } else {
        const user = users[credentials.username];
        if (user && user.password === credentials.password) {
          setCurrentUser({ username: credentials.username });
          setIsAuthModalOpen(false);
          authSuccessful = true;
        } else {
          setAuthError("Ugyldigt brugernavn eller adgangskode.");
        }
      }
      setAuthLoading(false);

      if (authSuccessful && scoreToSavePostLogin !== null) {
        const userToSaveFor = newlyRegisteredUser || { username: credentials.username };
        console.log("[AuthSubmit] Auth successful, calling saveScore for scoreToSavePostLogin:", scoreToSavePostLogin, "User to save for:", userToSaveFor.username);
        saveScore(scoreToSavePostLogin, userToSaveFor);
        setScoreToSavePostLogin(null);
        setPromptLoginToSave(false);
      }
    }, 1000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // Overvej om highscores/personalBest skal nulstilles her, da de er knyttet til brugeren
    // setHighScores({}); // Fjerner alle highscores, hvilket måske ikke er ønsket
    setPersonalBest(0);
  };

  const currentWordString = gameState.currentWord.map((l) => l.char).join("");

  const onLetterClickHandler = useCallback(
    (letter: Letter) => {
      if (gameState.isGameOver || gameState.isLoading || gameState.isWordListLoading || promptLoginToSave) return;
      setGameState((prevState) => logicHandleLetterClick(prevState, letter));
    },
    [gameState.isGameOver, gameState.isLoading, gameState.isWordListLoading, promptLoginToSave]
  );

  const onClearWordHandler = useCallback(() => {
    if (gameState.isGameOver || gameState.isLoading || gameState.isWordListLoading || promptLoginToSave) return;
    setGameState((prevState) => logicClearCurrentWord(prevState));
  }, [gameState.isGameOver, gameState.isLoading, gameState.isWordListLoading, promptLoginToSave]);

  const onSubmitWordHandler = useCallback(() => {
    if (gameState.isGameOver || gameState.isLoading || gameState.isWordListLoading || currentWordString.length < 3 || promptLoginToSave) return;
    setGameState((prevState) => ({ ...prevState, isLoading: true, errorMessage: null }));
    const newState = logicSubmitWord(gameState);
    setGameState({ ...newState, isLoading: false });
  }, [gameState, currentWordString.length, promptLoginToSave]);

  const openAuthToSaveScore = () => {
    setIsRegisterMode(false); 
    setAuthError(null);
    setIsAuthModalOpen(true);
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-sky-200 via-indigo-200 to-purple-300 p-4 font-sans antialiased">
      <header className="w-full max-w-4xl mb-4 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-700">OrdStorm</h1>
        <div className="flex gap-2">
            {currentUser ? (
              <div className="flex items-center">
                <span className="text-sm text-sky-700 font-medium mr-3 hidden sm:inline">Logget ind som: {currentUser.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center active:scale-95 text-sm"
                >
                  <LogOut size={16} className="mr-1.5" /> Log Ud
                </button>
              </div>
            ) : (
              !promptLoginToSave && (
                <button
                  onClick={() => { setIsAuthModalOpen(true); setIsRegisterMode(false); setAuthError(null); }}
                  className="bg-white/80 hover:bg-white text-sky-600 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center active:scale-95"
                >
                  <LogIn size={18} className="mr-2" /> Log Ind
                </button>
              )
            )}
            <button
              onClick={() => setIsHowToPlayModalOpen(true)}
              className="bg-white/80 hover:bg-white text-sky-600 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center active:scale-95"
            >
              <Info size={18} className="mr-2" /> Sådan Spiller Du
            </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-4xl">
        <main className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-2xl w-full lg:w-3/5 relative order-1 lg:order-none">
          {(gameState.isLoading || gameState.isWordListLoading) && (
            <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-20 rounded-xl">
              <Loader2 size={48} className="animate-spin text-sky-500" />
              <p className="mt-3 text-sky-600 font-medium">
                {gameState.isWordListLoading ? "Indlæser ordbog..." : "Validerer ord..."}
              </p>
            </div>
          )}
          {gameState.wordListErrorMessage && (
              <div className="absolute inset-0 bg-red-100/90 flex flex-col items-center justify-center z-20 rounded-xl p-4">
                  <XCircle size={48} className="text-red-500 mb-3" />
                  <p className="text-red-700 font-semibold text-center">Fejl ved indlæsning af ordbog:</p>
                  <p className="text-red-600 text-sm text-center mt-1">{gameState.wordListErrorMessage}</p>
                  <p className="text-red-600 text-xs text-center mt-2">Spillet kan muligvis ikke validere ord korrekt. Prøv at genindlæse siden.</p>
              </div>
          )}
          
          {promptLoginToSave ? (
            <div className="h-[312px] flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-lg border border-blue-200 shadow-inner p-4">
               <p style={{fontSize: '2rem', fontWeight: 'bold'}}>TEST - PROMPT LOGIN</p> 
               {/* Alt oprindeligt indhold er fjernet midlertidigt */}
            </div>
          ) : !gameState.isGameOver ? (
            <GameBoard board={gameState.board} onLetterClick={onLetterClickHandler} currentWord={gameState.currentWord} />
          ) : (
            <div className="h-[312px] flex flex-col items-center justify-center bg-red-50 text-red-700 rounded-lg border border-red-200 shadow-inner">
              <p style={{fontSize: '2rem', fontWeight: 'bold'}}>TEST - GAME OVER (LOGGED IN / SCORE 0)</p>
              {/* 
              <XCircle size={48} className="mb-3" />
              <p className="text-2xl font-bold">Spillet er slut!</p>
              <p className="text-xl mt-2">Din endelige score: <span className="font-extrabold">{gameState.score}</span></p>
              {currentUser && personalBest > 0 && (
                  <p className="text-md mt-1">Din personlige rekord: {personalBest}</p>
              )}
              <button 
                onClick={handleRestartGame} 
                className="mt-8 w-full max-w-xs bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md flex items-center justify-center active:scale-95">
                <Repeat size={20} className="mr-2" /> Start Forfra
              </button>
              */}
            </div>
          )}
          
          {!promptLoginToSave && (
            <>
              <div className="mt-6 text-center">
                <p className="text-sm font-medium text-gray-500">NUVÆRENDE ORD</p>
                <div className="text-3xl font-bold text-sky-700 h-10 flex items-center justify-center bg-gray-50 rounded-md mt-1 shadow-inner min-h-[2.5rem] px-2 break-all truncate">
                  {currentWordString || <span className="text-gray-400 text-xl">Vælg bogstaver</span>}
                </div>
              </div>
              {gameState.errorMessage && (
                <p className="text-sm text-red-600 mt-2 text-center font-medium">{gameState.errorMessage}</p>
              )}
              <div className={`mt-3 ${gameState.errorMessage ? "" : "mt-5"} flex justify-between items-center px-1`}>
                <p className="text-lg text-gray-700">Score: <span className="font-bold text-xl text-indigo-600">{gameState.score}</span></p>
                {currentUser && <p className="text-sm text-gray-500">Personlig Rekord: <span className="font-semibold">{personalBest}</span></p>}
              </div>
              {gameState.foundWords.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                      Fundne ord: <span className="italic text-gray-600">{gameState.foundWords.join(", ")}</span>
                  </div>
              )}
              {!gameState.isGameOver && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={onClearWordHandler}
                    className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    disabled={currentWordString.length === 0 || gameState.isLoading || gameState.isWordListLoading}
                  >
                    <Trash2 size={18} className="mr-2" /> Ryd
                  </button>
                  <button
                    onClick={onSubmitWordHandler}
                    className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center transform hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={currentWordString.length < 3 || gameState.isLoading || gameState.isWordListLoading}
                  >
                    <Send size={18} className="mr-2" /> Indsend
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <aside className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-2xl w-full lg:w-2/5 order-2 lg:order-none">
          <Leaderboard currentUser={currentUser ? currentUser.username : null} />
        </aside>
      </div>

      <footer className="mt-8 text-center text-gray-600 text-xs w-full max-w-4xl">
        <p>&copy; 2025 Mark Jensen, OrdStorm</p>
      </footer>
      <HowToPlayModal isOpen={isHowToPlayModalOpen} onClose={() => setIsHowToPlayModalOpen(false)} />
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl max-w-sm w-full relative">
            <button onClick={() => {setIsAuthModalOpen(false); if(promptLoginToSave && !currentUser) {}}} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-sky-700">
              {isRegisterMode ? "Registrer Ny Bruger" : "Log Ind"}
            </h2>
            <AuthForm
              isRegister={isRegisterMode}
              onSubmit={handleAuthSubmit}
              onToggleMode={() => { setIsRegisterMode(!isRegisterMode); setAuthError(null); }}
              errorMessage={authError}
              isLoading={authLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

