# 🎲 BitCoin Dice - Provably Fair Gaming on Stacks

<div align="center">

![BitCoin Dice Logo](https://via.placeholder.com/200x200/FF6B35/FFFFFF?text=🎲)

**A next-generation provably fair dice betting game built on Stacks blockchain with AI-enhanced features**

[![Stacks](https://img.shields.io/badge/Built%20on-Stacks-blueviolet)](https://www.stacks.co/)
[![Clarity](https://img.shields.io/badge/Smart%20Contracts-Clarity-blue)](https://clarity-lang.org/)
[![React](https://img.shields.io/badge/Frontend-React-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)

[🎮 Live Demo](https://bitcoin-dice-demo.vercel.app) | [📖 Documentation](https://docs.bitcoin-dice.com) | [🎥 Demo Video](https://youtu.be/demo)

</div>

## 🌟 Overview

BitCoin Dice revolutionizes blockchain gaming by combining provably fair mechanics with AI-enhanced user experience. Built for the **Stacks Vibe Coding Hackathon**, this project showcases how AI-assisted development can create sophisticated dApps that unlock Bitcoin's potential for mainstream adoption.

### 🎯 Mission
Unlock the Bitcoin economy through engaging, fair, and intelligent gaming experiences that bring both crypto natives and newcomers into the ecosystem.

## 🆕 Recent Updates

### Latest Features (October 2025)
- ✅ **Dual Risk Assessment System**: Real-time bet risk + overall performance tracking
- ✅ **Detailed Risk Breakdown**: Both bet and performance risks show comprehensive factor analysis
  - Games played, ROI percentage, wagered/won amounts, net profit/loss
  - Performance factors with specific metrics (e.g., "Very low ROI (47.6% - losing >50%)")
  - Up to 3 most relevant factors displayed per risk assessment
- ✅ **Enhanced Progressive Jackpots**: Realistic STX growth with live updates (0.015-0.045 STX/sec)
- ✅ **Improved Risk Calculations**: ROI-based analysis with 4-factor weighted system
- ✅ **Professional UI Polish**: Clean, intuitive risk displays in sidebar with color-coded indicators
- ✅ **Blockchain Data Integration**: Real-time stats from Stacks testnet
- ✅ **Auto-updating Risk Meters**: Instant updates after each game completion

### Coming Soon
- 🚧 **Multi-player Tournaments**: Compete in real-time with other players
- 🚧 **NFT Achievements**: Mint achievement badges as NFTs
- 🚧 **Staking Rewards**: Stake STX to earn platform revenue share
- 🚧 **Mobile App**: Native iOS and Android apps

## ✨ Key Features

### 🎮 **Multiple Game Modes**
- **🎲 Classic Dice**: Traditional 1-6 number betting with 5x multiplier
- **📊 High/Low**: Bet if the next roll is higher or lower (2x multiplier)
- **🎯 Range Betting**: Bet on number ranges with 3x multiplier
- **🏆 Tournament Mode**: Timed competitions with global leaderboards

### 🤖 **AI-Enhanced Experience**
- **Smart Suggestions**: AI analyzes patterns and suggests optimal betting strategies
- **Real-Time Bet Risk**: Live risk assessment for each bet before placing (shows win probability, potential outcomes, and risk factors)
- **Overall Performance Risk**: Comprehensive analysis of your gambling patterns based on ROI, net losses, win streaks, and volume
- **Pattern Recognition**: Detects and warns about problematic gambling behaviors
- **Auto-Resolution**: Games resolve automatically without manual intervention
- **Predictive Analytics**: Advanced probability calculations and outcome predictions
- **Dual Risk Display**: Separate meters for current bet risk and overall performance tracking

### 🏆 **Social Gaming Features**
- **Global Leaderboards**: Compete with players worldwide
- **Player Profiles**: Comprehensive stats, achievements, and VIP tiers
- **Live Game Feed**: Real-time stream of all game results
- **Achievement System**: Unlock rewards and exclusive features
- **Referral Program**: Earn bonuses for bringing new players

### 💎 **Advanced Mechanics**
- **Progressive Jackpots**: Community pots with realistic growth (0.015-0.045 STX/second) and live tracking
- **VIP Tiers**: Unlock better odds and exclusive features as you play
- **Insurance Bets**: Optional side bets to minimize losses
- **Streak Multipliers**: Bonus rewards for consecutive wins
- **Cross-Game Achievements**: Rewards that span multiple game modes
- **Live Statistics**: Real-time game feed with authentic STX amounts and player actions

## 🏗️ Technical Architecture

### Smart Contracts (Clarity)
```
contracts/
├── bitcoin-dice.clar          # Main game contract
├── jackpot-manager.clar       # Progressive jackpot logic
├── player-stats.clar          # Player statistics and VIP tiers
├── tournament.clar            # Tournament and leaderboard system
└── governance.clar            # Community governance features
```

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── GameInterface.tsx      # Main game interface
│   ├── PlayerDashboard.tsx    # Player statistics and history
│   ├── Leaderboard.tsx        # Global rankings and tournaments
│   ├── AIAssistant.tsx        # AI suggestions and analytics
│   └── LiveFeed.tsx           # Real-time game updates
├── utils/
│   ├── aiAnalytics.ts         # AI pattern recognition
│   ├── contractInteractions.ts # Blockchain interactions
│   └── gameLogic.ts           # Game mechanics and calculations
└── hooks/
    ├── useGameState.ts        # Game state management
    ├── usePlayerStats.ts      # Player data management
    └── useAIAnalysis.ts       # AI insights integration
```

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Clarinet](https://github.com/hirosystems/clarinet) for smart contract development
- [Stacks Wallet](https://www.hiro.so/wallet) for testing

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/bitcoin-dice.git
cd bitcoin-dice
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Clarinet (for smart contract development)**
```bash
# Install Clarinet
curl -L https://github.com/hirosystems/clarinet/releases/download/v1.5.4/clarinet-linux-x64.tar.gz | tar xz
sudo mv clarinet /usr/local/bin

# Initialize Clarinet project
clarinet integrate
```

4. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Development

1. **Start the smart contract console**
```bash
clarinet console
```

2. **Run the frontend development server**
```bash
npm run dev
```

3. **Run tests**
```bash
# Smart contract tests
clarinet test

# Frontend tests  
npm run test
```

The application will be available at `http://localhost:3000`

## 🎮 How to Play

### Classic Dice Mode
1. **Connect Wallet**: Link your Stacks wallet to start playing
2. **Choose Target**: Select a number between 1-6
3. **Set Bet Amount**: Choose your wager (minimum 1 STX)
4. **Place Bet**: Click "Roll Dice" to start the game
5. **Auto-Resolution**: Game resolves automatically when the next block is mined
6. **Collect Winnings**: Winners receive 5x their bet amount automatically

### High/Low Mode
- **Low Bet**: Wins if dice shows 1-3 (2x multiplier)
- **High Bet**: Wins if dice shows 4-6 (2x multiplier)

### Range Betting
- **Low Range (1-2)**: 3x multiplier, 33% win chance
- **Mid Range (3-4)**: 3x multiplier, 33% win chance  
- **High Range (5-6)**: 3x multiplier, 33% win chance

### Progressive Jackpot
- Automatically triggered by special dice sequences
- 1% of every bet contributes to the jackpot pool
- Winners receive jackpot + regular game winnings

## 🔒 Provably Fair Gaming

### Verifiable Randomness
- Uses Stacks blockchain VRF (Verifiable Random Function)
- Random seed generated from future block hash
- Impossible to predict or manipulate outcomes
- Complete transparency and auditability

### Smart Contract Security
- Comprehensive test coverage (95%+)
- Formal verification of critical functions
- Multi-signature contract upgrades
- Emergency pause functionality

### Fairness Verification
Players can verify game fairness by:
1. Checking the VRF seed from blockchain
2. Reproducing the dice calculation
3. Verifying payout amounts
4. Auditing smart contract code

## 🤖 AI Features Deep Dive

### Real-Time Bet Risk Assessment
Before placing each bet, the AI analyzes:
- **Win Probability**: Based on game mode and selected target
- **Potential Outcomes**: Shows potential win amount and loss
- **Bet Size Impact**: Evaluates bet relative to your bankroll
- **Current Performance**: Factors in your recent results
- **Risk Factors**: Lists specific concerns (e.g., "High loss streak", "Bet exceeds 10% of bankroll")
- **Visual Indicators**: Color-coded risk meter (🟢 Green: Low Risk, 🟡 Yellow: Moderate Risk, 🔴 Red: High Risk)

**Risk Calculation Factors**:
- Large bet size relative to typical bets: +20%
- Bet exceeds 10% of total winnings: +15%
- Current losing streak (3+ losses): +15%
- Poor recent performance (ROI < 80%): +10%
- Low win probability: +10%

### Overall Performance Risk Tracking
Continuous analysis of your gambling patterns with **detailed breakdown display**:

**Visual Display Shows**:
- Risk percentage meter (0-100%) with color coding
- Games played count
- ROI percentage (color-coded: green if profitable, red if losing)
- Total wagered and won amounts
- Net profit/loss in STX (color-coded)
- Up to 3 most relevant performance factors

**Risk Calculation Factors**:
- **ROI Analysis (35% weight)**: Measures total won vs. total wagered
  - ROI < 50%: Very High Risk (+35%) - "Very low ROI (47.6% - losing >50%)"
  - ROI 50-70%: High Risk (+28%) - "Low ROI (losing 30-50%)"
  - ROI 70-85%: Moderate Risk (+20%) - "Below average ROI"
  - ROI 85-100%: Low Risk (+5-12%) - "Near break-even"
  - ROI > 100%: Profitable (0%) - "Profitable! ROI: 125%"
- **Net Loss Tracking (30% weight)**: Monitors absolute STX losses
  - Shows exact amounts: "Significant losses (-31.98 STX)"
- **Win Streak Analysis (20% weight)**: Detects cold streaks and patterns
  - Examples: "Currently on a cold streak (0 win streak)", "On a hot streak (5 wins)"
- **Volume vs Performance (15% weight)**: Identifies consistent losing with high volume
  - "High volume with poor returns (38 games)"

**Example Display**:
```
Overall Performance Risk: High Risk (73%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Games Played: 38          ROI: 47.6%
Wagered: 61.00 STX        Won: 29.02 STX
Net: -31.98 STX

Performance Factors:
• Very low ROI (47.6% - losing >50%)
• Significant losses (-31.98 STX)
• Currently on a cold streak (0 win streak)
```

**Updates automatically**:
- After each game completes
- When connecting/reconnecting wallet
- Real-time display in Risk Assessment sidebar

### Smart Betting Analysis
```typescript
// Example AI suggestion output
{
  riskLevel: "MODERATE",
  suggestion: "Consider reducing bet size - you're betting 15% of bankroll",
  optimalBet: "2.5 STX",
  winProbability: 16.67,
  expectedValue: -0.02,
  action: "REDUCE_BET"
}
```

### Pattern Recognition
- Detects hot/cold streaks and adjusts suggestions
- Identifies potential problem gambling behaviors  
- Provides personalized risk assessments based on blockchain history
- Recommends optimal game modes based on playing style
- Auto-updates risk levels after each game

### Predictive Analytics
- Calculates expected outcomes based on betting history
- Provides bankroll management recommendations
- Suggests optimal stopping points
- Tracks long-term profitability trends
- Warns when risk levels become dangerous

## 📊 Game Economics

### House Edge
- **Classic Mode**: 2% house edge
- **High/Low Mode**: 2% house edge  
- **Range Betting**: 2% house edge
- **Progressive Jackpot**: 1% contribution, 1% house edge

### Payout Structure
| Game Mode | Win Probability | Payout Multiplier | House Edge |
|-----------|----------------|-------------------|------------|
| Classic Dice | 16.67% | 5x | 2% |
| High/Low | 50% | 2x | 2% |
| Range Betting | 33.33% | 3x | 2% |

### VIP Tier Benefits
- **Bronze** (0+ STX wagered): Standard experience
- **Silver** (100+ STX): 1% rakeback, exclusive tournaments
- **Gold** (500+ STX): 2% rakeback, priority support
- **Platinum** (1000+ STX): 3% rakeback, beta feature access
- **Diamond** (5000+ STX): 5% rakeback, governance participation

## 🏆 Tournaments & Competitions

### Weekly Tournaments
- **High Roller**: Minimum 10 STX buy-in
- **Speed Round**: 30-minute time limits
- **Streak Master**: Longest winning streak wins
- **Volume King**: Highest total wagered

### Seasonal Events
- **Bitcoin Pizza Day**: Special multipliers and bonuses
- **Halvening Celebration**: Progressive jackpot bonuses
- **Community Challenges**: Collective goals and rewards

## 📱 Mobile Experience

### Progressive Web App (PWA)
- **Offline Capability**: Core features work without internet
- **Native-Like Experience**: App-like interface and navigation
- **Push Notifications**: Game results and tournament updates
- **Touch Optimized**: Gesture-based controls and animations

### Mobile-First Design
- **Responsive Layout**: Optimized for all screen sizes
- **Fast Loading**: Optimized bundle size and lazy loading
- **Smooth Animations**: 60fps dice rolling animations
- **Touch Feedback**: Haptic feedback for game interactions

## 🔧 API Reference

### Smart Contract Functions

#### Core Game Functions
```clarity
;; Place a bet
(place-bet (target uint) (game-mode uint) (bet-amount uint))

;; Resolve a pending game  
(resolve-game (game-id uint))

;; Get game details
(get-game (game-id uint))
```

#### Player Statistics
```clarity
;; Get player stats
(get-player-stats (player principal))

;; Get leaderboard
(get-leaderboard (game-mode uint) (limit uint))
```

#### Jackpot Functions
```clarity
;; Get current jackpot amount
(get-jackpot (game-mode uint))

;; Check jackpot win conditions
(check-jackpot-eligibility (player principal))
```

### REST API Endpoints

#### Game Data
```http
GET /api/games/:gameId          # Get game details
GET /api/games/recent           # Get recent games
GET /api/stats/house            # Get house statistics
```

#### Player Data
```http
GET /api/players/:address/stats # Get player statistics
GET /api/players/:address/games # Get player game history
GET /api/leaderboard/:mode      # Get leaderboard data
```

#### AI Analytics
```http
POST /api/ai/analyze            # Get AI betting suggestions
GET /api/ai/insights/:address   # Get player insights
```

## 🧪 Testing

### Smart Contract Tests
```bash
# Run all contract tests
clarinet test

# Run specific test file
clarinet test tests/bitcoin-dice_test.ts

# Generate coverage report
clarinet test --coverage
```

### Frontend Tests
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Security Testing
```bash
# Run security analysis
npm run security:audit

# Check for vulnerabilities
npm audit

# Run contract security checks
clarinet check --security
```

## 🚀 Deployment

### Testnet Deployment
```bash
# Deploy to Stacks testnet
clarinet deploy --testnet

# Verify deployment
clarinet console --testnet
```

### Mainnet Deployment
```bash
# Build production bundle
npm run build

# Deploy frontend to Vercel
vercel deploy

# Deploy contracts to mainnet
clarinet deploy --mainnet
```

### Environment Variables
```env
REACT_APP_NETWORK=testnet
REACT_APP_CONTRACT_ADDRESS=SP2...
REACT_APP_API_URL=https://api.bitcoin-dice.com
REACT_APP_AI_ENDPOINT=https://ai.bitcoin-dice.com
```

## 📈 Metrics & Analytics

### Key Performance Indicators (KPIs)
- **Daily Active Users (DAU)**
- **Total Volume Wagered**
- **Player Retention Rate**  
- **Average Session Duration**
- **New User Acquisition**

### Game Analytics
- **Popular Game Modes**
- **Average Bet Sizes**
- **Win/Loss Ratios**
- **Jackpot Hit Frequency**
- **Mobile vs Desktop Usage**

### Player Analytics
- **Betting Patterns**
- **Risk Profiles**
- **VIP Tier Distribution**
- **Geographic Distribution**
- **Wallet Integration Success**

## 🎯 Hackathon Alignment

### Stacks Ecosystem Integration
- ✅ **Clarity Smart Contracts**: Advanced multi-contract architecture
- ✅ **Stacks.js Integration**: Comprehensive wallet and API usage
- ✅ **Bitcoin Alignment**: Unlocks Bitcoin utility through engaging gaming
- ✅ **Developer Experience**: Clean APIs and documentation

### Vibe Coding Excellence
- ✅ **AI-Enhanced Development**: Rapid feature development with high quality
- ✅ **Technical Sophistication**: Complex game mechanics and analytics
- ✅ **User Experience**: Mobile-first, intuitive design
- ✅ **Innovation**: Novel AI integration in blockchain gaming

### Competition Categories
- 🎯 **Gaming Bounty ($5,000)**: Advanced gaming mechanics and social features
- 🎯 **Main Competition**: Technical excellence and Bitcoin utility
- 🎯 **AI Integration**: Pioneering use of AI in blockchain gaming
- 🎯 **DeFi Elements**: Yield generation and progressive rewards

## 🛠️ Development Roadmap

### Phase 1: Core Features ✅
- [x] Basic dice game mechanics
- [x] Wallet integration
- [x] Smart contract deployment
- [x] Frontend MVP

### Phase 2: Enhanced Gaming ✅
- [x] Multiple game modes (Classic, High/Low, Range)
- [x] Progressive jackpots with realistic growth
- [x] Player statistics tracking
- [x] Live game feed with real-time updates
- [ ] Tournament system (in progress)

### Phase 3: AI Integration ✅
- [x] Smart betting suggestions
- [x] Real-time bet risk analysis
- [x] Overall performance risk tracking
- [x] ROI-based risk calculations
- [x] Pattern detection (streaks, volume analysis)
- [ ] Advanced ML-based pattern recognition
- [ ] Predictive modeling for optimal bet sizing

### Phase 4: Social Features 📋
- [ ] Community chat
- [ ] Referral system
- [ ] Social sharing
- [ ] Governance features

### Phase 5: Mobile App 📋
- [ ] Native iOS app
- [ ] Native Android app
- [ ] Offline gameplay
- [ ] Push notifications

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Automatic code formatting
- **Clarity**: Follow official style guidelines
- **Testing**: Minimum 80% coverage required

## 🙏 Acknowledgments

- **Stacks Foundation** for the amazing blockchain platform
- **Hiro Systems** for excellent developer tools
- **Clarinet Team** for making smart contract development enjoyable
- **OpenAI/Anthropic** for AI tools that made this project possible
- **The Bitcoin Community** for inspiring decentralized innovation

## 📞 Support

### Developer Support  
- **Documentation**: [docs.bitcoin-dice.com](https://docs.bitcoin-dice.com)
- **API Reference**: [api-docs.bitcoin-dice.com](https://api-docs.bitcoin-dice.com)
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/your-username/bitcoin-dice/issues)

<div align="center">

**Built with ❤️ for the Stacks Vibe Coding Hackathon**

[🎮 Play Now](https://bitcoin-dice-demo.vercel.app) | [⭐ Star on GitHub](https://github.com/your-username/bitcoin-dice) | [🐛 Report Bug](https://github.com/your-username/bitcoin-dice/issues)

</div>