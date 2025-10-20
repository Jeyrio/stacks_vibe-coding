# Overall Performance Risk Meter - User Guide

## When Does It Show?

The **Overall Performance Risk** meter displays in the Risk Assessment sidebar and shows:

### ✅ **ACTIVE** - Shows Risk Level When:
1. **Wallet is connected** (you're logged in)
2. **You have played at least 1 game** (total-games > 0)
3. **Data has been loaded from blockchain**

### ⚪ **INACTIVE** - Shows Message When:
- **No wallet connected**: Shows "Connect wallet to see risk assessment"
- **No games played yet**: Shows "Play some games to see your risk assessment"
- **Loading data**: Temporarily shows while fetching from blockchain

## What It Displays

The Overall Performance Risk meter shows a **comprehensive breakdown** of your gambling performance:

### Visual Display Elements

1. **Risk Meter Bar** (0-100%)
   - Color-coded: 🟢 Green (0-29%), 🟡 Yellow (30-69%), 🔴 Red (70-100%)
   - Animated fill showing exact risk percentage

2. **Risk Level Label**
   - Shows: "Low Risk", "Moderate Risk", or "High Risk"
   - Includes percentage: "(73%)"
   - Color matches the risk meter

3. **Performance Statistics**
   - **Games Played**: Total number of games completed
   - **ROI (Return on Investment)**: Percentage won vs wagered
     - Green if ROI ≥ 100% (profitable)
     - Red if ROI < 100% (losing money)
   - **Wagered**: Total STX bet across all games
   - **Won**: Total STX won from all games
   - **Net Profit/Loss**: Total gain or loss in STX
     - Green if positive (profit)
     - Red if negative (loss)

4. **Performance Factors** (Up to 3 most relevant)
   - Specific, actionable insights with exact numbers
   - Examples:
     - "Very low ROI (47.6% - losing >50%)"
     - "Significant losses (-31.98 STX)"
     - "Currently on a cold streak (0 win streak)"
     - "High volume with poor returns (38 games)"
     - "Profitable! ROI: 125%"
     - "On a hot streak (5 wins)"

### Example Display

```
Overall Performance Risk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
High Risk (73%)
[████████████████████████████░░░░░░] 73%

Games Played: 38          ROI: 47.6%
Wagered: 61.00 STX        Won: 29.02 STX
Net: -31.98 STX

Performance Factors:
• Very low ROI (47.6% - losing >50%)
• Significant losses (-31.98 STX)
• Currently on a cold streak (0 win streak)
```

## What It Calculates

The risk meter analyzes your overall gambling performance using:

### Risk Factors (4 categories):

1. **ROI/Profitability (35% weight)**
   - Measures: (Total Won / Total Wagered) × 100
   - ROI < 50% = Very High Risk (+35%)
   - ROI < 70% = High Risk (+28%)
   - ROI < 85% = Moderate Risk (+20%)
   - ROI < 95% = Low-Moderate Risk (+12%)
   - ROI < 100% = Minor Risk (+5%)
   - ROI ≥ 100% = Profitable (0%)

2. **Net Loss Amount (30% weight)**
   - Measures: Total actual STX lost
   - Loss > 100 STX = +30%
   - Loss > 50 STX = +25%
   - Loss > 20 STX = +18%
   - Loss > 10 STX = +12%
   - Loss > 5 STX = +6%

3. **Win Streak (20% weight)**
   - Detects cold streaks
   - Win streak = 0 AND played > 3 games = +20%
   - Win streak = 0 AND played > 1 games = +10%

4. **Volume vs Performance (15% weight)**
   - Detects consistent losing with high volume
   - Games > 30 AND ROI < 80% = +15%
   - Games > 20 AND ROI < 70% = +10%
   - Games > 10 AND ROI < 60% = +5%

## Risk Levels

- **0-29%** = 🟢 **Low Risk** (Green) - "Your betting pattern is sustainable"
- **30-69%** = 🟡 **Moderate Risk** (Yellow) - "Consider reducing bet sizes"
- **70-100%** = 🔴 **High Risk** (Red) - "Take a break and review your strategy"

## How It Updates

The risk meter automatically updates:
- ✅ When you connect your wallet
- ✅ After each game completes
- ✅ When switching between tabs (refreshes data)

## Difference from Current Bet Risk

| Feature | Current Bet Risk | Overall Performance Risk |
|---------|-----------------|-------------------------|
| **When shown** | Only when selecting a bet | Always (if games played) |
| **What it measures** | Risk of the NEXT bet | Risk of your TOTAL performance |
| **Information shown** | Win chance, potential win/loss, risk factors (up to 2) | Games played, ROI, wagered/won, net profit/loss, performance factors (up to 3) |
| **Updates** | When you change bet amount/mode | After each game completes |
| **Purpose** | Help decide if this bet is too risky | Show if your overall pattern is problematic |
| **Data source** | Current bet + recent history | All-time blockchain stats |

## Example Scenarios

### Scenario 1: New Player
- **Games Played**: 0
- **Display**: "Play some games to see your risk assessment"
- **Why**: No data to analyze yet

### Scenario 2: Profitable Player
- **Games Played**: 50
- **Total Wagered**: 100 STX
- **Total Won**: 120 STX
- **ROI**: 120% 
- **Risk Level**: 0% (Green) - Profitable, no risk

### Scenario 3: Breaking Even
- **Games Played**: 20
- **Total Wagered**: 50 STX
- **Total Won**: 48 STX
- **ROI**: 96%
- **Net Loss**: -2 STX
- **Risk Level**: ~17% (Green/Low-Moderate) - Minor losses

### Scenario 4: Losing Pattern
- **Games Played**: 30
- **Total Wagered**: 100 STX
- **Total Won**: 45 STX
- **ROI**: 45%
- **Net Loss**: -55 STX
- **Risk Level**: ~88% (Red/High Risk)
  - ROI < 50%: +35%
  - Loss > 50 STX: +25%
  - Volume + Poor ROI: +15%
  - Win Streak = 0: +20%
  - **Total**: 95% (capped at 100%)

## Troubleshooting

### "I played games but it still shows 0%"
- Check browser console (F12) for logs starting with `🎯 [Overall Risk]`
- Ensure transaction completed on blockchain
- Try refreshing the page
- Disconnect and reconnect wallet

### "It's not updating after a game"
- Wait for blockchain confirmation (~30 seconds)
- The game must fully complete (not just bet placement)
- Check that `resolve-game` was called successfully

### "The percentage seems wrong"
- The risk is based on **all-time performance**, not just recent games
- ROI < 100% means you're losing money overall
- Values are in microSTX (1 STX = 1,000,000 microSTX)

## Technical Details

### Data Source
- Pulls from Stacks blockchain contract: `bitcoin-dice.clar`
- Function: `get-player-stats`
- Fields used:
  - `total-games`: Number of games played
  - `total-wagered`: Total STX wagered (in microSTX)
  - `total-won`: Total STX won (in microSTX)
  - `win-streak`: Current consecutive wins

### Update Trigger
- Component: `AIAssistant.tsx`
- Function: `calculateRiskLevel()`
- Triggered by: `useEffect` watching `gameStats` changes
- Data flow: Contract → `contract-service.ts` → `page.tsx` → `AIAssistant.tsx`
