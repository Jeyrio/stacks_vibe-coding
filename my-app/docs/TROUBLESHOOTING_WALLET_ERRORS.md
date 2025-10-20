# Troubleshooting "Issue Afterwards" Error

## What "Issue Afterwards" Means

When Hiro Wallet shows "Issue afterwards" or similar warnings, it means one of these things:

### Common Causes:

1. **Insufficient Balance**
   - You don't have enough STX for the bet + transaction fees
   - Solution: Get more testnet STX from faucet

2. **Invalid Parameters**
   - Target number doesn't match game mode rules
   - Bet amount outside 1-100 STX range
   - Solution: Check your inputs before placing bet

3. **Contract State Issues**
   - Contract doesn't have enough STX to pay potential winnings
   - Solution: Contract needs to be funded first

4. **Network Issues**
   - Testnet node temporarily unavailable
   - Solution: Wait a moment and try again

## How to Fix

### Step 1: Check Your Balance
```
Visit: https://explorer.hiro.so/address/{YOUR_ADDRESS}?chain=testnet
```
Make sure you have at least:
- Bet amount (e.g., 5 STX)
- Plus ~0.01 STX for fees

### Step 2: Get Testnet STX
If your balance is low:
```
Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
Enter your address
Click "Request STX"
Wait ~10 seconds for confirmation
```

### Step 3: Fund the Contract
The contract needs STX to pay winners. To fund it:

1. Open your wallet
2. Send STX to contract address: `ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK`
3. Send amount: 100-500 STX (for testing)
4. This gives the contract a balance to pay winners

### Step 4: Validate Your Bet

**Classic Mode (gameMode = 0)**
- Target must be: 1, 2, 3, 4, 5, or 6
- Example: "I want to roll a 4"

**High-Low Mode (gameMode = 1)**
- Target must be: 1 (low) or 2 (high)
- Target 1 = dice result 1-3 (low)
- Target 2 = dice result 4-6 (high)

**Range Mode (gameMode = 2)**
- Target must be: 1, 2, or 3
- Target 1 = dice 1-2
- Target 2 = dice 3-4  
- Target 3 = dice 5-6

### Step 5: Start Small
For your first bet:
- Use 1 STX (minimum)
- Choose Classic mode with target = 3
- This minimizes risk while testing

## Understanding the Warning

The wallet simulates the transaction before you sign it. If it sees a potential problem, it warns you.

**This doesn't mean it will definitely fail**, but it's telling you:
> "Hey, this might not work. Are you sure?"

## Transaction Lifecycle

```
1. You click "Place Bet"
   ↓
2. Wallet simulates transaction
   ↓
3. Wallet shows warning if issues detected
   ↓
4. You can still proceed if you want
   ↓
5. Transaction is broadcast
   ↓
6. Blockchain validates and executes
```

## Checking Transaction Status

After signing, you can check if it succeeded:

```
https://explorer.hiro.so/txid/{txId}?chain=testnet
```

Statuses:
- **Pending**: Transaction waiting in mempool
- **Success**: Transaction confirmed ✅
- **Abort by response**: Contract function returned an error
- **Abort by post condition**: Post-condition check failed

## Error Codes from Contract

If transaction fails, check the error code:

- **u100**: Unauthorized (shouldn't happen for place-bet)
- **u101**: Invalid bet (amount or target out of range)
- **u102**: Game not found (for resolve-game)
- **u103**: Game already resolved
- **u104**: Insufficient funds
- **u105**: Too early to resolve (need to wait 1 block)

## Quick Test Checklist

Before placing a bet, verify:

- [ ] You have enough STX (bet amount + 0.01 for fees)
- [ ] Contract has been funded (check explorer)
- [ ] Target matches game mode (1-6 for classic, 1-2 for high-low, 1-3 for range)
- [ ] Bet amount is 1-100 STX
- [ ] Wallet is connected
- [ ] You're on testnet

## Still Having Issues?

### Try Manual Contract Call

You can test the contract directly using Stacks Explorer:

1. Go to: https://explorer.hiro.so/sandbox/contract-call?chain=testnet
2. Contract Address: `ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK`
3. Contract Name: `bitcoin-dice`
4. Function: `place-bet`
5. Parameters:
   - target: `u3` (for dice number 3)
   - game-mode: `u0` (for classic mode)
   - bet-amount: `u1000000` (for 1 STX)
6. Click "Call Function"

This will show you exactly what error (if any) the contract returns.

## Example of Successful Bet

From the blockchain:
```json
{
  "tx_status": "success",
  "tx_result": "(ok u1)",  // Game ID 1 created
  "contract_call": {
    "function_name": "place-bet",
    "function_args": [
      {"repr": "u3", "name": "target"},
      {"repr": "u0", "name": "game-mode"},
      {"repr": "u1000000", "name": "bet-amount"}
    ]
  }
}
```

## Need Help?

If you're still stuck, please share:
1. Your wallet address
2. The exact error message
3. Screenshot of the transaction
4. Game mode and target you're trying

This will help diagnose the issue faster!
