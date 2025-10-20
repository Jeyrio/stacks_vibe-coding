import React, { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import AchievementBadge from './AchievementBadge';
import PerformanceChart from './PerformanceChart';
import './PlayerDashboard.css';
import { WalletInfo } from '@/types/wallet';
import contractService from '@/lib/contract-service';

// Import helper functions and components

// Helper to extract value from Clarity response objects
function extractValue(clarityValue: any): any {
  if (!clarityValue) return 0;
  // Handle Clarity value objects {type, value}
  if (typeof clarityValue === 'object' && 'value' in clarityValue) {
    const innerValue = clarityValue.value;
    // Recursively extract if nested
    if (typeof innerValue === 'object' && innerValue !== null && 'value' in innerValue) {
      return extractValue(innerValue);
    }
    // Convert string numbers to actual numbers
    if (typeof innerValue === 'string' && !isNaN(Number(innerValue))) {
      return Number(innerValue);
    }
    return innerValue;
  }
  // Convert string numbers to actual numbers
  if (typeof clarityValue === 'string' && !isNaN(Number(clarityValue))) {
    return Number(clarityValue);
  }
  return clarityValue;
}

function calculateWinRate(stats: any) {
  if (!stats) return 0;
  const totalGames = extractValue(stats['total-games']);
  const totalWon = extractValue(stats['total-won']);
  const totalWagered = extractValue(stats['total-wagered']);
  
  if (totalGames === 0 || totalWagered === 0) return 0;
  return ((totalWon / totalWagered) * 100).toFixed(1);
}

function getVIPTierName(tierValue: any = 0) {
  const tierNumber = extractValue(tierValue);
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  return tiers[tierNumber] || 'Bronze';
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function fetchComprehensiveStats(address: string) {
  try {
    const stats = await contractService.getPlayerStats(address);
    // Don't return the raw Clarity stats object - it's not used in detailedStats
    // We only use it from gameStats prop which is processed separately
    return {
      performanceData: [],
      achievements: Array.isArray(stats?.achievements) ? stats.achievements : [],
    };
  } catch (error) {
    console.error('Error fetching comprehensive stats:', error);
    return {
      performanceData: [],
      achievements: [],
    };
  }
}

const RecentGamesList: React.FC<{ games: any[] }> = ({ games }) => {
  return (
    <div className="recent-games-list">
      {games.length === 0 ? (
        <p>No recent games</p>
      ) : (
        games.slice(0, 5).map((game: any, index: number) => (
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

const PlayerProfile: React.FC<{ userData: WalletInfo; gameStats: any }> = ({
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
            {truncateAddress(userData.address)}
          </span>
        </div>
        <div className="profile-item">
          <span className="label">Member Since:</span>
          <span className="value">Jan 2025</span>
        </div>
        <div className="profile-item">
          <span className="label">VIP Status:</span>
          <span className="value vip-badge">
            {getVIPTierName(gameStats?.['vip-tier'])}
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

interface PlayerDashboardProps {
  userData: WalletInfo | null;
  gameStats: any;
}

interface DetailedStats {
  performanceData: any[];
  achievements: any[];
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ userData, gameStats }) => {
  const [activeView, setActiveView] = useState('overview');
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);

  useEffect(() => {
    if (userData) {
      loadDetailedStats();
    }
  }, [userData]);

  const loadDetailedStats = async () => {
    if (!userData) return;
    // Fetch comprehensive player statistics
    const stats = await fetchComprehensiveStats(userData.address);
    setDetailedStats(stats);
  };

  if (!userData) {
    return (
      <div className="player-dashboard">
        <div className="dashboard-empty">
          <h2>📊 Player Dashboard</h2>
          <p>Connect your wallet to view your statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-dashboard">
      <div className="dashboard-header">
        <h2>Player Dashboard</h2>
        <div className="view-selector">
          <button
            className={activeView === 'overview' ? 'active' : ''}
            onClick={() => setActiveView('overview')}
          >
            Overview
          </button>
          <button
            className={activeView === 'performance' ? 'active' : ''}
            onClick={() => setActiveView('performance')}
          >
            Performance
          </button>
          <button
            className={activeView === 'achievements' ? 'active' : ''}
            onClick={() => setActiveView('achievements')}
          >
            Achievements
          </button>
        </div>
      </div>

      {activeView === 'overview' && (
        <div className="dashboard-overview">
          <div className="stats-grid">
            <StatsCard
              title="Total Games"
              value={extractValue(gameStats?.['total-games']) || 0}
              icon="🎲"
              trend="+12"
            />
            <StatsCard
              title="Total Wagered"
              value={`${contractService.microToStx(extractValue(gameStats?.['total-wagered']) || 0).toFixed(2)} STX`}
              icon="💰"
              trend="+8.5%"
            />
            <StatsCard
              title="Total Won"
              value={`${contractService.microToStx(extractValue(gameStats?.['total-won']) || 0).toFixed(2)} STX`}
              icon="🏆"
              trend="+15.2%"
            />
            <StatsCard
              title="Win Rate"
              value={`${calculateWinRate(gameStats)}%`}
              icon="📈"
              trend="+2.1%"
            />
            <StatsCard
              title="Current Streak"
              value={extractValue(gameStats?.['win-streak']) || 0}
              icon="🔥"
              trend="Active"
            />
            <StatsCard
              title="VIP Tier"
              value={getVIPTierName(gameStats?.['vip-tier'])}
              icon="⭐"
              trend={getVIPTierName(gameStats?.['vip-tier'])}
            />
          </div>

          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <RecentGamesList games={gameStats?.recentGames || []} />
          </div>

          <div className="player-profile-section">
            <PlayerProfile userData={userData} gameStats={gameStats} />
          </div>
        </div>
      )}

      {activeView === 'performance' && (
        <div className="dashboard-performance">
          <PerformanceChart data={detailedStats?.performanceData} />
          <div className="performance-metrics">
            <h3>Performance Breakdown</h3>
            <PerformanceMetrics stats={detailedStats} />
          </div>
        </div>
      )}

      {activeView === 'achievements' && (
        <div className="dashboard-achievements">
          <h3>Achievements & Badges</h3>
          <AchievementGrid achievements={detailedStats?.achievements || []} />
        </div>
      )}
    </div>
  );
};

export default PlayerDashboard;