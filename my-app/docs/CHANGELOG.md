# Changelog

All notable changes to BitCoin Dice will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Multi-player tournament system
- NFT achievement minting
- Staking rewards for STX holders
- Mobile native apps (iOS/Android)
- Community governance features

## [0.3.0] - 2025-10-17

### Added
- **Dual Risk Assessment System**
  - Real-time bet risk calculation before placing bets
  - Overall performance risk tracking based on historical data
  - Separate displays for current bet vs overall performance
  - Color-coded risk indicators (Green/Yellow/Red)
  
- **Detailed Risk Breakdown Display**
  - **Bet Risk Shows**: Win chance, potential win/loss, risk factors (up to 2 shown)
  - **Performance Risk Shows**: Games played, ROI %, wagered/won amounts, net profit/loss, performance factors (up to 3 shown)
  - All monetary values displayed in STX with color coding
  - Factor descriptions include specific metrics (e.g., "Very low ROI (47.6% - losing >50%)")
  - Real-time updates as data changes
  
- **Enhanced Risk Calculations**
  - ROI-based analysis (35% weight)
  - Net loss amount tracking (30% weight)
  - Win streak analysis (20% weight)
  - Volume vs performance patterns (15% weight)
  - Auto-updates after each game completion
  - Detailed factor messages for user understanding

- **Improved Progressive Jackpots**
  - Realistic growth rate (0.015-0.045 STX/second)
  - Continuous progression simulation
  - More authentic base values (2847.39, 1523.67, 982.44 STX)
  - Removed artificial sin/cos variance

- **Professional UI Polish**
  - Clean risk display in sidebar
  - Context-aware messages ("Play games to see risk")
  - Detailed risk factor breakdowns
  - Improved visual hierarchy

### Changed
- Moved bet risk display from betting panel to Risk Assessment sidebar
- Updated risk calculation to use blockchain data instead of placeholders
- Improved data extraction from Clarity contract responses
- Enhanced console logging for debugging

### Fixed
- Fixed overall performance risk not calculating (nested Clarity value extraction)
- Fixed lose-streak field reference (contract only has win-streak)
- Corrected ROI calculation thresholds for accurate risk assessment
- Fixed data flow from contract → page.tsx → AIAssistant
- Resolved React useCallback dependency issues

## [0.2.0] - 2025-10-15

### Added
- Multiple game modes (Classic, High/Low, Range)
- Progressive jackpot system
- Live game feed with real-time updates
- Player statistics dashboard
- VIP tier system
- Achievement tracking
- Leaderboard system

### Changed
- Improved wallet integration
- Enhanced game interface
- Better error handling

### Fixed
- Wallet connection issues
- Transaction confirmation delays
- UI responsiveness on mobile

## [0.1.0] - 2025-10-10

### Added
- Initial release
- Basic dice game (Classic mode)
- Stacks wallet integration
- Smart contract deployment on testnet
- Basic frontend with React + TypeScript
- Contract service for blockchain interactions
- Auto-resolution system

### Security
- Implemented PostConditionMode checks
- Added transaction confirmation waiting
- Basic error handling for failed transactions

---

## Version History Summary

| Version | Date | Key Features |
|---------|------|--------------|
| 0.3.0 | 2025-10-17 | Dual risk assessment, ROI tracking, jackpot improvements |
| 0.2.0 | 2025-10-15 | Multiple game modes, progressive jackpots, social features |
| 0.1.0 | 2025-10-10 | Initial release with basic dice game |

## Breaking Changes

### 0.3.0
- None - all changes are backward compatible

### 0.2.0
- Game mode parameter changed from string to number (0, 1, 2)
- Player stats structure updated to include VIP tier

### 0.1.0
- Initial release - no breaking changes

## Migration Guides

### From 0.2.0 to 0.3.0
No migration needed. Risk assessment features are additive and work with existing game data.

### From 0.1.0 to 0.2.0
Update game mode calls:
```typescript
// Old
placeBet({ gameMode: 'classic', ... })

// New
placeBet({ gameMode: 0, ... })  // 0=Classic, 1=High/Low, 2=Range
```

## Contributors

Special thanks to all contributors who helped make BitCoin Dice better!

- [@Jeyrio](https://github.com/Jeyrio) - Project Lead & Development
- AI Development Tools (GitHub Copilot, Claude) - Development Assistance

## Support

For questions or issues:
- GitHub Issues: [Report here](https://github.com/Jeyrio/stacks_vibe-coding/issues)
- Documentation: See `OVERALL_PERFORMANCE_RISK_EXPLAINED.md` for risk system details
- Troubleshooting: See various `FIXING_*.md` guides in the repository

---

**Note**: This project is in active development for the Stacks Vibe Coding Hackathon. Features and APIs may change rapidly during the hackathon period.
