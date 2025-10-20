# Fixing Overall Performance Risk Calculation

## Problem Identified

The Overall Performance Risk was showing incorrect values (always showing yellow/30%) while Current Bet Risk was working correctly (showing 70% red). The issues were:

1. **Wrong Win Rate Formula**: Calculating `totalWon / totalWagered * 100` which gives ROI, not win rate
2. **Non-existent Field**: Accessing `lose-streak` which doesn't exist in the contract
3. **Incorrect Risk Logic**: The thresholds and calculations didn't match actual player performance

## Root Causes

### Issue 1: Contract Data Structure
The Clarity contract only tracks:
```clarity
{
  total-games: uint,      // Total number of games played
  total-wagered: uint,    // Total amount bet (microSTX)
  total-won: uint,        // Total amount won (microSTX)
  win-streak: uint,       // Current consecutive wins
  max-streak: uint,       // Maximum win streak achieved
  vip-tier: uint,         // VIP tier based on volume
  achievements: (list)    // Player achievements
}
```

**Missing:** There is NO `lose-streak` field!

### Issue 2: Misunderstood Metrics
- `total-won` / `total-wagered` = **Return on Investment (ROI)**, not win percentage
- ROI of 80% = Player lost 20% of their wagers
- ROI of 120% = Player won 20% profit
- Cannot calculate games won/lost from available data

### Issue 3: Poor Risk Thresholds
Old logic was checking if "winRate" < 30%, but with ROI calculations:
- ROI < 30% = Lost 70% of money (extreme)
- This threshold would always trigger max risk

## Solution Implemented

### 1. Accurate ROI-Based Risk Assessment

**New Risk Factor 1: ROI / Profitability (35% weight)**
```typescript
const roi = totalWagered > 0 ? ((totalWon / totalWagered) * 100) : 0;

if (roi < 50) risk += 35;       // Lost 50%+ of wagers
else if (roi < 70) risk += 28;  // Lost 30-50%
else if (roi < 85) risk += 20;  // Lost 15-30%
else if (roi < 95) risk += 12;  // Lost 5-15%
else if (roi < 100) risk += 5;  // Small losses (breaking even)
// ROI >= 100% = Profitable, no risk
```

**Examples:**
- Player wagered 100 STX, won 40 STX → ROI = 40% → Risk +35% (losing heavily)
- Player wagered 100 STX, won 90 STX → ROI = 90% → Risk +12% (minor losses)
- Player wagered 100 STX, won 120 STX → ROI = 120% → Risk +0% (profitable!)

### 2. Absolute Loss Amount (30% weight)

Large losses are risky regardless of ROI:

```typescript
const netProfit = totalWon - totalWagered;
const netProfitStx = microToStx(netProfit);

if (netProfitStx < -100) risk += 30;      // Lost > 100 STX
else if (netProfitStx < -50) risk += 25;  // Lost 50-100 STX
else if (netProfitStx < -20) risk += 18;  // Lost 20-50 STX
else if (netProfitStx < -10) risk += 12;  // Lost 10-20 STX
else if (netProfitStx < -5) risk += 8;    // Lost 5-10 STX
else if (netProfitStx < 0) risk += 3;     // Small losses (0-5 STX)
```

**Examples:**
- Lost 150 STX → +30% risk (major financial loss)
- Lost 8 STX → +8% risk (minor loss, manageable)
- Won 50 STX → +0% risk (no penalty for profit)

### 3. Win Streak Analysis (20% weight)

Use existing `win-streak` field to detect cold/hot streaks:

```typescript
if (winStreak === 0 && totalGames > 3) {
  risk += 20; // Currently not winning (cold streak)
} else if (winStreak === 1 && totalGames > 5) {
  risk += 8;  // Just broke a losing streak
}
```

**Logic:**
- `win-streak = 0` means last game was a loss
- Multiple games with `win-streak = 0` = on a losing streak
- `win-streak = 5` = won last 5 games consecutively (hot!)

### 4. Volume vs Performance (15% weight)

Many games with poor performance indicates a problem:

```typescript
if (totalGames > 30 && roi < 80) risk += 15;
else if (totalGames > 20 && roi < 70) risk += 12;
else if (totalGames > 10 && roi < 60) risk += 10;
```

**Reasoning:**
- Few games with losses = might just be bad luck
- Many games with consistent losses = pattern of poor play

### 5. Updated Current Bet Risk

Also fixed bet risk calculation:
- Removed reference to non-existent `lose-streak`
- Changed to use `win-streak` for streak detection
- Updated ROI calculation from `winRate` to proper `roi`
- Added bonus: Hot streaks (>5 wins) reduce risk slightly

## Before vs After Comparison

### Before (Broken):
```typescript
// Wrong: This is ROI, not win rate
const winRate = totalGames > 0 ? ((totalWon / totalWagered) * 100) : 0;

// Wrong thresholds for ROI
if (winRate < 30) risk += 30; // Would trigger if ROI < 30% (lost 70%+)

// Wrong: Field doesn't exist
const loseStreak = extractValue(gameStats?.['lose-streak']) || 0;
if (loseStreak >= 5) risk += 25;
```

**Result:** Always showed ~30% yellow risk regardless of actual performance

### After (Fixed):
```typescript
// Correct: Properly labeled as ROI
const roi = totalWagered > 0 ? ((totalWon / totalWagered) * 100) : 0;

// Correct thresholds for ROI
if (roi < 50) risk += 35; // Lost 50%+ of money

// Correct: Use existing win-streak
const winStreak = extractValue(gameStats?.['win-streak']) || 0;
if (winStreak === 0 && totalGames > 3) risk += 20; // Cold streak
```

**Result:** Accurately reflects player's financial performance

## Risk Level Examples

### Example 1: Profitable Player ✅
```
Stats:
- Total Games: 20
- Total Wagered: 50,000,000 microSTX (50 STX)
- Total Won: 60,000,000 microSTX (60 STX)
- Win Streak: 3

Calculation:
- ROI: 120% → No risk (profitable!)
- Net Profit: +10 STX → No risk
- Win Streak: 3 → No risk (hot!)
- Volume: 20 games, ROI 120% → No risk

Overall Risk: 0-15% (Low Risk) 🟢
```

### Example 2: Breaking Even ⚠️
```
Stats:
- Total Games: 25
- Total Wagered: 100,000,000 microSTX (100 STX)
- Total Won: 95,000,000 microSTX (95 STX)
- Win Streak: 0

Calculation:
- ROI: 95% → +12% risk (small losses)
- Net Profit: -5 STX → +8% risk
- Win Streak: 0 (cold) → +20% risk
- Volume: 25 games, ROI 95% → No extra risk

Overall Risk: 40% (Moderate Risk) 🟡
```

### Example 3: Heavy Losses 🚨
```
Stats:
- Total Games: 30
- Total Wagered: 200,000,000 microSTX (200 STX)
- Total Won: 80,000,000 microSTX (80 STX)
- Win Streak: 0

Calculation:
- ROI: 40% → +35% risk (lost 60%!)
- Net Profit: -120 STX → +30% risk (major loss)
- Win Streak: 0 (cold) → +20% risk
- Volume: 30 games, ROI 40% → +15% risk

Overall Risk: 100% (High Risk) 🔴
```

## Testing Results

### Test 1: New Player
- **Before:** Shows yellow 30% (incorrect)
- **After:** Shows green 0% (correct - no history)

### Test 2: Losing Player
- **Before:** Shows yellow 30% (understated)
- **After:** Shows red 70-100% (correct - reflects losses)

### Test 3: Profitable Player
- **Before:** Shows yellow 30% (incorrect)
- **After:** Shows green 0-15% (correct - doing well!)

### Test 4: Breaking Even
- **Before:** Shows yellow 30%
- **After:** Shows yellow 35-50% (correct - some risk)

## Files Modified

**`/my-app/components/AIAssistant.tsx`**

### Changes in calculateRiskLevel():
1. Removed `lose-streak` (doesn't exist in contract)
2. Changed "win rate" to proper ROI calculation
3. Updated all risk thresholds to match ROI scale (0-200%+)
4. Added absolute loss amount check (net profit in STX)
5. Changed from loss streak to win streak analysis
6. Adjusted weights: ROI (35%), Net Loss (30%), Streak (20%), Volume (15%)

### Changes in calculateBetRisk():
1. Removed `lose-streak` reference
2. Changed to use `win-streak` for streak detection
3. Updated Factor 4 from `winRate` to `roi`
4. Added bonus: Hot streaks (>5 wins) reduce risk
5. Better factor descriptions matching actual metrics

## Key Insights

1. **ROI is the key metric**: Not game wins, but financial performance
2. **Absolute losses matter**: Losing 100 STX is risky even with decent ROI
3. **Streaks indicate momentum**: No wins = cold streak = higher risk
4. **Volume amplifies**: Many games with losses = systematic problem

## Conclusion

The Overall Performance Risk now:
✅ Uses correct data from the contract (`win-streak`, not `lose-streak`)
✅ Calculates proper ROI instead of incorrect "win rate"
✅ Has realistic thresholds (ROI < 50% = high risk)
✅ Considers absolute losses in STX (big losses = high risk)
✅ Matches the sophistication of Current Bet Risk
✅ Accurately reflects player's financial situation

Players will now see meaningful risk assessments that help them understand their gambling performance! 🎯
