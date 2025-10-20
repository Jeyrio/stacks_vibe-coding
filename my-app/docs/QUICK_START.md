# Bitcoin Dice - Quick Start Guide

## 🎲 Your smart contract is now connected to the frontend!

## What's Been Done

✅ **Smart Contract Deployed**
- Contract Address: `ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK`
- Network: Stacks Testnet
- All 31 tests passing

✅ **Frontend Integration Complete**
- Contract service created with all blockchain functions
- GameInterface connected to real contract
- PlayerDashboard fetching real stats
- Environment configured for testnet

✅ **Ready to Use**
- Dev server running at http://localhost:3000
- Wallet connection working
- Ready to place bets and play!

## How to Play

### 1. Get Testnet STX
Visit the Stacks testnet faucet to get free testnet STX:
```
https://explorer.hiro.so/sandbox/faucet?chain=testnet
```

### 2. Install Hiro Wallet
- Chrome/Brave: https://wallet.hiro.so/wallet/install-web
- Firefox: Available on Firefox Add-ons
- Desktop: Download from Hiro website

### 3. Connect Wallet
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Approve connection in Hiro Wallet
4. You're ready to play!

### 4. Place Your First Bet

**Classic Mode (5x multiplier)**
1. Select "Classic" mode
2. Choose your target number (1-6)
3. Enter bet amount (1-100 STX)
4. Click "Place Bet"
5. Approve transaction in wallet
6. Wait for confirmation (~10 seconds)
7. Game auto-resolves and shows result!

**High-Low Mode (2x multiplier)**
- Choose "Low" (dice 1-3) or "High" (dice 4-6)
- 50% chance to win

**Range Mode (3x multiplier)**
- Choose range: 1-2, 3-4, or 5-6
- 33% chance to win

### 5. View Your Stats
- Check the Player Dashboard
- See total games, wagered, and won
- Track your VIP tier
- View win streak

## Game Features

### 💎 VIP Tiers
Earn VIP status by playing:
- Bronze: < 100 STX
- Silver: 100-500 STX
- Gold: 500-1,000 STX
- Platinum: 1,000-5,000 STX
- Diamond: 5,000+ STX

### 🎰 Jackpot System
- 1% of each bet goes to jackpot
- Win jackpot when you roll 6 AND win the bet
- Separate jackpots for each game mode

### 📊 Statistics
All tracked on-chain:
- Total games played
- Total STX wagered
- Total STX won
- Win streak (current and max)
- VIP tier level

## Technical Details

### Environment Variables (`.env.local`)
```bash
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK
NEXT_PUBLIC_CONTRACT_NAME=bitcoin-dice
NEXT_PUBLIC_API_URL=https://api.testnet.hiro.so
```

### Key Files
- **Contract**: `/stacks_vibe_coding/contracts/bitcoin-dice.clar`
- **Tests**: `/stacks_vibe_coding/tests/bitcoin-dice.test.ts`
- **Service**: `/my-app/lib/contract-service.ts`
- **Game UI**: `/my-app/components/GameInterface.tsx`
- **Dashboard**: `/my-app/components/PlayerDashboard.tsx`

### Contract Functions Used

**Writing to Blockchain**
- `place-bet(target, game-mode, bet-amount)` - Place a new bet
- `resolve-game(game-id)` - Resolve pending game

**Reading from Blockchain**
- `get-game(game-id)` - Get game details
- `get-player-stats(player)` - Get player statistics  
- `get-jackpot(game-mode)` - Get current jackpot
- `get-house-stats()` - Get house statistics

## Development Commands

### Run Frontend
```bash
cd my-app
npm run dev
# Visit http://localhost:3000
```

### Run Contract Tests
```bash
cd stacks_vibe_coding
npm test
# All 31 tests should pass
```

### Check Contract
```bash
cd stacks_vibe_coding
clarinet check
# Should show: ✔ 1 contract checked
```

### Deploy to Mainnet (when ready)
```bash
cd stacks_vibe_coding
clarinet deployment apply --mainnet
# Update .env.local with mainnet address
```

## Troubleshooting

### "Transaction Pending"
- Testnet transactions take ~10 seconds to confirm
- Check status: https://explorer.hiro.so/txid/{txId}?chain=testnet
- The app auto-polls for confirmation

### "Insufficient Funds"
- Get more testnet STX from faucet
- Ensure you have enough for bet + gas fees (~0.01 STX)

### "Contract Not Found"
- Verify .env.local has correct contract address
- Restart dev server after changing .env.local

### "Wallet Not Connected"
- Install Hiro Wallet extension
- Click "Connect Wallet" button
- Approve connection request

## Game Flow

```
1. User connects wallet
   ↓
2. User selects game mode, target, bet amount
   ↓
3. User clicks "Place Bet"
   ↓
4. Wallet prompts for approval
   ↓
5. Transaction sent to blockchain
   ↓
6. App polls for confirmation (~10 seconds)
   ↓
7. Once confirmed, app auto-resolves game
   ↓
8. Resolution transaction sent
   ↓
9. App polls for resolution (~10 seconds)
   ↓
10. Result displayed: Win/Loss + Payout
    ↓
11. Stats updated automatically
```

## View Live Transactions

All your transactions are visible on the Stacks Explorer:
- Contract: https://explorer.hiro.so/address/ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK?chain=testnet
- Your Wallet: https://explorer.hiro.so/address/{YOUR_ADDRESS}?chain=testnet

## Next Steps

### Immediate
1. ✅ Connect your wallet
2. ✅ Get testnet STX from faucet
3. ✅ Place your first bet
4. ✅ Try all three game modes
5. ✅ Check your stats in dashboard

### Future Enhancements
- [ ] Add game history indexing
- [ ] Build global leaderboard
- [ ] Add live feed of recent wins
- [ ] Implement achievement system
- [ ] Add social features (share wins)
- [ ] Mobile responsive design
- [ ] Sound effects and animations
- [ ] Multi-language support

### Production Deployment
When ready to go live:
1. Deploy contract to mainnet
2. Update .env.local with mainnet address
3. Test thoroughly with small bets
4. Add proper post conditions for security
5. Set up monitoring and alerts
6. Deploy frontend to Vercel/Netlify

## Support & Resources

- **Documentation**: See `CONTRACT_INTEGRATION.md`
- **Stacks Docs**: https://docs.stacks.co
- **Clarity Book**: https://book.clarity-lang.org
- **Discord**: https://stacks.chat

## 🎉 You're All Set!

Your Bitcoin Dice game is fully functional and connected to the blockchain. 

**Start playing now at:** http://localhost:3000

Have fun and may the odds be in your favor! 🎲
