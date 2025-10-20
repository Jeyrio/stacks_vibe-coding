import React from 'react';
import AchievementBadge from '../components/AchievementBadge';

// Helper function that needs to be at the top
function truncateAddress(address: string) {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const RecentGamesList: React.FC<{ games: any[] }> = ({ games }) => {
  return (
    <div className="recent-games-list">
      {games.length === 0 ? (
        <p>No recent games</p>
      ) : (
        games.slice(0, 5).map((game, index) => (
          <div key={index} className="recent-game-item">
            <span className="game-time">{formatTime(game.timestamp)}</span>
            <span className="game-mode">{game.mode}</span>
            <span className={`game-result ${game.won ? 'win' : 'loss'}`}>
              {game.won ? `+${game.payout} STX` : `-${game.betAmount} STX`}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

const PlayerProfile: React.FC<{ userData: any; gameStats: any }> = ({
  userData,
  gameStats,
}) => {
  return (
    <div className="player-profile">
      <h3>Player Profile</h3>
      <div className="profile-info">
        <div className="profile-item">
          <span className="label">Address:</span>
          <span className="value">
            {truncateAddress(userData?.address || userData?.profile?.stxAddress?.mainnet || 'Unknown')}
          </span>
        </div>
        <div className="profile-item">
          <span className="label">Member Since:</span>
          <span className="value">Jan 2025</span>
        </div>
        <div className="profile-item">
          <span className="label">VIP Status:</span>
          <span className="value vip-badge">
            {getVIPTier(gameStats?.totalWagered)}
          </span>
        </div>
      </div>
    </div>
  );
};

const PerformanceMetrics: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="performance-metrics">
      <div className="metric-row">
        <span>Average Bet Size:</span>
        <strong>5.2 STX</strong>
      </div>
      <div className="metric-row">
        <span>Biggest Win:</span>
        <strong>125 STX</strong>
      </div>
      <div className="metric-row">
        <span>Favorite Game Mode:</span>
        <strong>Classic Dice</strong>
      </div>
      <div className="metric-row">
        <span>Best Streak:</span>
        <strong>12 wins</strong>
      </div>
    </div>
  );
};

const AchievementGrid: React.FC<{ achievements: any[] }> = ({ achievements }) => {
  const mockAchievements = [
    {
      id: '1',
      name: 'First Win',
      description: 'Win your first game',
      icon: '🎉',
      unlocked: true,
    },
    {
      id: '2',
      name: 'Lucky Streak',
      description: 'Win 5 games in a row',
      icon: '🔥',
      unlocked: true,
      progress: 100,
    },
    {
      id: '3',
      name: 'High Roller',
      description: 'Bet 100 STX in a single game',
      icon: '💎',
      unlocked: false,
      progress: 45,
    },
    {
      id: '4',
      name: 'Jackpot Winner',
      description: 'Win a progressive jackpot',
      icon: '🏆',
      unlocked: false,
      progress: 0,
    },
  ];

  return (
    <div className="achievement-grid">
      {mockAchievements.map((achievement) => (
        <AchievementBadge key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
};

// Utility functions
function calculateWinRate(stats: any) {
  if (!stats || stats.totalGames === 0) return 0;
  return ((stats.totalWon / stats.totalWagered) * 100).toFixed(1);
}

function getVIPTier(totalWagered: number = 0) {
  if (totalWagered >= 5000) return 'Diamond';
  if (totalWagered >= 1000) return 'Platinum';
  if (totalWagered >= 500) return 'Gold';
  if (totalWagered >= 100) return 'Silver';
  return 'Bronze';
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

async function fetchComprehensiveStats(address: string) {
  // Mock data - replace with blockchain calls
  return {
    performanceData: [],
    achievements: [],
  };
}