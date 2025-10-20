'use client';

import React, { useState, useEffect } from 'react';
import './GameInterface.css';
import ProbabilityDisplay from './ProbabilityDisplay';
import JackpotDisplay from './JackpotDisplay';
import GameHistory from './GameHistory';
import GameModeSelector from './GameModeSelector';
import BettingPanel from './BettingPanel';
import DiceAnimation from './DiceAnimation';
import contractService from '@/lib/contract-service';

interface GameInterfaceProps {
  userData: any;
  onGameResult: (result: any) => void;
  aiSuggestions: any[];
  onBetChange?: (bet: { betAmount: string; gameMode: number; target: number }) => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
  userData,
  onGameResult,
  aiSuggestions,
  onBetChange,
}) => {
  const [gameMode, setGameMode] = useState(0);
  const [betAmount, setBetAmount] = useState('1');
  const [target, setTarget] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [jackpotAmount, setJackpotAmount] = useState(0);
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [pendingTxId, setPendingTxId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [gameStats, setGameStats] = useState<any>(null);

  useEffect(() => {
    loadJackpotAmount();
    loadGameHistory();
    if (userData?.address) {
      loadPlayerStats();
    }
  }, [gameMode, userData]);

  // Notify parent when bet parameters change
  useEffect(() => {
    if (onBetChange) {
      onBetChange({ betAmount, gameMode, target });
    }
  }, [betAmount, gameMode, target, onBetChange]);

  const loadPlayerStats = async () => {
    if (!userData?.address) return;
    
    try {
      const stats = await contractService.getPlayerStats(userData.address);
      setGameStats(stats);
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
  };

  const loadJackpotAmount = async () => {
    try {
      const jackpot = await contractService.getJackpot(gameMode);
      setJackpotAmount(jackpot);
    } catch (error) {
      console.error('Error loading jackpot:', error);
    }
  };

  const loadGameHistory = async () => {
    if (!userData?.address) return;
    try {
      const history = await contractService.getPlayerGameHistory(userData.address);
      setGameHistory(history);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const placeBet = async () => {
    if (!userData?.address || isPlaying) return;

    const betAmountNum = parseFloat(betAmount);
    if (isNaN(betAmountNum) || betAmountNum < 1 || betAmountNum > 100) {
      alert('Bet amount must be between 1 and 100 STX');
      return;
    }

    // Validate target based on game mode
    if (gameMode === 0 && (target < 1 || target > 6)) {
      alert('Classic mode: target must be 1-6');
      return;
    }
    if (gameMode === 1 && (target < 1 || target > 2)) {
      alert('High-Low mode: target must be 1 (low) or 2 (high)');
      return;
    }
    if (gameMode === 2 && (target < 1 || target > 3)) {
      alert('Range mode: target must be 1, 2, or 3');
      return;
    }

    // Start the betting process immediately (balance check happens in background)
    setIsPlaying(true);
    setShowResult(false);
    setStatusMessage('Waiting for bet approval...');

    try {
      console.log('Placing bet:', { target, gameMode, betAmount: betAmountNum });
      
      await contractService.placeBet({
        target,
        gameMode,
        betAmount: betAmountNum,
        userAddress: userData.address,
        onFinish: async (data: any) => {
          console.log('✅ Bet approved and placed!', data);
          setStatusMessage('✅ Bet approved! Waiting for confirmation...');
          setPendingTxId(data.txId);
          
          // Wait for the transaction to confirm
          if (data.txId) {
            await waitForBetConfirmation(data.txId);
          }
        },
        onCancel: () => {
          console.log('❌ Bet cancelled by user');
          setStatusMessage('');
          setIsPlaying(false);
        },
      });
    } catch (error) {
      console.error('Error placing bet:', error);
      setStatusMessage('');
      alert('Failed to place bet. Please try again.');
      setIsPlaying(false);
    }
  };

  const waitForBetConfirmation = async (txId: string) => {
    try {
      setStatusMessage('⏳ Bet confirmed on blockchain! Rolling dice...');
      console.log('Waiting for bet transaction confirmation:', txId);
      
      const txData = await contractService.pollTransaction(txId, 30, 2000);
      console.log('✅ Bet transaction confirmed:', txData);
      
      // Extract game ID from transaction result
      const gameId = extractGameIdFromTx(txData);
      
      if (!gameId) {
        throw new Error('Could not extract game ID from transaction');
      }
      
      setCurrentGameId(gameId);
      setStatusMessage('🎲 Rolling the dice...');
      
      // Wait 2 blocks before resolving (required by contract)
      await new Promise(resolve => setTimeout(resolve, 20000)); // ~20 seconds for 2 blocks
      
      setStatusMessage('🎯 Checking result...');
      
      // Now resolve the game automatically without wallet popup
      await resolveGameServerSide(gameId);
      
    } catch (error) {
      console.error('Error in bet confirmation:', error);
      setStatusMessage('');
      setIsPlaying(false);
      alert('Bet placed but confirmation failed. Check transaction on explorer.');
    }
  };

  const extractGameIdFromTx = (txData: any): number | null => {
    try {
      // Try to extract game ID from transaction result
      if (txData.tx_result?.repr) {
        const match = txData.tx_result.repr.match(/\(ok u(\d+)\)/);
        if (match) {
          return parseInt(match[1]);
        }
      }
      return null;
    } catch (error) {
      console.error('Error extracting game ID:', error);
      return null;
    }
  };

  const resolveGameServerSide = async (gameId: number) => {
    try {
      console.log('🎲 Resolving game server-side:', gameId);
      
      // Fetch the game data directly from blockchain
      const gameData = await contractService.getGame(gameId);
      
      if (!gameData) {
        throw new Error('Game not found on blockchain');
      }
      
      console.log('📊 Game data fetched:', gameData);
      
      // Check if game is already resolved
      if (gameData.value?.status?.value === 1) {
        // Game already resolved, show result
        await displayGameResult(gameData.value, gameId);
        return;
      }
      
      // Game needs to be resolved - ask user for approval
      setStatusMessage('⏳ Please approve resolution in wallet...');
      
      await contractService.resolveGame({
        gameId,
        onFinish: async (data: any) => {
          console.log('✅ Resolution approved!', data);
          setStatusMessage('⏳ Waiting for resolution confirmation...');
          
          // Wait for resolution confirmation
          await contractService.pollTransaction(data.txId, 30, 2000);
          
          // Fetch the final resolved game data
          const resolvedGameData = await contractService.getGame(gameId);
          
          if (resolvedGameData?.value) {
            await displayGameResult(resolvedGameData.value, gameId);
          }
        },
        onCancel: () => {
          console.log('❌ Resolution cancelled');
          setStatusMessage('');
          setIsPlaying(false);
        },
      });
      
    } catch (error) {
      console.error('Error resolving game:', error);
      setStatusMessage('');
      setIsPlaying(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('abort_by_response')) {
        alert(
          '⚠️ Game resolution failed!\n\n' +
          'Possible reasons:\n' +
          '1. Contract has insufficient balance to pay winnings\n' +
          '2. Game was already resolved\n' +
          '3. Too soon to resolve (need next block)\n\n' +
          'Your bet is safe in the contract. Please try resolving again in a moment, or contact support.'
        );
      } else {
        alert('Could not resolve game. Please try again later or check transaction on explorer.');
      }
    }
  };

  const extractClarityValue = (value: any): any => {
    if (!value) return 0;
    // Handle Clarity {type, value} objects
    if (typeof value === 'object' && 'value' in value) {
      const innerValue = value.value;
      // Recursively extract if nested
      if (typeof innerValue === 'object' && innerValue !== null && 'value' in innerValue) {
        return extractClarityValue(innerValue);
      }
      // Convert string numbers to actual numbers
      if (typeof innerValue === 'string' && !isNaN(Number(innerValue))) {
        return Number(innerValue);
      }
      return innerValue;
    }
    // Convert string numbers to actual numbers
    if (typeof value === 'string' && !isNaN(Number(value))) {
      return Number(value);
    }
    return value;
  };

  const displayGameResult = async (gameData: any, gameId: number) => {
    console.log('🎯 Displaying game result:', gameData);
    
    const diceResult = extractClarityValue(gameData.result);
    const payout = extractClarityValue(gameData.payout);
    const betAmountMicro = extractClarityValue(gameData['bet-amount']);
    const gameTarget = extractClarityValue(gameData.target);
    const mode = extractClarityValue(gameData['game-mode']);
    
    const isWinner = payout > 0;
    
    const result = {
      gameId: gameId,
      diceResult: diceResult,
      payout: contractService.microToStx(payout),
      betAmount: contractService.microToStx(betAmountMicro),
      target: gameTarget,
      gameMode: mode,
      isWinner: isWinner,
      timestamp: new Date().toISOString(),
    };
    
    setLastResult(result);
    setShowResult(true);
    
    // Show clear result message
    if (isWinner) {
      setStatusMessage(`🎉 YOU WON! Dice: ${diceResult} | Payout: ${result.payout.toFixed(2)} STX`);
    } else {
      setStatusMessage(`😔 You Lost. Dice: ${diceResult} | Your pick: ${gameTarget}`);
    }
    
    setGameHistory([result, ...gameHistory]);
    onGameResult(result);
    
    // Reload player stats immediately to update risk calculation
    if (userData?.address) {
      loadPlayerStats();
    }
    
    // Reset after showing result for a bit
    setTimeout(() => {
      setIsPlaying(false);
      setStatusMessage('');
      loadJackpotAmount();
      loadGameHistory();
    }, 5000);
  };



  return (
    <div className="game-interface">
      <JackpotDisplay amount={jackpotAmount} gameMode={gameMode} />
      
      <GameModeSelector gameMode={gameMode} setGameMode={setGameMode} />

      {/* Status Message Display */}
      {statusMessage && (
        <div className="status-message" style={{
          padding: '15px 20px',
          margin: '10px 0',
          borderRadius: '8px',
          backgroundColor: statusMessage.includes('WON') ? '#10b981' : 
                          statusMessage.includes('Lost') ? '#ef4444' : '#3b82f6',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '16px',
          animation: 'fadeIn 0.3s ease-in',
        }}>
          {statusMessage}
        </div>
      )}

      {/* Game Result Display */}
      {showResult && lastResult && (
        <div className="game-result-display" style={{
          padding: '20px',
          margin: '15px 0',
          borderRadius: '12px',
          backgroundColor: lastResult.isWinner ? '#d1fae5' : '#fee2e2',
          border: `3px solid ${lastResult.isWinner ? '#10b981' : '#ef4444'}`,
          textAlign: 'center',
        }}>
          <h3 style={{ 
            color: lastResult.isWinner ? '#065f46' : '#991b1b',
            fontSize: '24px',
            margin: '0 0 10px 0'
          }}>
            {lastResult.isWinner ? '🎉 WINNER! 🎉' : '😔 Better Luck Next Time'}
          </h3>
          <div style={{ fontSize: '48px', margin: '15px 0' }}>
            🎲 {lastResult.diceResult}
          </div>
          <div style={{ color: '#374151', fontSize: '16px' }}>
            <p><strong>Your Pick:</strong> {lastResult.target}</p>
            <p><strong>Dice Result:</strong> {lastResult.diceResult}</p>
            <p><strong>Bet Amount:</strong> {lastResult.betAmount.toFixed(2)} STX</p>
            {lastResult.isWinner && (
              <p style={{ color: '#059669', fontWeight: 'bold', fontSize: '18px' }}>
                <strong>Won:</strong> {lastResult.payout.toFixed(2)} STX
              </p>
            )}
          </div>
        </div>
      )}

      <div className="game-main">
        <DiceAnimation
          isRolling={isPlaying}
          result={lastResult}
          onAnimationComplete={() => setIsPlaying(false)}
        />

        <BettingPanel
          gameMode={gameMode}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          target={target}
          setTarget={setTarget}
          onPlaceBet={placeBet}
          isPlaying={isPlaying}
          disabled={!userData}
          aiSuggestions={aiSuggestions}
        />
      </div>

      <div className="game-info-section">
        <GameHistory history={gameHistory} />
        <ProbabilityDisplay gameMode={gameMode} target={target} />
      </div>
    </div>
  );
};

export default GameInterface;