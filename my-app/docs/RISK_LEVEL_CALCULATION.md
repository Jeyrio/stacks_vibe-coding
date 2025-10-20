# Risk Level Calculation - Implementation Guide

## Overview
The Risk Level Display in the AI Assistant now accurately calculates player risk based on real game statistics instead of random numbers.

## Problem Fixed
**Before**: Risk level was calculated using `Math.random() * 100`, showing completely random and meaningless values.

**After**: Risk level is now calculated based on actual player performance metrics with a weighted scoring system.

## Risk Calculation Algorithm

### Data Sources
The risk calculation uses the following metrics from `gameStats`:
- `total-games`: Total number of games played
- `total-wagered`: Total amount bet (in microSTX)
- `total-won`: Total amount won (in microSTX)
- `win-streak`: Current winning streak
- `lose-streak`: Current losing streak

### Risk Factors (Total: 100%)

#### 1. Win Rate (30% weight)
Measures overall profitability of betting strategy.

```typescript
const winRate = totalGames > 0 ? ((totalWon / totalWagered) * 100) : 0;

if (winRate < 30) risk += 30;      // Very poor performance
else if (winRate < 50) risk += 20; // Below average
else if (winRate < 70) risk += 10; // Average performance
// Above 70% = Low risk contribution
```

#### 2. Loss Streak (25% weight)
Identifies players on a losing streak who may be tilting.

```typescript
if (loseStreak >= 5) risk += 25;      // Major losing streak
else if (loseStreak >= 3) risk += 15; // Concerning pattern
else if (loseStreak >= 2) risk += 8;  // Early warning
```

#### 3. Net Loss Percentage (25% weight)
Calculates how much of total wagered amount has been lost.

```typescript
const netProfit = totalWon - totalWagered;
const lossPercentage = totalWagered > 0 ? Math.abs(Math.min(0, netProfit) / totalWagered * 100) : 0;

if (lossPercentage > 50) risk += 25;      // Major losses
else if (lossPercentage > 30) risk += 18; // Significant losses
else if (lossPercentage > 15) risk += 10; // Moderate losses
```

#### 4. Total Games vs Performance (20% weight)
Penalizes persistent poor performance over many games.

```typescript
if (totalGames > 20 && winRate < 45) risk += 20; // Long-term poor performance
else if (totalGames > 10 && winRate < 40) risk += 12; // Mid-term issues
```

## Risk Level Ranges

| Score | Label | Color | Description |
|-------|-------|-------|-------------|
| 0-29 | Low Risk | 🟢 Green (#4CAF50) | Your betting pattern is sustainable |
| 30-69 | Moderate Risk | 🟡 Yellow (#FFC107) | Consider reducing bet sizes |
| 70-100 | High Risk | 🔴 Red (#F44336) | Take a break and review your strategy |

## Implementation Details

### Component Structure
```
AIAssistant
├── Props: suggestions, userData, gameStats
└── RiskMeter
    ├── Props: userData, gameStats
    ├── Calculates risk based on gameStats
    └── Updates whenever gameStats changes
```

### Data Flow
1. `page.tsx` fetches player stats via `fetchPlayerStats()`
2. Stats stored in `gameStats` state
3. `gameStats` passed to `<AIAssistant>` component
4. `<RiskMeter>` receives `gameStats` and calculates risk
5. Risk level updates automatically when stats change

### Clarity Value Extraction
The implementation includes proper Clarity value extraction to handle the `{type, value}` object structure:

```typescript
const extractValue = (val: any): any => {
  if (val && typeof val === 'object' && 'value' in val) {
    const innerValue = val.value;
    return extractValue(innerValue);
  }
  return val;
};
```

## Example Scenarios

### Scenario 1: New Player (Low Risk)
- Total Games: 3
- Win Rate: 66%
- Loss Streak: 0
- **Risk Score**: ~0-10% ✅ Low Risk

### Scenario 2: Moderate Concern
- Total Games: 15
- Win Rate: 45%
- Loss Streak: 3
- Net Loss: 20%
- **Risk Score**: ~43% ⚠️ Moderate Risk

### Scenario 3: High Risk Warning
- Total Games: 25
- Win Rate: 28%
- Loss Streak: 6
- Net Loss: 55%
- **Risk Score**: ~95% 🚨 High Risk

## Files Modified

1. **`/my-app/components/AIAssistant.tsx`**
   - Added `gameStats` prop to `AIAssistantProps`
   - Updated `RiskMeter` to accept and use `gameStats`
   - Implemented weighted risk calculation algorithm
   - Added Clarity value extraction helper

2. **`/my-app/app/page.tsx`**
   - Passed `gameStats` prop to `<AIAssistant>` component

## Testing

To verify the risk level is working:

1. Connect wallet and play several games
2. Check AI Assistant sidebar
3. Risk level should reflect actual performance:
   - Winning consistently → Low risk (green)
   - Mixed results → Moderate risk (yellow)
   - Losing streak → High risk (red)

## Future Enhancements

Potential improvements:
- Add bet size volatility factor (large bet swings = higher risk)
- Include session time/fatigue factor
- Add VIP tier consideration
- Track risk trend over time (getting better/worse)
- Add personalized recommendations based on risk profile
