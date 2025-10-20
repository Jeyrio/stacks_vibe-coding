import React from 'react';
import './BettingPanel.css';

interface BettingPanelProps {
  gameMode: number;
  betAmount: string;
  setBetAmount: (amount: string) => void;
  target: number;
  setTarget: (target: number) => void;
  onPlaceBet: () => void;
  isPlaying: boolean;
  disabled: boolean;
  aiSuggestions: any[];
}

const BettingPanel: React.FC<BettingPanelProps> = ({
  gameMode,
  betAmount,
  setBetAmount,
  target,
  setTarget,
  onPlaceBet,
  isPlaying,
  disabled,
  aiSuggestions,
}) => {
  const quickBetAmounts = ['1', '5', '10', '25', '50'];

  const renderTargetSelector = () => {
    if (gameMode === 0) {
      // Classic mode: 1-6
      return (
        <div className="target-grid">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              className={`target-button ${target === num ? 'active' : ''}`}
              onClick={() => setTarget(num)}
            >
              {num}
            </button>
          ))}
        </div>
      );
    } else if (gameMode === 1) {
      // High/Low mode
      return (
        <div className="target-buttons">
          <button
            className={`target-button high-low ${target === 1 ? 'active' : ''}`}
            onClick={() => setTarget(1)}
          >
            LOW (1-3)
          </button>
          <button
            className={`target-button high-low ${target === 2 ? 'active' : ''}`}
            onClick={() => setTarget(2)}
          >
            HIGH (4-6)
          </button>
        </div>
      );
    } else {
      // Range mode
      return (
        <div className="target-buttons">
          <button
            className={`target-button range ${target === 1 ? 'active' : ''}`}
            onClick={() => setTarget(1)}
          >
            1-2
          </button>
          <button
            className={`target-button range ${target === 2 ? 'active' : ''}`}
            onClick={() => setTarget(2)}
          >
            3-4
          </button>
          <button
            className={`target-button range ${target === 3 ? 'active' : ''}`}
            onClick={() => setTarget(3)}
          >
            5-6
          </button>
        </div>
      );
    }
  };

  return (
    <div className="betting-panel">
      <h3>Place Your Bet</h3>

      <div className="bet-amount-section">
        <label>Bet Amount (STX)</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          min="1"
          step="0.1"
          disabled={isPlaying}
        />
        <div className="quick-bet-buttons">
          {quickBetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              disabled={isPlaying}
            >
              {amount} STX
            </button>
          ))}
        </div>
      </div>

      <div className="target-section">
        <label>Select Target</label>
        {renderTargetSelector()}
      </div>

      {aiSuggestions && aiSuggestions.length > 0 && aiSuggestions[0]?.message && (
        <div className="ai-suggestions-mini">
          <p>💡 {String(aiSuggestions[0].message)}</p>
        </div>
      )}

      <button
        className="place-bet-button"
        onClick={onPlaceBet}
        disabled={disabled || isPlaying}
      >
        {isPlaying ? '🎲 Rolling...' : '🎲 Roll Dice'}
      </button>

      {disabled && !isPlaying && (
        <p className="connect-prompt">Connect wallet to play</p>
      )}
    </div>
  );
};

export default BettingPanel;