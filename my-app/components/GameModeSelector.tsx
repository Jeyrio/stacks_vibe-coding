import React from 'react';
import './GameModeSelector.css';

interface GameModeSelectorProps {
  gameMode: number;
  setGameMode: (mode: number) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  gameMode,
  setGameMode,
}) => {
  const modes = [
    {
      id: 0,
      name: 'Classic Dice',
      icon: '🎲',
      description: 'Pick a number 1-6',
      multiplier: '5x',
    },
    {
      id: 1,
      name: 'High/Low',
      icon: '📊',
      description: 'Bet high or low',
      multiplier: '2x',
    },
    {
      id: 2,
      name: 'Range Betting',
      icon: '🎯',
      description: 'Bet on ranges',
      multiplier: '3x',
    },
  ];

  return (
    <div className="game-mode-selector">
      {modes.map((mode) => (
        <button
          key={mode.id}
          className={`mode-card ${gameMode === mode.id ? 'active' : ''}`}
          onClick={() => setGameMode(mode.id)}
        >
          <div className="mode-icon">{mode.icon}</div>
          <div className="mode-info">
            <h4>{mode.name}</h4>
            <p>{mode.description}</p>
            <span className="multiplier">{mode.multiplier}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default GameModeSelector;