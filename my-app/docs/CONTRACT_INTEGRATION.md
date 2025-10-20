# Smart Contract Integration Guide

## Overview
The Bitcoin Dice smart contract has been successfully deployed to Stacks testnet and integrated with the frontend application.

## Deployment Details

### Contract Information
- **Network**: Stacks Testnet
- **Contract Address**: `ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK`
- **Contract Name**: `bitcoin-dice`
- **Deployment File**: `/stacks_vibe_coding/deployments/default.testnet-plan.yaml`

## Integration Components

### 1. Contract Service (`/my-app/lib/contract-service.ts`)

This service provides a complete API for interacting with the deployed smart contract:

#### Main Functions

**Place Bet**
```typescript
await contractService.placeBet({
  target: number,           // Dice target (1-6 for Classic)
  gameMode: number,         // 0=Classic, 1=High-Low, 2=Range
  betAmount: number,        // Bet amount in STX (1-100)
  userAddress: string,      // Player's wallet address
  onFinish: (data) => {},   // Success callback
  onCancel: () => {}        // Cancel callback
});
```

**Resolve Game**
```typescript
await contractService.resolveGame({
  gameId: number,
  onFinish: (data) => {},
  onCancel: () => {}
});
```

**Read-Only Functions**
```typescript
// Get game details
const game = await contractService.getGame(gameId);

// Get player statistics
const stats = await contractService.getPlayerStats(playerAddress);

// Get jackpot amount
const jackpot = await contractService.getJackpot(gameMode);

// Get house statistics
const houseStats = await contractService.getHouseStats();
```

**Utility Functions**
```typescript
// Poll for transaction confirmation
const txData = await contractService.pollTransaction(txId);

// Convert between STX and microSTX
const stx = contractService.microToStx(1000000);      // 1 STX
const micro = contractService.stxToMicro(1);          // 1000000
```

### 2. Game Interface Component (`/my-app/components/GameInterface.tsx`)

The GameInterface component has been updated to:
- Use the contract service for all blockchain interactions
- Handle bet placement with proper validation
- Poll for transaction confirmations
- Auto-resolve games after bet confirmation
- Display real jackpot amounts from the blockchain
- Show transaction status and errors to users

### 3. Player Dashboard Component (`/my-app/components/PlayerDashboard.tsx`)

The PlayerDashboard now fetches real data:
- Player statistics from the contract
- VIP tier based on total wagered amount
- Win/loss statistics
- Total games, wagered, and won amounts

### 4. Environment Configuration (`/my-app/.env.local`)

```bash
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK
NEXT_PUBLIC_CONTRACT_NAME=bitcoin-dice
NEXT_PUBLIC_API_URL=https://api.testnet.hiro.so
```

## Contract Functions

### Public Functions

1. **place-bet** (target uint, game-mode uint, bet-amount uint)
   - Places a bet on the dice game
   - Validates bet amount (1-100 STX)
   - Validates target based on game mode
   - Returns game ID
   - Transfers STX from player to contract
   - Contributes 1% to jackpot

2. **resolve-game** (game-id uint)
   - Resolves a pending game
   - Generates dice result (1-6)
   - Calculates payout based on game mode
   - Checks for jackpot win (dice = 6)
   - Transfers winnings to player
   - Updates player stats

### Read-Only Functions

1. **get-game** (game-id uint)
   - Returns game details

2. **get-player-stats** (player principal)
   - Returns player statistics
   - total-games, total-wagered, total-won
   - win-streak, max-streak
   - vip-tier, achievements

3. **get-jackpot** (game-mode uint)
   - Returns jackpot amount for game mode
   - Returns last winner

4. **get-house-stats**
   - Returns house balance
   - total-games, total-volume

## Game Modes

### Classic (Mode 0)
- Target: 1-6
- Multiplier: 5x
- Win: Exact match

### High-Low (Mode 1)
- Target: 1 (Low: 1-3) or 2 (High: 4-6)
- Multiplier: 2x
- Win: Result in range

### Range (Mode 2)
- Target: 1 (1-2), 2 (3-4), or 3 (5-6)
- Multiplier: 3x
- Win: Result in selected range

## VIP Tiers

- **Bronze** (0): < 100 STX wagered
- **Silver** (1): 100-500 STX
- **Gold** (2): 500-1000 STX
- **Platinum** (3): 1000-5000 STX
- **Diamond** (4): 5000+ STX

## Jackpot System

- 1% of each bet contributes to the jackpot pool
- Separate jackpots for each game mode
- Jackpot won when dice result = 6 AND player wins
- Jackpot resets after being won

## Usage Flow

### 1. Connect Wallet
```typescript
// User clicks "Connect Wallet" button
// WalletService handles Hiro Wallet connection
const userData = await walletService.connectWallet();
```

### 2. Place Bet
```typescript
// User selects game mode, target, and bet amount
// Frontend validates input
// Contract service opens wallet transaction
await contractService.placeBet({
  target: 3,
  gameMode: 0,
  betAmount: 5,
  userAddress: userData.address,
  onFinish: async (data) => {
    // Wait for confirmation
    await contractService.pollTransaction(data.txId);
  }
});
```

### 3. Resolve Game
```typescript
// After bet confirmation, auto-resolve
await contractService.resolveGame({
  gameId: gameId,
  onFinish: async (data) => {
    // Wait for resolution
    await contractService.pollTransaction(data.txId);
    // Fetch final game result
    const game = await contractService.getGame(gameId);
  }
});
```

### 4. Display Results
```typescript
// Fetch updated player stats
const stats = await contractService.getPlayerStats(userData.address);
// Update UI with win/loss, payout, new stats
```

## Testing

### Test Suite (`/stacks_vibe_coding/tests/bitcoin-dice.test.ts`)
- ✅ 31 tests passing
- Covers all contract functions
- Tests all game modes
- Validates edge cases
- Tests jackpot system
- Tests VIP tiers

Run tests:
```bash
cd stacks_vibe_coding
npm test
```

## API Endpoints

### Testnet
- **Stacks API**: https://api.testnet.hiro.so
- **Explorer**: https://explorer.hiro.so/txid/{txId}?chain=testnet

### Transaction Status
```
GET https://api.testnet.hiro.so/extended/v1/tx/{txId}
```

## Troubleshooting

### Common Issues

1. **Transaction Pending**
   - Check transaction status on explorer
   - Wait for block confirmation (typically 10 minutes)
   - Poll transaction status with `pollTransaction()`

2. **Insufficient Balance**
   - Ensure wallet has enough STX for bet + fees
   - Testnet STX: https://explorer.hiro.so/sandbox/faucet?chain=testnet

3. **Contract Not Found**
   - Verify CONTRACT_ADDRESS in .env.local
   - Check deployment was successful
   - Ensure using correct network (testnet)

4. **Post Condition Failed**
   - Using PostConditionMode.Allow to prevent issues
   - Ensure bet amount is within MIN_BET (1 STX) and MAX_BET (100 STX)

## Next Steps

### For Production Deployment

1. **Deploy to Mainnet**
   ```bash
   cd stacks_vibe_coding
   clarinet deployment apply --mainnet
   ```

2. **Update Environment**
   ```bash
   NEXT_PUBLIC_NETWORK=mainnet
   NEXT_PUBLIC_CONTRACT_ADDRESS=<mainnet-address>
   ```

3. **Add Post Conditions**
   - Implement proper post conditions for security
   - Validate exact STX transfer amounts

4. **Implement Indexing**
   - Use Stacks API or custom indexer
   - Track player game history
   - Build leaderboards

5. **Add Events Monitoring**
   - Listen for contract events
   - Real-time game updates
   - Live feed of wins/jackpots

## Resources

- **Stacks Documentation**: https://docs.stacks.co
- **Clarity Language**: https://book.clarity-lang.org
- **@stacks/transactions**: https://github.com/hirosystems/stacks.js
- **Hiro Wallet**: https://wallet.hiro.so

## Contract Source

Full contract source: `/stacks_vibe_coding/contracts/bitcoin-dice.clar`
