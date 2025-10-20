# Understanding Wallet Warnings

## "Issue Afterwards" Warning Explained

### What It Actually Means

When you see **"Issue afterwards"** or similar warnings in your Hiro Wallet, it's **NOT necessarily an error**. Here's what's really happening:

The wallet is telling you:
> "I simulated this transaction, and the outcome might not be what you expect."

### For a Dice Game, This Is NORMAL! 🎲

When you place a bet:
1. Wallet simulates the transaction
2. It sees you're sending STX to a gambling contract
3. It warns: "You might lose this money!"
4. **This is EXPECTED behavior for a dice game**

### What "Issue" Actually Refers To

The "issue" is that **you might lose your bet**. The wallet doesn't know if you'll win or lose, so it warns you that:
- ✅ The bet will be placed successfully
- ✅ Your STX will be transferred
- ⚠️ You might not get a payout (if you lose)
- ⚠️ The contract might return an error (if invalid parameters)

### This Is Different From:

**Actual Errors** (these will show specific messages):
- "Insufficient funds" - You don't have enough STX
- "Invalid parameters" - Your bet is outside valid range
- "Contract not found" - Wrong address
- "Post condition failed" - Security check failed

**vs**

**Game Warnings** (shown as "issue afterwards"):
- The bet might lose (normal for gambling)
- The transaction will execute, outcome uncertain
- This is the wallet being cautious

## How to Proceed

### If You Want to Place the Bet:

1. **Click "Confirm" or "Sign Transaction"**
   - Yes, even with the warning!
   - The warning is just being cautious
   - Your bet will be placed

2. **Wait for Confirmation**
   - Transaction goes to blockchain
   - Takes ~10-30 seconds
   - App will auto-resolve the game

3. **See Your Result**
   - Win: You get payout + original bet back
   - Lose: Better luck next time!

### Double-Check Before Confirming:

- ✅ Bet amount is what you intended
- ✅ Game mode is correct
- ✅ Target number makes sense
- ✅ You have enough STX

## Real Examples

### Example 1: Normal Warning (Safe to Proceed)
```
Transaction: place-bet
Warning: "Issue afterwards"
Details: Sending 5 STX to contract

What it means:
→ Bet will be placed
→ You might win 25 STX
→ Or you might lose 5 STX
→ This is normal gambling behavior
```

**Action**: ✅ Sign the transaction

### Example 2: Actual Error (Don't Proceed)
```
Transaction: place-bet
Error: "Insufficient funds"
Details: Need 5.01 STX, have 2.5 STX

What it means:
→ You don't have enough STX
→ Transaction will fail
→ Need to get more STX first
```

**Action**: ❌ Cancel, get more STX

## Why This Happens

Stacks smart contracts use a **post-condition system** for safety. The wallet tries to predict outcomes, but:

1. **Deterministic contracts** (like token swaps):
   - Wallet can predict exact outcome
   - Shows exact amounts you'll receive
   - No warnings if everything is valid

2. **Non-deterministic contracts** (like dice games):
   - Outcome depends on randomness
   - Wallet can't predict if you'll win
   - Shows warning to be safe

## The Technical Details

When you click "Place Bet":

```
1. Frontend calls contractService.placeBet()
   ↓
2. Opens Hiro Wallet transaction prompt
   ↓
3. Wallet simulates contract call
   ↓  
4. Contract validates parameters (✓)
   ↓
5. Contract accepts STX transfer (✓)
   ↓
6. Game outcome is uncertain (⚠️ warning)
   ↓
7. Wallet shows "Issue afterwards" warning
   ↓
8. You click Confirm
   ↓
9. Transaction broadcasts to blockchain
   ↓
10. Contract creates game (✓ success)
    ↓
11. App resolves game after 1 block
    ↓
12. You see win or loss result
```

## How to Verify Everything Is OK

### Before Signing:

1. **Check Your Balance**
   - Go to: https://explorer.hiro.so/address/{YOUR_ADDRESS}?chain=testnet
   - Verify you have: bet amount + 0.02 STX for fees

2. **Check Contract Balance**
   - Go to: https://explorer.hiro.so/address/ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK?chain=testnet
   - Contract has: 498.90 STX ✅ (enough to pay winners)

3. **Verify Your Bet Parameters**
   - Bet: 1-100 STX
   - Target: 1-6 (Classic), 1-2 (High-Low), 1-3 (Range)
   - Game mode: 0, 1, or 2

### After Signing:

1. **Wait for "Bet Placed" Message**
   - Shows in app within 10-30 seconds
   - Means place-bet succeeded

2. **Wait for Auto-Resolve**
   - App automatically calls resolve-game
   - Takes another 10-30 seconds
   - Shows final win/loss result

3. **Check Transaction on Explorer**
   - Copy TX ID from wallet
   - Visit: https://explorer.hiro.so/txid/{TX_ID}?chain=testnet
   - Status should be "Success"

## Still Concerned?

### Test with Minimum Bet First

Start with the smallest possible bet:
```
Bet Amount: 1 STX
Game Mode: Classic
Target: 3
```

This lets you test the full flow with minimal risk.

### Understanding Transaction Results

After transaction completes, check explorer:

**Success Transaction**:
```json
{
  "tx_status": "success",
  "tx_result": "(ok u1)"  ← Game ID created
}
```
This means your bet was placed successfully!

**Failed Transaction**:
```json
{
  "tx_status": "abort_by_response",
  "tx_result": "(err u101)"  ← Error code
}
```
This means something went wrong. Check error code:
- u101 = Invalid bet (amount or target)
- u104 = Insufficient funds

## Bottom Line

**"Issue afterwards" warning for a dice game = NORMAL**

- ✅ Your transaction will succeed
- ✅ Your bet will be placed
- ⚠️ You might win or lose (that's gambling!)
- 🎲 The "issue" is just uncertainty about winning

**When to worry:**
- "Insufficient funds" error
- "Contract not found" error  
- Transaction shows "abort_by_response" after signing

**When NOT to worry:**
- "Issue afterwards" on a gambling contract
- Generic warnings about uncertain outcomes
- Caution messages about sending STX

## Ready to Play?

If everything checks out:
1. ✅ You have enough STX
2. ✅ Contract is funded
3. ✅ Parameters look good
4. ✅ You understand you might lose

Then click **Confirm** and enjoy the game! 🎲🎰
