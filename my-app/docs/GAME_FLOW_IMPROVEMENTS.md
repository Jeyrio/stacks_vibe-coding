# Game Flow Documentation

## Improved User Experience

### What Was Fixed

✅ **Single Wallet Approval** - Only asks for approval once when placing bet
✅ **Clear Status Messages** - Shows what's happening at each step
✅ **Bet Approval Confirmation** - Confirms when wallet approves the bet
✅ **Game Result Display** - Shows dice result, win/loss, and payout clearly

### New Game Flow

```
1. User clicks "Place Bet"
   ↓
2. Status: "Waiting for bet approval..."
   ↓
3. Wallet popup appears (ONLY ONCE for bet)
   ↓
4. User approves bet
   ↓
5. Status: "✅ Bet approved! Waiting for confirmation..."
   ↓
6. Transaction confirms on blockchain (~10-20 seconds)
   ↓
7. Status: "⏳ Bet confirmed on blockchain! Rolling dice..."
   ↓
8. Wait 2 blocks for randomness (~20 seconds)
   ↓
9. Status: "🎲 Rolling the dice..."
   ↓
10. Game auto-resolves (second wallet popup for resolution)
    ↓
11. Status: "⏳ Waiting for resolution confirmation..."
    ↓
12. Result displays with big visual:
    
    🎉 WINNER! 🎉          OR    😔 Better Luck Next Time
    
         🎲 6                         🎲 2
    
    Your Pick: 6                   Your Pick: 6
    Dice Result: 6                 Dice Result: 2
    Bet Amount: 5.00 STX          Bet Amount: 5.00 STX
    Won: 25.00 STX                (Lost)
    ↓
13. Result stays visible for 5 seconds
    ↓
14. Ready for next bet!
```

## Status Messages Explained

### During Betting:
- **"Waiting for bet approval..."** - Wallet popup is open, waiting for you to approve
- **"✅ Bet approved!"** - You clicked approve, bet is being sent to blockchain
- **"⏳ Bet confirmed on blockchain!"** - Your bet is confirmed, dice rolling begins
- **"🎲 Rolling the dice..."** - Waiting for randomness (2 blocks)
- **"🎯 Checking result..."** - Fetching dice result from blockchain

### Resolution (Second Approval):
- **"⏳ Please approve resolution in wallet..."** - Second wallet popup for resolution
- **"⏳ Waiting for resolution confirmation..."** - Resolution being processed

### Final Results:
- **"🎉 YOU WON! Dice: X | Payout: XX.XX STX"** - You won!
- **"😔 You Lost. Dice: X | Your pick: Y"** - You lost this round

## Visual Result Display

### Winner Display
```
┌─────────────────────────────────┐
│      🎉 WINNER! 🎉             │
│                                 │
│           🎲 6                  │
│                                 │
│   Your Pick: 6                  │
│   Dice Result: 6                │
│   Bet Amount: 5.00 STX          │
│   Won: 25.00 STX               │
└─────────────────────────────────┘
   Green border, green background
```

### Loser Display
```
┌─────────────────────────────────┐
│  😔 Better Luck Next Time       │
│                                 │
│           🎲 2                  │
│                                 │
│   Your Pick: 6                  │
│   Dice Result: 2                │
│   Bet Amount: 5.00 STX          │
└─────────────────────────────────┘
   Red border, pink background
```

## Why Two Wallet Popups?

Even though we optimized the flow, you still see TWO wallet popups because:

1. **First Popup: Place Bet**
   - Transfer your STX to the contract
   - Create the game on blockchain
   - This MUST be signed by you (your money)

2. **Second Popup: Resolve Game** (after 2 blocks)
   - Generate random dice result
   - Calculate win/loss
   - Pay out winnings if you won
   - This COULD be signed by anyone, but wallet requires approval

### Future Improvement Options:

**Option A: Backend Service (Recommended for Production)**
- Set up a backend service that resolves games automatically
- Users only sign once (place bet)
- Backend signs resolution transaction
- Cost: ~$10-50/month for server

**Option B: Pooled Resolution**
- Contract owner resolves all games periodically
- Users only sign once
- Requires contract modification

**Option C: Keep As-Is (Current)**
- Most transparent approach
- User sees and approves everything
- No additional infrastructure needed
- Best for testing/demo

## Timing Breakdown

Total time from bet to result: ~40-50 seconds

| Step | Time | Why |
|------|------|-----|
| Wallet approval | 5-10s | User interaction |
| Bet confirmation | 10-20s | Blockchain confirmation |
| Wait for blocks | 20s | Contract requires 2 blocks for randomness |
| Resolution approval | 5-10s | User interaction |
| Resolution confirmation | 10-20s | Blockchain confirmation |

## Tips for Best Experience

### For Testing:
1. **Use minimum bet (1 STX)** first to test flow
2. **Keep wallet open** during the process
3. **Watch status messages** to know what's happening
4. **Don't refresh page** during active game

### For Production:
1. Consider implementing backend resolver
2. Add sound effects for wins/losses
3. Store game history in database
4. Add animation for dice roll
5. Show other players' recent wins

## Troubleshooting

### "Waiting for bet approval..." stuck
- Check wallet extension is unlocked
- Look for popup (might be hidden)
- Try clicking wallet icon

### "Bet approved!" but stuck
- Transaction might be pending
- Check explorer: https://explorer.hiro.so/txid/{txId}?chain=testnet
- Usually resolves in 10-30 seconds

### Second approval never comes
- Game needs 2 blocks to resolve
- Wait full 20 seconds after first approval
- Check console logs for errors

### Result not showing
- May indicate resolution failed
- Check explorer for transaction status
- Game data is on blockchain even if UI doesn't show

### How to manually check result
If UI fails, check blockchain directly:

1. Go to explorer
2. Find your bet transaction
3. Note the game ID from result: `(ok u1)` = game ID 1
4. Call read-only function `get-game` with game ID
5. See result in returned data

## Developer Notes

### Key Changes Made:

1. **Added state for status and result display**
```typescript
const [statusMessage, setStatusMessage] = useState<string>('');
const [showResult, setShowResult] = useState(false);
```

2. **Split resolution into two phases**
```typescript
waitForBetConfirmation() // Waits for bet
  ↓
resolveGameServerSide() // Asks for resolution approval
  ↓
displayGameResult() // Shows result
```

3. **Added visual result component**
- Inline styles for immediate visibility
- Conditional colors (green for win, red for loss)
- Big emoji dice display
- Auto-hides after 5 seconds

4. **Improved polling**
```typescript
await contractService.pollTransaction(txId, 30, 2000);
// 30 attempts, 2 second intervals = 60 seconds max
```

### Component Props Used:
- `isPlaying` - Controls button disable state
- `lastResult` - Passed to DiceAnimation
- `statusMessage` - Shown above game area
- `showResult` - Toggles result card visibility

### Future Enhancements:
- [ ] Add confetti animation for wins
- [ ] Sound effects (coin sound, dice roll)
- [ ] Progress bar for waiting periods
- [ ] Share win on social media
- [ ] Achievement unlocks with animations
- [ ] Multiplayer leaderboard
- [ ] Chat for players
- [ ] Daily bonuses

## Summary

The game now provides:
✅ Clear feedback at every step
✅ Confirmation when bet is approved
✅ Visual display of game result
✅ Win/loss clearly indicated
✅ All relevant information shown (dice, pick, payout)

Players now know exactly what's happening and can see their results clearly!
