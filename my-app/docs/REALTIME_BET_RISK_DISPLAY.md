# Real-Time Bet Risk Display - Implementation Guide

## Overview
The betting panel now displays **accurate, real-time risk assessment** for each bet BEFORE the user places it. This helps players make informed decisions based on their current betting situation.

## Problem Solved
**Before**: Users had no idea of the risk they were taking when selecting bet amounts and targets.

**After**: Every bet selection shows:
- ✅ Risk percentage with color-coded visual indicator
- ✅ Win probability for the selected game mode
- ✅ Potential win and loss amounts
- ✅ Specific risk factors based on player's history
- ✅ Real-time updates as bet amount or target changes

## Features

### 1. Dynamic Risk Calculation
The risk score is calculated using a **weighted algorithm** based on multiple factors:

#### Risk Factor 1: Bet Size vs Average (40% weight)
Compares current bet to player's average bet size:
```typescript
if (betAmount > avgBet * 3) → +40% risk (Bet 3x larger than average)
if (betAmount > avgBet * 2) → +30% risk (Bet 2x larger than average)
if (betAmount > avgBet * 1.5) → +20% risk (Above average bet size)
if (betAmount > avgBet) → +10% risk (Slightly above average)
```

#### Risk Factor 2: Win Probability (30% weight)
Based on game mode selected:
```typescript
Classic (1/6 = 16.7%): +30% risk (Very low win chance)
Range (1/3 = 33.3%): +20% risk (Moderate win chance)
High/Low (1/2 = 50%): +10% risk (Good win chance)
```

#### Risk Factor 3: Current Losing Streak (20% weight)
Warns players who may be tilting:
```typescript
if (loseStreak >= 5) → +20% risk (On 5+ game losing streak)
if (loseStreak >= 3) → +15% risk (On 3-4 game losing streak)
if (loseStreak >= 2) → +8% risk (Recent losses)
```

#### Risk Factor 4: Current Performance (10% weight)
Overall player performance:
```typescript
if (winRate < 30% && totalGames > 5) → +10% risk (Poor recent performance)
if (winRate < 50% && totalGames > 10) → +5% risk (Below average performance)
```

### 2. Risk Level Categories

| Score | Label | Color | Emoji | Description |
|-------|-------|-------|-------|-------------|
| 0-14 | Low Risk | 🟢 Green | ✅ | Safe bet within normal parameters |
| 15-29 | Low-Moderate Risk | 🟢 Light Green | ✓ | Slightly elevated but manageable |
| 30-49 | Moderate Risk | 🟡 Yellow | ⚡ | Consider reducing bet size |
| 50-69 | High Risk | 🔴 Red | ⚠️ | Risky bet - proceed with caution |
| 70-100 | Very High Risk | 🔴 Dark Red | 🚨 | Extremely risky - strongly discouraged |

### 3. Visual Display Components

#### Risk Header
- Risk emoji and label (e.g., "⚡ Bet Risk: Moderate Risk")
- Risk percentage badge (e.g., "42%")
- Color-coded border and background

#### Risk Progress Bar
- Animated fill showing risk level
- Color matches risk category
- Smooth transitions when bet changes

#### Bet Details
- **Win Chance**: Shows probability of winning (16.7%, 33.3%, or 50%)
- **Potential Win**: Green text showing possible payout (e.g., "+25.00 STX")
- **Risk Amount**: Red text showing potential loss (e.g., "-5.00 STX")

#### Risk Factors List
- Shows top 2 specific reasons for risk level
- Examples:
  - "Bet 3x larger than average"
  - "Very low win chance (16.7%)"
  - "On 5-game losing streak"
  - "Poor recent performance"

## Implementation Details

### Component Structure
```
BettingPanel
├── Props: userData, gameStats (new)
├── calculateBetRisk() function
│   ├── Extracts player stats from Clarity objects
│   ├── Calculates weighted risk score
│   └── Returns risk object with display data
└── Real-time risk display UI
    ├── Updates on betAmount change
    ├── Updates on target change
    ├── Updates on gameMode change
    └── Updates when gameStats reload after game
```

### Data Flow
1. **GameInterface** fetches player stats via `loadPlayerStats()`
2. Stats passed to **BettingPanel** as `gameStats` prop
3. **calculateBetRisk()** runs whenever:
   - Bet amount changes
   - Target changes
   - Game mode changes
   - Player stats update (after game completion)
4. UI displays risk in real-time with smooth transitions

### Integration Points

#### GameInterface.tsx Changes
```typescript
// Added state for game stats
const [gameStats, setGameStats] = useState<any>(null);

// Load stats on mount and when userData changes
const loadPlayerStats = async () => {
  if (!userData?.address) return;
  const stats = await contractService.getPlayerStats(userData.address);
  setGameStats(stats);
};

// Reload stats after each game
displayGameResult() {
  // ... existing code ...
  if (userData?.address) {
    loadPlayerStats(); // Refresh stats for updated risk
  }
}

// Pass to BettingPanel
<BettingPanel
  userData={userData}
  gameStats={gameStats}
  // ... other props
/>
```

#### BettingPanel.tsx Changes
```typescript
interface BettingPanelProps {
  // ... existing props
  userData?: any;
  gameStats?: any;
}

// Calculate risk dynamically
const betRisk = calculateBetRisk();

// Display in UI
{parseFloat(betAmount) > 0 && (
  <div className="bet-risk-display">
    {/* Risk visualization */}
  </div>
)}
```

## Example Scenarios

### Scenario 1: Conservative Bet (Low Risk ✅)
**Setup:**
- Bet: 2 STX
- Average bet: 3 STX
- Mode: High/Low (50% chance)
- Streak: No losses

**Result:**
- Risk Score: 10%
- Label: "Low Risk" (Green)
- Factors: None shown
- Display: "✅ Bet Risk: Low Risk | Win Chance: 50.0% | Potential: +4.00 STX"

---

### Scenario 2: Moderate Bet (Moderate Risk ⚡)
**Setup:**
- Bet: 10 STX
- Average bet: 3 STX
- Mode: Range (33.3% chance)
- Streak: 2 losses

**Result:**
- Risk Score: 48%
- Label: "Moderate Risk" (Yellow)
- Factors:
  - "Bet 3x larger than average"
  - "Moderate win chance (33.3%)"
- Display: "⚡ Bet Risk: Moderate Risk | Win Chance: 33.3% | Potential: +30.00 STX | Risk: -10.00 STX"

---

### Scenario 3: Aggressive Bet (Very High Risk 🚨)
**Setup:**
- Bet: 25 STX
- Average bet: 3 STX
- Mode: Classic (16.7% chance)
- Streak: 6 losses
- Performance: 25% win rate over 15 games

**Result:**
- Risk Score: 95%
- Label: "Very High Risk" (Dark Red)
- Factors:
  - "Bet 3x larger than average"
  - "Very low win chance (16.7%)"
  - "On 6-game losing streak"
  - "Poor recent performance"
- Display: "🚨 Bet Risk: Very High Risk | Win Chance: 16.7% | Potential: +125.00 STX | Risk: -25.00 STX"

## User Experience Benefits

### 1. Informed Decision Making
Players see exactly what they're risking before committing their tokens.

### 2. Tilt Prevention
High-risk warnings when players are on losing streaks help prevent emotional betting.

### 3. Bankroll Management
Visual feedback on bet size vs. average helps maintain consistent betting patterns.

### 4. Educational Value
Risk factors teach players about probability and smart betting strategies.

### 5. Transparency
No hidden calculations - users understand why their bet is considered risky.

## Files Modified

1. **`/my-app/components/BettingPanel.tsx`**
   - Added `userData` and `gameStats` props
   - Implemented `calculateBetRisk()` function with weighted algorithm
   - Added real-time risk display UI with progress bar, factors, and details
   - Added TypeScript type definitions for risk object

2. **`/my-app/components/GameInterface.tsx`**
   - Added `gameStats` state
   - Implemented `loadPlayerStats()` function
   - Stats reload after each game completion
   - Pass `userData` and `gameStats` to BettingPanel

## Testing Recommendations

### Test Case 1: New Player
- **Action**: Place first bet (2 STX on High/Low)
- **Expected**: Low risk (0-15%), minimal factors shown

### Test Case 2: Bet Size Variation
- **Action**: Increase bet from 1 STX → 5 STX → 10 STX
- **Expected**: Risk increases proportionally, "larger than average" factor appears

### Test Case 3: Losing Streak
- **Action**: Lose 3 games in a row, place another bet
- **Expected**: Risk increases by 15%, "losing streak" factor appears

### Test Case 4: Game Mode Impact
- **Action**: Compare same 5 STX bet across all modes
- **Expected**: 
  - Classic (16.7%): Highest risk
  - Range (33.3%): Medium risk
  - High/Low (50%): Lowest risk

### Test Case 5: Real-time Updates
- **Action**: Type bet amount in input field
- **Expected**: Risk display updates smoothly as you type

## Future Enhancements

Potential improvements:
1. **Historical Risk Tracking**: Chart showing risk levels of past bets
2. **Risk Limit Settings**: User-defined max risk threshold with warnings
3. **Suggested Bet Amount**: AI recommendation for optimal bet size
4. **Risk vs. Reward Graph**: Visual representation of risk/reward ratio
5. **Session Risk Monitor**: Track cumulative risk across gaming session
6. **Cooling Period**: Enforce break after multiple high-risk bets
7. **Achievement Integration**: Reward responsible low-risk betting patterns

## Conclusion

The Real-Time Bet Risk Display provides players with crucial information to make informed betting decisions. By combining multiple risk factors into a clear, visual assessment, users can better manage their bankroll and avoid impulsive, high-risk bets.
