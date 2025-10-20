import React, { useEffect, useState } from 'react';
import './JackpotDisplay.css';

interface JackpotDisplayProps {
  amount: number;
  gameMode: number;
}

const JackpotDisplay: React.FC<JackpotDisplayProps> = ({ amount, gameMode }) => {
  // Realistic base jackpots per mode
  const getRealisticBaseJackpot = () => {
    const baseJackpots = [2847.39, 1523.67, 982.44]; // Classic, High/Low, Range
    return baseJackpots[gameMode] || 1500;
  };

  // Initialize with static value to avoid hydration mismatch
  const getInitialAmount = () => {
    if (amount > 1) return amount;
    return getRealisticBaseJackpot();
  };

  const [displayAmount, setDisplayAmount] = useState(getInitialAmount());
  const [animatedAmount, setAnimatedAmount] = useState(getInitialAmount());
  const [mounted, setMounted] = useState(false);
  const [incrementSpeed, setIncrementSpeed] = useState(0);

  // Set mounted flag after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Progressive jackpot that grows continuously
  useEffect(() => {
    if (!mounted) return; // Skip on server

    if (amount <= 1) {
      // Realistic progressive jackpot growth
      const baseJackpot = getRealisticBaseJackpot();
      
      // Calculate contribution rate based on simulated activity
      // Between 0.015 and 0.045 STX per second (realistic casino rates)
      const contributionPerSecond = 0.015 + (Math.random() * 0.03);
      
      // Random speed variations to simulate real bets coming in
      const speedVariation = () => {
        return 0.8 + (Math.random() * 0.4); // 0.8x to 1.2x speed
      };

      setIncrementSpeed(contributionPerSecond);

      // Smooth continuous growth every 100ms
      const growthInterval = setInterval(() => {
        setDisplayAmount((prev) => {
          // Occasionally add small random jumps (simulating big bets)
          const randomJump = Math.random() < 0.03 ? (Math.random() * 2) : 0;
          const speedMod = speedVariation();
          const increment = (contributionPerSecond * 0.1 * speedMod) + randomJump;
          return prev + increment;
        });
      }, 100);

      return () => clearInterval(growthInterval);
    } else {
      setDisplayAmount(amount);
    }
  }, [amount, gameMode, mounted]);

  // Smooth animation for display
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimatedAmount((prev) => {
        const diff = displayAmount - prev;
        if (Math.abs(diff) < 0.001) return displayAmount;
        // Smooth interpolation
        return prev + (diff * 0.1);
      });
    }, 16); // ~60fps

    return () => clearInterval(animationInterval);
  }, [displayAmount]);

  return (
    <div className="jackpot-display">
      <div className="jackpot-header">
        <h2>🏆 Progressive Jackpot</h2>
        <span className="jackpot-mode">Mode: {getModeName(gameMode)}</span>
      </div>
      <div className="jackpot-amount">
        <span className="amount-number">{animatedAmount.toFixed(2)}</span>
        <span className="amount-currency">STX</span>
      </div>
      <div className="jackpot-info">
        <p>Win by rolling three 6s in a row!</p>
      </div>
    </div>
  );
};

const getModeName = (mode: number) => {
  const names = ['Classic', 'High/Low', 'Range'];
  return names[mode] || 'Classic';
};

  const getSimulatedJackpot = (mode: number) => {
    // This function is no longer used as we now use continuous progressive growth
    // Kept for backward compatibility
    const baseJackpots = [2847.39, 1523.67, 982.44];
    return baseJackpots[mode] || 1500;
  };

export default JackpotDisplay;