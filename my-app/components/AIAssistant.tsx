import React, { useState, useEffect } from 'react';
import './AIAssistant.css';

interface AISuggestion {
  type: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}

interface AIAssistantProps {
  suggestions: AISuggestion[];
  userData: any;
  gameStats?: any;
  currentBet?: {
    betAmount: string;
    gameMode: number;
    target: number;
  };
}

// Define RiskMeter INSIDE the same file, BEFORE AIAssistant
const RiskMeter: React.FC<{ 
  userData: any; 
  gameStats?: any;
  currentBet?: {
    betAmount: string;
    gameMode: number;
    target: number;
  };
}> = ({ userData, gameStats, currentBet }) => {
  const [riskLevel, setRiskLevel] = useState(0);
  const [betRisk, setBetRisk] = useState<any>(null);
  const [performanceRiskDetails, setPerformanceRiskDetails] = useState<any>(null);

  // Helper function to extract values for display
  const extractValueForDisplay = (field: any): string => {
    const extractValue = (val: any): any => {
      if (val && typeof val === 'object' && 'value' in val) {
        return extractValue(val.value);
      }
      return val;
    };
    if (!field) return '0';
    const value = extractValue(field);
    return value !== undefined && value !== null ? String(value) : '0';
  };

  const calculateRiskLevel = React.useCallback(() => {
    console.log('========================================');
    console.log('🎯 [Overall Risk] FUNCTION CALLED');
    console.log('🎯 [Overall Risk] gameStats:', JSON.stringify(gameStats, null, 2));
    console.log('========================================');
    
    if (!gameStats) {
      console.log('🎯 [Overall Risk] No gameStats, setting risk to 0');
      setRiskLevel(0);
      return;
    }

    // Extract actual values from Clarity objects
    const extractValue = (val: any): any => {
      if (val && typeof val === 'object' && 'value' in val) {
        const innerValue = val.value;
        return extractValue(innerValue);
      }
      return val;
    };

    // Try multiple possible data structures
    let totalGames = 0;
    let totalWagered = 0;
    let totalWon = 0;
    let winStreak = 0;

    // Get the actual data object (handle nested Clarity structure)
    const statsData = gameStats.value || gameStats;

    // Structure 1: statsData['total-games'] (with hyphens) - Clarity format
    if (statsData['total-games'] !== undefined) {
      totalGames = extractValue(statsData['total-games']) || 0;
      totalWagered = extractValue(statsData['total-wagered']) || 0;
      totalWon = extractValue(statsData['total-won']) || 0;
      winStreak = extractValue(statsData['win-streak']) || 0;
      console.log('🎯 [Overall Risk] Using hyphenated keys (Clarity format)');
    }
    // Structure 2: statsData.totalGames (camelCase)
    else if (statsData.totalGames !== undefined) {
      totalGames = extractValue(statsData.totalGames) || 0;
      totalWagered = extractValue(statsData.totalWagered) || 0;
      totalWon = extractValue(statsData.totalWinnings || statsData.totalWon) || 0;
      winStreak = extractValue(statsData.winStreak) || 0;
      console.log('🎯 [Overall Risk] Using camelCase keys');
    }
    // Structure 3: Debug - show what we have
    else if (typeof statsData === 'object') {
      const keys = Object.keys(statsData);
      console.log('🎯 [Overall Risk] Available keys:', keys);
      
      for (const key of keys) {
        const value = extractValue(statsData[key]);
        console.log(`🎯 [Overall Risk] Key "${key}":`, value);
      }
    }

    console.log('🎯 [Overall Risk] Extracted values:', {
      totalGames,
      totalWagered,
      totalWon,
      winStreak
    });

    // Don't calculate risk if player hasn't played enough games
    if (totalGames === 0) {
      console.log('🎯 [Overall Risk] No games played yet, setting risk to 0');
      setRiskLevel(0);
      setPerformanceRiskDetails(null);
      return;
    }

    // Convert microSTX to STX for calculations
    const microToStx = (micro: number) => micro / 1000000;
    const wageredStx = microToStx(totalWagered);
    const wonStx = microToStx(totalWon);

    // Calculate Return on Investment (ROI)
    const roi = totalWagered > 0 ? ((totalWon / totalWagered) * 100) : 0;
    
    // Calculate net profit/loss
    const netProfit = totalWon - totalWagered;
    const netProfitStx = microToStx(netProfit);

    let risk = 0;
    const factors: string[] = [];

    // Risk Factor 1: ROI / Profitability (35% weight)
    // ROI < 100% means losing money overall
    if (roi < 50) {
      risk += 35;
      factors.push(`Very low ROI (${roi.toFixed(1)}% - losing >50%)`);
    } else if (roi < 70) {
      risk += 28;
      factors.push(`Low ROI (${roi.toFixed(1)}% - losing 30-50%)`);
    } else if (roi < 85) {
      risk += 20;
      factors.push(`Below average ROI (${roi.toFixed(1)}%)`);
    } else if (roi < 95) {
      risk += 12;
      factors.push(`Slight losses (ROI: ${roi.toFixed(1)}%)`);
    } else if (roi < 100) {
      risk += 5;
      factors.push(`Near break-even (ROI: ${roi.toFixed(1)}%)`);
    } else {
      factors.push(`Profitable! ROI: ${roi.toFixed(1)}%`);
    }

    // Risk Factor 2: Net Loss Amount (30% weight)
    // Large absolute losses are risky regardless of ROI
    if (netProfitStx < -100) {
      risk += 30;
      factors.push(`Heavy losses (${netProfitStx.toFixed(2)} STX)`);
    } else if (netProfitStx < -50) {
      risk += 25;
      factors.push(`Significant losses (${netProfitStx.toFixed(2)} STX)`);
    } else if (netProfitStx < -20) {
      risk += 18;
      factors.push(`Moderate losses (${netProfitStx.toFixed(2)} STX)`);
    } else if (netProfitStx < -10) {
      risk += 12;
      factors.push(`Small losses (${netProfitStx.toFixed(2)} STX)`);
    } else if (netProfitStx < -5) {
      risk += 8;
      factors.push(`Minor losses (${netProfitStx.toFixed(2)} STX)`);
    } else if (netProfitStx < 0) {
      risk += 3;
      factors.push(`Tiny losses (${netProfitStx.toFixed(2)} STX)`);
    } else if (netProfitStx > 0) {
      factors.push(`In profit: +${netProfitStx.toFixed(2)} STX`);
    }

    // Risk Factor 3: No Winning Streak (20% weight)
    // Players on a losing streak (winStreak = 0) are at risk
    if (winStreak === 0 && totalGames > 3) {
      risk += 20;
      factors.push(`Currently on a cold streak (0 win streak)`);
    } else if (winStreak === 1 && totalGames > 5) {
      risk += 8;
      factors.push(`Just broke losing streak`);
    } else if (winStreak > 3) {
      factors.push(`On a hot streak (${winStreak} wins)`);
    }

    // Risk Factor 4: Volume of Play vs Performance (15% weight)
    // Many games with poor performance = high risk
    if (totalGames > 30 && roi < 80) {
      risk += 15;
      factors.push(`High volume with poor returns (${totalGames} games)`);
    } else if (totalGames > 20 && roi < 70) {
      risk += 12;
      factors.push(`Consistent losses over time (${totalGames} games)`);
    } else if (totalGames > 10 && roi < 60) {
      risk += 10;
      factors.push(`Losing pattern emerging (${totalGames} games)`);
    }

    // Cap at 100
    const finalRisk = Math.min(100, risk);
    console.log('🎯 [Overall Risk] Final calculated risk:', finalRisk);
    console.log('🎯 [Overall Risk] ROI:', roi.toFixed(2) + '%', 'Net Profit:', netProfitStx.toFixed(2), 'STX');
    
    setRiskLevel(finalRisk);
    setPerformanceRiskDetails({
      totalGames,
      wageredStx: wageredStx.toFixed(2),
      wonStx: wonStx.toFixed(2),
      roi: roi.toFixed(1),
      netProfitStx: netProfitStx.toFixed(2),
      factors
    });
  }, [gameStats]);

  const calculateBetRisk = React.useCallback(() => {
    if (!currentBet || !gameStats) {
      setBetRisk(null);
      return;
    }

    const extractValue = (val: any): any => {
      if (val && typeof val === 'object' && 'value' in val) {
        const innerValue = val.value;
        return extractValue(innerValue);
      }
      return val;
    };

    const betAmountNum = parseFloat(currentBet.betAmount) || 0;
    if (betAmountNum === 0) {
      setBetRisk(null);
      return;
    }

    let riskScore = 0;
    let factors: string[] = [];

    // Get player stats
    const totalWagered = extractValue(gameStats?.['total-wagered']) || 0;
    const totalWon = extractValue(gameStats?.['total-won']) || 0;
    const winStreak = extractValue(gameStats?.['win-streak']) || 0;
    const totalGames = extractValue(gameStats?.['total-games']) || 0;

    // Calculate multiplier based on game mode
    let multiplier = 1;
    if (currentBet.gameMode === 0) {
      multiplier = 5; // Classic: 1/6 chance
    } else if (currentBet.gameMode === 1) {
      multiplier = 2; // High/Low: 1/2 chance
    } else if (currentBet.gameMode === 2) {
      multiplier = 3; // Range: 1/3 chance
    }

    // Calculate win probability
    let winProbability = 0;
    if (currentBet.gameMode === 0) winProbability = 16.67; // 1 in 6
    else if (currentBet.gameMode === 1) winProbability = 50; // 1 in 2
    else if (currentBet.gameMode === 2) winProbability = 33.33; // 1 in 3

    // Risk Factor 1: Bet Size vs Balance (40% weight)
    const microToStx = (micro: number) => micro / 1000000;
    const totalWageredStx = microToStx(totalWagered);
    const avgBetSize = totalGames > 0 ? totalWageredStx / totalGames : 1;
    
    if (betAmountNum > avgBetSize * 3) {
      riskScore += 40;
      factors.push('Bet 3x larger than average');
    } else if (betAmountNum > avgBetSize * 2) {
      riskScore += 30;
      factors.push('Bet 2x larger than average');
    } else if (betAmountNum > avgBetSize * 1.5) {
      riskScore += 20;
      factors.push('Above average bet size');
    } else if (betAmountNum > avgBetSize) {
      riskScore += 10;
      factors.push('Slightly above average');
    }

    // Risk Factor 2: Win Probability (30% weight)
    if (winProbability < 20) {
      riskScore += 30;
      factors.push('Very low win chance (16.7%)');
    } else if (winProbability < 40) {
      riskScore += 20;
      factors.push('Moderate win chance (33.3%)');
    } else if (winProbability < 60) {
      riskScore += 10;
      factors.push('Good win chance (50%)');
    }

    // Risk Factor 3: No Winning Streak (20% weight)
    // If player has no winning streak and has played some games, they're on a cold streak
    if (winStreak === 0 && totalGames > 3) {
      riskScore += 20;
      factors.push('Currently on a losing streak');
    } else if (winStreak === 1 && totalGames > 5) {
      riskScore += 10;
      factors.push('Just broke a losing streak');
    } else if (winStreak > 5) {
      // On a hot streak - reduce risk slightly
      riskScore = Math.max(0, riskScore - 5);
      factors.push(`On ${winStreak}-win hot streak!`);
    }

    // Risk Factor 4: Current Performance (10% weight)
    const roi = totalWagered > 0 ? (totalWon / totalWagered) * 100 : 0;
    if (roi < 50 && totalGames > 5) {
      riskScore += 10;
      factors.push('Poor overall performance (losing 50%+)');
    } else if (roi < 80 && totalGames > 10) {
      riskScore += 5;
      factors.push('Below average performance');
    }

    // Determine risk level
    let label = 'Low Risk';
    let color = '#4CAF50';
    let emoji = '✅';

    if (riskScore >= 70) {
      label = 'Very High Risk';
      color = '#D32F2F';
      emoji = '🚨';
    } else if (riskScore >= 50) {
      label = 'High Risk';
      color = '#F44336';
      emoji = '⚠️';
    } else if (riskScore >= 30) {
      label = 'Moderate Risk';
      color = '#FFC107';
      emoji = '⚡';
    } else if (riskScore >= 15) {
      label = 'Low-Moderate Risk';
      color = '#8BC34A';
      emoji = '✓';
    }

    setBetRisk({
      risk: Math.min(100, riskScore),
      label,
      color,
      emoji,
      factors,
      winProbability,
      potentialWin: betAmountNum * multiplier,
      potentialLoss: betAmountNum,
    });
  }, [currentBet, gameStats]);

  // Call calculateRiskLevel when gameStats changes
  useEffect(() => {
    calculateRiskLevel();
  }, [calculateRiskLevel]);

  // Call calculateBetRisk when currentBet or gameStats changes
  useEffect(() => {
    calculateBetRisk();
  }, [calculateBetRisk]);

  const getRiskColor = () => {
    if (riskLevel < 30) return '#4CAF50';
    if (riskLevel < 70) return '#FFC107';
    return '#F44336';
  };

  const getRiskLabel = () => {
    if (riskLevel < 30) return 'Low Risk';
    if (riskLevel < 70) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="risk-meter">
      <h4>Risk Assessment</h4>
      
      {/* Current Bet Risk (if user has selected a bet) */}
      {betRisk && (
        <div style={{ 
          border: `2px solid ${betRisk.color}`,
          backgroundColor: `${betRisk.color}15`,
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ color: betRisk.color, fontSize: '14px' }}>
              {betRisk.emoji} Current Bet Risk
            </strong>
            <span style={{ 
              backgroundColor: betRisk.color, 
              color: 'white',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {betRisk.risk.toFixed(0)}%
            </span>
          </div>
          
          <div className="risk-bar-container" style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#eee',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${betRisk.risk}%`,
              height: '100%',
              backgroundColor: betRisk.color,
              transition: 'width 0.3s ease'
            }} />
          </div>

          <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>Win Chance: <strong>{betRisk.winProbability?.toFixed(1)}%</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Win: <strong style={{ color: '#4CAF50' }}>+{betRisk.potentialWin?.toFixed(2)} STX</strong></span>
              <span>Risk: <strong style={{ color: '#F44336' }}>-{betRisk.potentialLoss?.toFixed(2)} STX</strong></span>
            </div>
          </div>

          {betRisk.factors && betRisk.factors.length > 0 && (
            <div style={{ 
              fontSize: '10px', 
              color: '#888', 
              borderTop: '1px solid #ddd', 
              paddingTop: '6px',
              marginTop: '6px'
            }}>
              <div style={{ marginBottom: '3px' }}><em>Risk Factors:</em></div>
              {betRisk.factors.slice(0, 2).map((factor: string, idx: number) => (
                <div key={idx} style={{ marginBottom: '2px' }}>• {factor}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overall Player Risk */}
      <div style={{ opacity: betRisk ? 0.7 : 1 }}>
        <h5 style={{ fontSize: '13px', marginBottom: '8px', color: '#666' }}>Overall Performance Risk</h5>
        {gameStats && extractValueForDisplay((gameStats.value || gameStats)['total-games'] || (gameStats.value || gameStats).totalGames) !== '0' && performanceRiskDetails ? (
          <>
            <div style={{
              height: '8px',
              backgroundColor: '#f0f0f0',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                width: `${riskLevel}%`,
                height: '100%',
                backgroundColor: getRiskColor(),
                transition: 'width 0.3s ease'
              }} />
            </div>

            <div className="risk-label" style={{ color: getRiskColor(), fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
              {getRiskLabel()} ({riskLevel.toFixed(0)}%)
            </div>

            <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>Games Played: <strong>{performanceRiskDetails.totalGames}</strong></span>
                <span>ROI: <strong style={{ color: parseFloat(performanceRiskDetails.roi) >= 100 ? '#4CAF50' : '#F44336' }}>
                  {performanceRiskDetails.roi}%
                </strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Wagered: <strong>{performanceRiskDetails.wageredStx} STX</strong></span>
                <span>Won: <strong>{performanceRiskDetails.wonStx} STX</strong></span>
              </div>
              <div style={{ marginTop: '3px' }}>
                Net: <strong style={{ color: parseFloat(performanceRiskDetails.netProfitStx) >= 0 ? '#4CAF50' : '#F44336' }}>
                  {performanceRiskDetails.netProfitStx} STX
                </strong>
              </div>
            </div>

            {performanceRiskDetails.factors && performanceRiskDetails.factors.length > 0 && (
              <div style={{ 
                fontSize: '10px', 
                color: '#888', 
                borderTop: '1px solid #ddd', 
                paddingTop: '6px',
                marginTop: '6px'
              }}>
                <div style={{ marginBottom: '3px' }}><em>Performance Factors:</em></div>
                {performanceRiskDetails.factors.slice(0, 3).map((factor: string, idx: number) => (
                  <div key={idx} style={{ marginBottom: '2px' }}>• {factor}</div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', margin: '10px 0' }}>
            {userData ? 'Play some games to see your risk assessment' : 'Connect wallet to see risk assessment'}
          </p>
        )}
      </div>
    </div>
  );
};

// NOW define AIAssistant (it can use RiskMeter now)
const AIAssistant: React.FC<AIAssistantProps> = ({ suggestions, userData, gameStats, currentBet }) => {
  const [expanded, setExpanded] = useState(true);
  const [aiInsights, setAiInsights] = useState<AISuggestion[]>([]);

  useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      setAiInsights(suggestions);
    }
  }, [suggestions]);

  const getSuggestionIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      warning: '⚠️',
      strategy: '💡',
      mode: '🎯',
      risk: '🔴',
      success: '✅',
    };
    return icons[type] || '💬';
  };

  const getSuggestionClass = (type: string) => {
    return `suggestion-${type}`;
  };

  return (
    <div className={`ai-assistant ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="ai-header" onClick={() => setExpanded(!expanded)}>
        <h3>🤖 AI Assistant</h3>
        <button className="toggle-btn">{expanded ? '−' : '+'}</button>
      </div>

      {expanded && (
        <div className="ai-content">
          {!userData ? (
            <div className="ai-placeholder">
              <p>Connect your wallet to receive AI-powered betting insights</p>
            </div>
          ) : aiInsights.length === 0 ? (
            <div className="ai-waiting">
              <div className="ai-avatar">🤖</div>
              <p>Play a few games to receive personalized suggestions!</p>
            </div>
          ) : (
            <div className="ai-suggestions">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`ai-suggestion ${getSuggestionClass(insight.type)}`}
                >
                  <div className="suggestion-icon">
                    {getSuggestionIcon(insight.type)}
                  </div>
                  <div className="suggestion-content">
                    <p className="suggestion-message">{insight.message}</p>
                    {insight.action && (
                      <button className="suggestion-action">
                        {insight.actionLabel || 'Apply'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="ai-tips">
            <h4>Quick Tips</h4>
            <ul>
              <li>Start with smaller bets to understand game mechanics</li>
              <li>Set a budget and stick to it</li>
              <li>Higher multipliers mean lower win probability</li>
              <li>Take breaks to avoid emotional betting</li>
            </ul>
          </div>

          <RiskMeter userData={userData} gameStats={gameStats} currentBet={currentBet} />
        </div>
      )}
    </div>
  );
};

export default AIAssistant;