# Moving Bet Risk Display to Risk Assessment Area

## Overview
Moved the real-time bet risk display from the betting panel (near the Roll Dice button) to the Risk Assessment section in the AI Assistant sidebar, providing a cleaner UI and better organization.

## Changes Made

### 1. **Removed Risk Display from BettingPanel**
- Removed the entire bet risk visualization UI from BettingPanel
- Removed `calculateBetRisk()` function from BettingPanel
- Removed `userData` and `gameStats` props from BettingPanel (no longer needed)
- Betting panel now focuses only on bet input and dice rolling

**Before:**
```
BettingPanel
├── Bet Amount Input
├── Target Selection
├── ❌ Bet Risk Display (removed)
└── Roll Dice Button
```

**After:**
```
BettingPanel
├── Bet Amount Input
├── Target Selection
└── Roll Dice Button
```

### 2. **Added Risk Display to AIAssistant/RiskMeter**
- Moved `calculateBetRisk()` function to RiskMeter component
- Added `currentBet` prop to AIAssistant and RiskMeter
- RiskMeter now shows BOTH:
  1. **Current Bet Risk** (highlighted at top, when user has selected a bet)
  2. **Overall Performance Risk** (below, slightly dimmed when bet risk is shown)

**New RiskMeter Structure:**
```
Risk Assessment
├── Current Bet Risk (dynamic, based on selected bet)
│   ├── Risk level badge with emoji
│   ├── Progress bar
│   ├── Win chance, potential win/loss
│   └── Top 2 risk factors
└── Overall Performance Risk (historical)
    ├── Risk level
    ├── Progress bar
    └── Description/advice
```

### 3. **Data Flow Architecture**

#### Flow Diagram:
```
User Changes Bet
      ↓
BettingPanel (betAmount, gameMode, target)
      ↓
GameInterface.useEffect() detects change
      ↓
onBetChange() callback
      ↓
page.tsx updates currentBet state
      ↓
AIAssistant receives currentBet prop
      ↓
RiskMeter displays real-time bet risk
```

#### Component Hierarchy:
```
page.tsx
├── State: currentBet
├── GameInterface
│   ├── State: betAmount, gameMode, target
│   ├── useEffect: onBetChange({ betAmount, gameMode, target })
│   └── BettingPanel (controls bet inputs)
└── AIAssistant (receives currentBet)
    └── RiskMeter (displays bet risk + overall risk)
```

### 4. **UI/UX Improvements**

#### Betting Panel
- **Cleaner**: No more cluttered risk display near betting controls
- **Focused**: User focuses on selecting bet without distraction
- **Simpler**: Just bet amount, target, and roll button

#### Risk Assessment Area
- **Prominent**: Bet risk is highlighted with colored border
- **Contextual**: Shows bet risk only when user has selected a bet
- **Comprehensive**: Both current bet and overall performance in one place
- **Hierarchy**: Current bet risk is emphasized, overall risk is supporting info

#### Visual Design
**Current Bet Risk Card:**
```
┌─────────────────────────────────────┐
│ ⚡ Current Bet Risk           48%   │ ← Colored header & badge
│ ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░          │ ← Progress bar
│ Win: 33.3% | +30.00 STX | -10.00 STX│ ← Bet details
│ Risk Factors:                        │
│ • Bet 3x larger than average         │
│ • Moderate win chance (33.3%)        │
└─────────────────────────────────────┘
        ↓
Overall Performance Risk (dimmed)
```

## Files Modified

### 1. `/my-app/components/BettingPanel.tsx`
**Removed:**
- `userData` and `gameStats` from props interface
- `calculateBetRisk()` function (moved to AIAssistant)
- Entire bet risk display UI section
- `betRisk` variable

**Result:** Simplified component focused only on betting controls

### 2. `/my-app/components/AIAssistant.tsx`
**Added:**
- `currentBet` prop to `AIAssistantProps` interface
- `currentBet` prop to `RiskMeter` component
- `calculateBetRisk()` function (from BettingPanel)
- `betRisk` state in RiskMeter
- `useEffect` to calculate bet risk when `currentBet` changes
- Conditional UI to show bet risk card above overall risk

**Enhanced:**
- RiskMeter now shows dual-risk display
- Current bet risk highlighted with colored border
- Overall risk slightly dimmed when bet risk is present

### 3. `/my-app/components/GameInterface.tsx`
**Added:**
- `onBetChange` callback prop to interface
- `useEffect` hook to notify parent when bet parameters change
- Passes `onBetChange` callback with current bet values

**Removed:**
- `userData` and `gameStats` props from BettingPanel call

### 4. `/my-app/app/page.tsx`
**Added:**
- `currentBet` state to track current betting parameters
- `setCurrentBet` passed to GameInterface as `onBetChange`
- `currentBet` passed to AIAssistant (only when on game tab)

**Result:** Central management of bet state for risk calculation

## Benefits

### 1. **Better UX**
- ✅ Cleaner betting interface - less cognitive load
- ✅ Risk info in dedicated assessment area where users expect it
- ✅ Both current and historical risk in one consolidated view

### 2. **Better Architecture**
- ✅ Separation of concerns (betting UI vs. risk analysis)
- ✅ Central state management in page.tsx
- ✅ Clear data flow from child to parent to sibling

### 3. **Better Visual Hierarchy**
- ✅ Current bet risk is prominent (what user is about to do)
- ✅ Overall risk is supporting context (user's history)
- ✅ Color-coded borders draw attention to high-risk bets

### 4. **Responsive Behavior**
- ✅ Risk updates instantly as user types bet amount
- ✅ Risk updates when user changes target or game mode
- ✅ Only shows bet risk when user has actually selected a bet
- ✅ Hides bet risk when switching to other tabs (dashboard/leaderboard)

## Example User Flow

### Scenario: User Places a Risky Bet

1. **User opens game tab**
   - RiskMeter shows only "Overall Performance Risk"
   - No current bet risk displayed (nothing selected yet)

2. **User types "10" in bet amount**
   - GameInterface detects change → calls onBetChange
   - page.tsx updates currentBet state
   - RiskMeter immediately shows "Current Bet Risk" card
   - Risk calculated based on bet size vs. history

3. **User selects "Classic" mode (1/6 chance)**
   - Risk increases due to low win probability
   - Card updates with "Very low win chance (16.7%)" factor
   - Progress bar turns more red

4. **User sees risk assessment in sidebar**
   - ⚠️ High Risk (67%)
   - Win Chance: 16.7%
   - Potential: +50.00 STX | Risk: -10.00 STX
   - Risk Factors:
     - Bet 3x larger than average
     - Very low win chance (16.7%)

5. **User decides to reduce bet to 3 STX**
   - Risk drops to moderate level
   - Card turns yellow/orange
   - User feels more confident placing bet

## Testing Checklist

- [x] No TypeScript errors in all components
- [x] Bet risk disappears when no bet selected
- [x] Bet risk updates when changing bet amount
- [x] Bet risk updates when changing game mode
- [x] Bet risk updates when changing target
- [x] Overall risk still displays correctly
- [x] Bet risk only shows on game tab
- [x] Clean separation between betting and risk areas

## Future Enhancements

Possible improvements:
1. **Animation**: Slide-in effect when bet risk appears
2. **Sound Alert**: Audio cue for high-risk bets
3. **Recommendation**: "Suggested bet amount" based on risk profile
4. **History**: Show last 5 bets with their risk levels
5. **Comparison**: "This bet is riskier than 85% of your bets"
