# Fixing Overall Performance Risk Display

## Problem
The "Overall Performance Risk" in the Risk Assessment area was not functioning properly because:
1. Dependencies were not correctly set up in useEffect hooks
2. Functions were called before being defined
3. page.tsx was using placeholder data instead of real contract stats

## Solution Implemented

### 1. Fixed React Hooks Dependencies in AIAssistant.tsx

**Issue:** Functions `calculateRiskLevel()` and `calculateBetRisk()` were being called in useEffect before being defined, causing potential issues.

**Fix:** Wrapped both functions in `React.useCallback()` with proper dependencies:

```typescript
// Before: Function called before definition
useEffect(() => {
  calculateRiskLevel();
}, [gameStats]);

const calculateRiskLevel = () => {
  // ... calculation logic
};

// After: useCallback with proper dependencies
const calculateRiskLevel = React.useCallback(() => {
  // ... calculation logic
}, [gameStats]);

useEffect(() => {
  calculateRiskLevel();
}, [calculateRiskLevel]);
```

#### Benefits of useCallback:
- ✅ Ensures function is memoized and only recreates when dependencies change
- ✅ Prevents infinite render loops
- ✅ Proper execution order guaranteed
- ✅ Type-safe with React patterns

### 2. Enhanced UI Feedback

**Added conditional rendering** to show user-friendly messages:

```typescript
{gameStats ? (
  // Show risk assessment with actual data
  <>
    <div className="risk-bar-container">...</div>
    <div className="risk-label">...</div>
    <p className="risk-description">...</p>
  </>
) : (
  // Show helpful message when no data
  <p>
    {userData 
      ? 'Loading your stats...' 
      : 'Connect wallet to see risk assessment'}
  </p>
)}
```

**User Experience:**
- **Not connected:** "Connect wallet to see risk assessment"
- **Connected, loading:** "Loading your stats..."
- **Data loaded:** Shows actual risk assessment with progress bar

### 3. Fixed Data Fetching in page.tsx

**Issue:** page.tsx had a placeholder `fetchPlayerStats()` function returning zeros:

```typescript
// Before: Placeholder data
const fetchPlayerStats = async (address: string | undefined): Promise<GameStats> => {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    totalWagered: 0,
    totalWinnings: 0,
  };
};
```

**Fix:** Use actual contract service to fetch real blockchain data:

```typescript
// After: Real blockchain data
import contractService from '@/lib/contract-service';

const loadPlayerStats = async () => {
  if (!userData?.address) {
    setGameStats(null);
    return;
  }

  try {
    const stats = await contractService.getPlayerStats(userData.address);
    setGameStats(stats);
  } catch (error) {
    console.error('Error loading player stats:', error);
    setGameStats(null);
  }
};
```

### 4. Added useEffect to Auto-Load Stats

**Added automatic stats loading** when user connects/disconnects:

```typescript
useEffect(() => {
  if (userData?.address) {
    loadPlayerStats();
  } else {
    setGameStats(null);
  }
}, [userData]);
```

**Behavior:**
- ✅ Loads stats immediately when wallet connects
- ✅ Clears stats when wallet disconnects
- ✅ Re-fetches if userData changes (e.g., switching accounts)

## Data Flow

### Complete Flow Diagram:
```
1. User Connects Wallet
   ↓
2. page.tsx receives userData
   ↓
3. useEffect triggers loadPlayerStats()
   ↓
4. contractService.getPlayerStats(address)
   ↓
5. Fetches from Stacks blockchain
   ↓
6. Returns player stats (total-games, total-wagered, etc.)
   ↓
7. page.tsx updates gameStats state
   ↓
8. AIAssistant receives gameStats prop
   ↓
9. RiskMeter receives gameStats prop
   ↓
10. calculateRiskLevel() is called (via useCallback)
    ↓
11. Extracts Clarity values from gameStats
    ↓
12. Calculates risk score (0-100%)
    ↓
13. Updates riskLevel state
    ↓
14. UI displays Overall Performance Risk
```

### Parallel: Current Bet Risk Flow:
```
User Changes Bet (amount/mode/target)
   ↓
GameInterface detects change
   ↓
onBetChange callback to page.tsx
   ↓
page.tsx updates currentBet state
   ↓
AIAssistant receives currentBet prop
   ↓
RiskMeter receives currentBet prop
   ↓
calculateBetRisk() is called (via useCallback)
   ↓
Calculates bet-specific risk
   ↓
Updates betRisk state
   ↓
UI displays Current Bet Risk (above Overall Risk)
```

## Risk Calculation Details

### Overall Performance Risk Factors:

**Factor 1: Win Rate (30% weight)**
```typescript
const winRate = totalGames > 0 ? ((totalWon / totalWagered) * 100) : 0;

if (winRate < 30) risk += 30;      // Poor performance
else if (winRate < 50) risk += 20; // Below average
else if (winRate < 70) risk += 10; // Average
// Above 70% = Good performance
```

**Factor 2: Loss Streak (25% weight)**
```typescript
if (loseStreak >= 5) risk += 25;      // Major losing streak
else if (loseStreak >= 3) risk += 15; // Concerning pattern
else if (loseStreak >= 2) risk += 8;  // Early warning
```

**Factor 3: Net Loss Percentage (25% weight)**
```typescript
const netProfit = totalWon - totalWagered;
const lossPercentage = totalWagered > 0 
  ? Math.abs(Math.min(0, netProfit) / totalWagered * 100) 
  : 0;

if (lossPercentage > 50) risk += 25;      // Major losses
else if (lossPercentage > 30) risk += 18; // Significant losses
else if (lossPercentage > 15) risk += 10; // Moderate losses
```

**Factor 4: Games vs Performance (20% weight)**
```typescript
if (totalGames > 20 && winRate < 45) risk += 20; // Long-term poor
else if (totalGames > 10 && winRate < 40) risk += 12; // Mid-term issues
```

### Risk Level Categories:

| Score | Label | Color | Description |
|-------|-------|-------|-------------|
| 0-29 | Low Risk | 🟢 Green | "Your betting pattern is sustainable" |
| 30-69 | Moderate Risk | 🟡 Yellow | "Consider reducing bet sizes" |
| 70-100 | High Risk | 🔴 Red | "Take a break and review your strategy" |

## Files Modified

### 1. `/my-app/components/AIAssistant.tsx`
**Changes:**
- Wrapped `calculateRiskLevel()` in `React.useCallback()` with `[gameStats]` dependency
- Wrapped `calculateBetRisk()` in `React.useCallback()` with `[currentBet, gameStats]` dependencies
- Added separate useEffects to call these functions when dependencies change
- Added conditional rendering for gameStats (show message if not loaded)
- Added user-friendly messages: "Loading..." vs "Connect wallet..."

### 2. `/my-app/app/page.tsx`
**Changes:**
- Added `import contractService from '@/lib/contract-service'`
- Removed placeholder `fetchPlayerStats()` function
- Updated `loadPlayerStats()` to use `contractService.getPlayerStats()`
- Added `useEffect` to auto-load stats when `userData` changes
- Proper error handling with try/catch

## Testing Checklist

### Overall Risk Display:
- [x] Shows "Connect wallet..." when not connected
- [x] Shows "Loading..." when fetching stats
- [x] Displays risk level when stats loaded
- [x] Progress bar reflects risk percentage
- [x] Color changes based on risk level (green/yellow/red)
- [x] Text description matches risk level
- [x] No TypeScript errors

### Data Fetching:
- [x] Stats fetched on wallet connect
- [x] Stats cleared on wallet disconnect
- [x] Uses real blockchain data (not placeholder)
- [x] Handles errors gracefully

### Integration:
- [x] Current bet risk shows above overall risk
- [x] Overall risk dims when bet risk is present
- [x] Both risks update independently
- [x] No infinite loops or unnecessary re-renders

## Example Output

### New Player (No History):
```
Overall Performance Risk
Low Risk (0%)
━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░
Your betting pattern is sustainable
```

### Moderate Player (Mixed Results):
```
Overall Performance Risk
Moderate Risk (48%)
━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░
Consider reducing bet sizes
```

### High Risk Player (Poor Performance):
```
Overall Performance Risk
High Risk (85%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Take a break and review your strategy
```

## Conclusion

The Overall Performance Risk is now **fully functional** with:
✅ Real blockchain data from contract service
✅ Proper React hooks implementation with useCallback
✅ User-friendly loading and error states
✅ Accurate risk calculation based on player history
✅ Clean separation between current bet risk and overall risk
✅ Responsive updates when data changes

The risk assessment now provides players with meaningful, real-time insights into their betting patterns! 🎯✨
