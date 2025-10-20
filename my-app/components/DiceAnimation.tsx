import React, { useEffect, useState } from 'react';
import './DiceAnimation.css';

interface DiceAnimationProps {
  isRolling: boolean;
  result: any;
  onAnimationComplete: () => void;
}

const DiceAnimation: React.FC<DiceAnimationProps> = ({
  isRolling,
  result,
  onAnimationComplete,
}) => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isRolling) {
      setAnimationClass('rolling');
      const interval = setInterval(() => {
        setCurrentNumber(Math.floor(Math.random() * 6) + 1);
      }, 100);

      return () => clearInterval(interval);
    } else if (result) {
      setAnimationClass('landing');
      setTimeout(() => {
        setCurrentNumber(result.diceResult);
        setAnimationClass('');
        onAnimationComplete();
      }, 500);
    }
  }, [isRolling, result]);

  const getDiceFace = (number: number) => {
    // Proper dice dot positioning for each number
    switch (number) {
      case 1:
        return <div className="dot dot-center" />;
      case 2:
        return (
          <>
            <div className="dot dot-top-left" />
            <div className="dot dot-bottom-right" />
          </>
        );
      case 3:
        return (
          <>
            <div className="dot dot-top-left" />
            <div className="dot dot-center" />
            <div className="dot dot-bottom-right" />
          </>
        );
      case 4:
        return (
          <>
            <div className="dot dot-top-left" />
            <div className="dot dot-top-right" />
            <div className="dot dot-bottom-left" />
            <div className="dot dot-bottom-right" />
          </>
        );
      case 5:
        return (
          <>
            <div className="dot dot-top-left" />
            <div className="dot dot-top-right" />
            <div className="dot dot-center" />
            <div className="dot dot-bottom-left" />
            <div className="dot dot-bottom-right" />
          </>
        );
      case 6:
        return (
          <>
            <div className="dot dot-top-left" />
            <div className="dot dot-top-right" />
            <div className="dot dot-middle-left" />
            <div className="dot dot-middle-right" />
            <div className="dot dot-bottom-left" />
            <div className="dot dot-bottom-right" />
          </>
        );
      default:
        return <div className="dot dot-center" />;
    }
  };

  return (
    <div className="dice-animation-container">
      <div className={`dice ${animationClass}`}>
        <div className="dice-face">{getDiceFace(currentNumber)}</div>
      </div>

      {result && !isRolling && (
        <div className={`result-banner ${result.isWinner ? 'win' : 'loss'}`}>
          {result.isWinner ? (
            <>
              <h2>🎉 YOU WIN! 🎉</h2>
              <p className="win-amount">+{result.payout.toFixed(2)} STX</p>
            </>
          ) : (
            <>
              <h2>😔 Try Again!</h2>
              <p>Better luck next time</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DiceAnimation;