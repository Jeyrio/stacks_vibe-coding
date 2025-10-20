import React from 'react';
import './GameHistory.css';

interface GameHistoryProps {
  history: any[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ history }) => {
  return (
    <div className="game-history">
      <h3>Recent Games</h3>
      <div className="history-list">
        {history.length === 0 ? (
          <p className="no-history">No games played yet</p>
        ) : (
          history.slice(0, 10).map((game, index) => (
            <div key={index} className={`history-item ${game.won ? 'win' : 'loss'}`}>
              <div className="game-dice">{game.diceResult}</div>
              <div className="game-details">
                <span className="game-bet">{game.betAmount} STX</span>
                <span className="game-target">Target: {game.target}</span>
              </div>
              <div className={`game-result ${game.won ? 'win' : 'loss'}`}>
                {game.won ? `+${game.payout} STX` : '-'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameHistory;