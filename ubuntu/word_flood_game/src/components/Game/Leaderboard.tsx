import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient'; // Juster sti
import { ScoreEntry } from '../../types'; // Juster sti
import { Loader2, AlertTriangle, Trophy } from 'lucide-react'; // Ikoner

interface LeaderboardProps {
  currentUser: string | null;
}

// Hjælpefunktion til at formatere dato for "i dag"
const getTodayDateStrings = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return {
    startISO: startOfDay.toISOString(),
    endISO: endOfDay.toISOString(),
  };
};

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const [dailyScores, setDailyScores] = useState<ScoreEntry[]>([]);
  const [allTimeScores, setAllTimeScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { startISO, endISO } = getTodayDateStrings();

      // Hent All-Time Top 10 Scores
      const { data: allTimeData, error: allTimeError } = await supabase
        .from('scores')
        .select('username, score, created_at') // created_at for tie-breaking
        .order('score', { ascending: false })
        .order('created_at', { ascending: true }) // Ældste først ved samme score
        .limit(10);

      if (allTimeError) {
        console.error("Error fetching all-time scores:", allTimeError);
        throw new Error(`Kunne ikke hente all-time highscores: ${allTimeError.message}`);
      }
      setAllTimeScores(allTimeData || []);

      // Hent Dagens Top 10 Scores
      const { data: dailyData, error: dailyError } = await supabase
        .from('scores')
        .select('username, score, created_at')
        .gte('created_at', startISO)
        .lte('created_at', endISO)
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(10);

      if (dailyError) {
        console.error("Error fetching daily scores:", dailyError);
        throw new Error(`Kunne ikke hente dagens highscores: ${dailyError.message}`);
      }
      setDailyScores(dailyData || []);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("En ukendt fejl opstod under hentning af leaderboard.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
    // Overvej at tilføje en interval-genhentning, hvis leaderboardet skal være mere dynamisk
    // const intervalId = setInterval(fetchLeaderboardData, 60000); // Hent hvert minut
    // return () => clearInterval(intervalId);
  }, [fetchLeaderboardData]);

  if (loading) {
    return (
      <div className="mt-4 p-6 bg-white/80 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 size={32} className="animate-spin text-sky-500 mb-3" />
        <p className="text-sky-600">Indlæser leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-6 bg-red-50 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[200px]">
        <AlertTriangle size={32} className="text-red-500 mb-3" />
        <p className="text-red-700 font-semibold">Fejl</p>
        <p className="text-red-600 text-sm text-center">{error}</p>
        <button 
          onClick={fetchLeaderboardData} 
          className="mt-4 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">
            Prøv igen
          </button>
      </div>
    );
  }

  const renderScoreList = (title: string, scores: ScoreEntry[], icon?: React.ReactNode) => {
    if (scores.length === 0) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-center text-indigo-700 flex items-center justify-center">
            {icon && <span className="mr-2">{icon}</span>}{title}
          </h3>
          <p className="text-center text-sm text-gray-500 p-3 bg-gray-50 rounded-md shadow-inner">Ingen scores endnu.</p>
        </div>
      );
    }
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-center text-indigo-700 flex items-center justify-center">
          {icon && <span className="mr-2">{icon}</span>}{title}
        </h3>
        <ol className="space-y-1.5">
          {scores.map((entry, index) => (
            <li 
              key={`${title}-${entry.username}-${index}`} 
              className={`p-2.5 rounded-md text-sm flex justify-between items-center transition-all
                ${entry.username === currentUser 
                  ? 'bg-sky-100 border border-sky-300 shadow-md' 
                  : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-center">
                <span className="font-semibold text-gray-500 w-6 text-center mr-1.5">{index + 1}.</span>
                <span className={`font-medium ${entry.username === currentUser ? 'text-sky-700' : 'text-gray-700'}`}>{entry.username}</span>
              </div>
              <span className={`font-bold ${entry.username === currentUser ? 'text-sky-600' : 'text-indigo-600'}`}>{entry.score}p</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-100/70 backdrop-blur-sm rounded-xl shadow-xl h-full flex flex-col">
      <button 
        onClick={fetchLeaderboardData} 
        disabled={loading}
        className="absolute top-2 right-2 bg-white/50 p-1 rounded-full text-sky-600 hover:bg-white/80 hover:scale-110 transition-transform disabled:opacity-50"
        title="Genopfrisk leaderboard"
      >
        <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
      </button>
      {renderScoreList("Dagens Bedste", dailyScores, <Trophy size={20} className="text-yellow-500"/>)}
      {renderScoreList("All Time Bedste", allTimeScores, <Trophy size={20} className="text-amber-600"/>)}
    </div>
  );
};

export default Leaderboard;

