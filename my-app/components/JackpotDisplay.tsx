import React, { useEffect, useState } from 'react';
import './JackpotDisplay.css';

interface JackpotDisplayProps {
  amount: number;
  gameMode: number;
}

const JackpotDisplay: React.FC<JackpotDisplayProps> = ({ amount, gameMode }) => {
  // Realistic base jackpots per mode - starting values
  const getRealisticBaseJackpot = () => {
    const baseJackpots = [150.50, 95.75, 68.25]; // Classic, High/Low, Range - realistic starting amounts
    return baseJackpots[gameMode] || 120;
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

    // Realistic progressive jackpot growth - slower and steadier
    const baseJackpot = getRealisticBaseJackpot();
    
    // Calculate contribution rate based on simulated activity
    // Between 0.003 and 0.01 STX per second (realistic, slower growth)
    const contributionPerSecond = 0.003 + (Math.random() * 0.007);
    
    setIncrementSpeed(contributionPerSecond);

    // Smooth continuous growth every 1 second (realistic update rate)
    const growthInterval = setInterval(() => {
      setDisplayAmount((prev) => {
        // Occasionally add small random jumps (simulating bigger bets)
        const randomJump = Math.random() < 0.05 ? (Math.random() * 0.8) : 0;
        // Small, steady increment per second
        const increment = contributionPerSecond + randomJump;
        return prev + increment;
      });
    }, 1000); // Update every 1 second for smooth, realistic growth

    return () => clearInterval(growthInterval);
  }, [gameMode, mounted]);

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