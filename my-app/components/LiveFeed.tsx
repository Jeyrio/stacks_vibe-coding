import React, { useState, useEffect } from 'react';
import './LiveFeed.css';

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface Game {
  gameId: number;
  player: string;
  result: number;
  betAmount: string;
  payout: string;
  won: boolean;
  jackpotWin: boolean;
}

const LiveFeed: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        fetchLatestGames();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const fetchLatestGames = async () => {
    try {
      const latestGames = await getRecentGames();
      setGames((prev) => [...latestGames, ...prev].slice(0, 20));
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  return (
    <div className="live-feed">
      <div className="live-feed-header">
        <h3>🔴 Live Games</h3>
        <button
          className="pause-btn"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>
      </div>

      <div className="feed-list">
        {games.length === 0 ? (
          <p className="no-games">Waiting for games...</p>
        ) : (
          games.map((game, index) => (
            <div
              key={`${game.gameId}-${index}`}
              className={`feed-item ${game.won ? 'win' : 'loss'} ${
                index === 0 ? 'new' : ''
              }`}
            >
              <div className="feed-player">
                <span className="player-address">
                  {truncateAddress(game.player)}
                </span>
              </div>
              <div className="feed-details">
                <span className="dice-result">🎲 {game.result}</span>
                <span className="bet-amount">{game.betAmount} STX</span>
              </div>
              <div className={`feed-outcome ${game.won ? 'win' : 'loss'}`}>
                {game.won ? (
                  <>
                    <span className="win-label">WIN</span>
                    <span className="payout">+{game.payout} STX</span>
                  </>
                ) : (
                  <span className="loss-label">LOSS</span>
                )}
              </div>
              {game.jackpotWin && (
                <div className="jackpot-badge">🏆 JACKPOT!</div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="feed-stats">
        <div className="stat-item">
          <span className="label">Active Players:</span>
          <span className="value">247</span>
        </div>
        <div className="stat-item">
          <span className="label">Volume (24h):</span>
          <span className="value">1,234 STX</span>
        </div>
      </div>
    </div>
  );
};

async function getRecentGames() {
  // Mock data - replace with actual blockchain calls
  return [
    {
      gameId: Date.now(),
      player: `SP${Math.random().toString(36).substring(2, 15)}`,
      result: Math.floor(Math.random() * 6) + 1,
      betAmount: (Math.random() * 10 + 1).toFixed(1),
      payout: (Math.random() * 50).toFixed(1),
      won: Math.random() > 0.5,
      jackpotWin: Math.random() > 0.95,
    },
  ];
}

export default LiveFeed;