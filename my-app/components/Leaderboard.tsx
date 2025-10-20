import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

interface LeaderboardEntry {
  address: string;
  stat: number;
  vipTier: string;
  winRate: string;
  gamesPlayed: number;
  isYou: boolean;
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState('volume');
  const [timeFrame, setTimeFrame] = useState('all-time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [activeCategory, timeFrame]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboardData(activeCategory, timeFrame);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'volume', name: 'Total Volume', icon: '💰' },
    { id: 'winnings', name: 'Total Winnings', icon: '🏆' },
    { id: 'streak', name: 'Best Streak', icon: '🔥' },
    { id: 'games', name: 'Most Games', icon: '🎲' },
  ];

  const timeFrames = [
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'all-time', name: 'All Time' },
  ];

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>🏆 Leaderboard</h2>
        <p>Compete with the best players in the BitCoin Dice community</p>
      </div>

      <div className="leaderboard-filters">
        <div className="category-selector">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="timeframe-selector">
          {timeFrames.map((tf) => (
            <button
              key={tf.id}
              className={`timeframe-btn ${timeFrame === tf.id ? 'active' : ''}`}
              onClick={() => setTimeFrame(tf.id)}
            >
              {tf.name}
            </button>
          ))}
        </div>
      </div>

      <div className="leaderboard-table">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>VIP Tier</th>
                <th>{getCategoryLabel(activeCategory)}</th>
                <th>Win Rate</th>
                <th>Games Played</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player, index) => (
                <tr key={player.address} className={index < 3 ? 'top-three' : ''}>
                  <td className="rank-cell">
                    <span className="rank-badge">{getMedalEmoji(index + 1)}</span>
                  </td>
                  <td className="player-cell">
                    <div className="player-info">
                      <span className="player-address">
                        {truncateAddress(player.address)}
                      </span>
                      {player.isYou && <span className="you-badge">You</span>}
                    </div>
                  </td>
                  <td className="tier-cell">
                    <span className={`vip-badge ${player.vipTier}`}>
                      {player.vipTier}
                    </span>
                  </td>
                  <td className="stat-cell">
                    <strong>{formatStat(player.stat, activeCategory)}</strong>
                  </td>
                  <td className="winrate-cell">{player.winRate}%</td>
                  <td className="games-cell">{player.gamesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="leaderboard-footer">
        <button className="load-more-btn">Load More</button>
      </div>
    </div>
  );
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    volume: 'Total Wagered',
    winnings: 'Total Won',
    streak: 'Best Streak',
    games: 'Games Played',
  };
  return labels[category] || 'Value';
};

const formatStat = (value: number, category: string) => {
  if (category === 'volume' || category === 'winnings') {
    return `${value.toFixed(2)} STX`;
  }
  return value;
};

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

async function fetchLeaderboardData(category: string, timeFrame: string): Promise<LeaderboardEntry[]> {
  // Mock data - replace with actual blockchain calls
  return Array.from({ length: 50 }, (_, i) => ({
    address: `SP${Math.random().toString(36).substring(2, 15)}`,
    stat: Math.random() * 1000,
    vipTier: ['Bronze', 'Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 4)],
    winRate: (Math.random() * 60 + 20).toFixed(1),
    gamesPlayed: Math.floor(Math.random() * 1000),
    isYou: i === 0,
  }));
}

export default Leaderboard;