import React from 'react';
import { ScoreEntry } from '../types'; // Assuming types.ts is one level up
import { Crown, CalendarDays } from 'lucide-react';

interface LeaderboardProps {
  allHighScores: Record<string, ScoreEntry[]>; // { username: [ScoreEntry] }
  currentUser: string | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ allHighScores, currentUser }) => {

  const getTodayStartTimestamp = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  };

  const todayStart = getTodayStartTimestamp();

  const getFilteredScores = (filterToday: boolean) => {
    const scores: { username: string; score: number; timestamp: number }[] = [];
    for (const username in allHighScores) {
      if (allHighScores[username] && allHighScores[username].length > 0) {
        const userScores = allHighScores[username];
        userScores.forEach(entry => {
          if (filterToday) {
            if (entry.timestamp >= todayStart) {
              scores.push({ username, score: entry.score, timestamp: entry.timestamp });
            }
          } else {
            scores.push({ username, score: entry.score, timestamp: entry.timestamp });
          }
        });
      }
    }
    // Sort by score descending, then by timestamp descending (newest first for ties)
    // For "All time", we only care about the highest score per user for the top list.
    // For "Today's best", multiple scores from the same user can appear if they are high enough.

    if (!filterToday) { // All-time: get unique top score per user
        const uniqueUserTopScores: { username: string; score: number; timestamp: number }[] = [];
        const userMap = new Map<string, { score: number; timestamp: number }>();

        scores.forEach(s => {
            if (!userMap.has(s.username) || s.score > userMap.get(s.username)!.score) {
                userMap.set(s.username, { score: s.score, timestamp: s.timestamp });
            }
        });

        userMap.forEach((value, key) => {
            uniqueUserTopScores.push({ username: key, score: value.score, timestamp: value.timestamp });
        });
        
        return uniqueUserTopScores.sort((a, b) => {
            if (b.score === a.score) {
                return b.timestamp - a.timestamp; // Newest first for ties
            }
            return b.score - a.score;
        }).slice(0, 10);
    } else { // Today's best: can have multiple scores from same user
        return scores.sort((a, b) => {
            if (b.score === a.score) {
                return b.timestamp - a.timestamp; // Newest first for ties
            }
            return b.score - a.score;
        }).slice(0, 10);
    }
  };

  const todaysBestScores = getFilteredScores(true);
  const allTimeBestScores = getFilteredScores(false);

  const renderScoreList = (title: string, scores: { username: string; score: number }[], icon: React.ReactNode) => {
    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-center text-indigo-600 flex items-center justify-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
        {scores.length === 0 ? (
          <p className="text-center text-gray-500 text-sm p-3 bg-gray-50 rounded-md">Ingen scores endnu.</p>
        ) : (
          <ol className="space-y-1.5">
            {scores.map((entry, index) => (
              <li 
                key={`${title}-${index}-${entry.username}`}
                className={`p-2.5 rounded-lg text-sm flex justify-between items-center shadow-sm ${entry.username === currentUser ? 'bg-sky-100 border border-sky-300' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center">
                    <span className={`mr-2.5 font-medium w-6 text-center ${index < 3 ? 'text-yellow-600' : 'text-gray-500'}`}>{index + 1}.</span>
                    <span className={`font-medium ${entry.username === currentUser ? 'text-sky-700' : 'text-gray-800'}`}>{entry.username}</span>
                </div>
                <span className={`font-bold ${entry.username === currentUser ? 'text-indigo-600' : 'text-indigo-500'}`}>{entry.score}p</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {renderScoreList("Dagens Bedste", todaysBestScores, <CalendarDays size={22} className="text-green-500" />)}
      {renderScoreList("All Time Bedste", allTimeBestScores, <Crown size={22} className="text-yellow-500" />)}
    </div>
  );
};

export default Leaderboard;

