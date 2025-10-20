import React from 'react';
import './Header.css';
import { WalletInfo } from '@/types/wallet';

interface HeaderProps {
  userData: WalletInfo | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userData,
  activeTab,
  setActiveTab,
  connectWallet,
  disconnectWallet,
}) => {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="app-header">
      <div className="header-logo">
        <h1>🎲 BitCoin Dice</h1>
        <span className="tagline">Provably Fair Gaming</span>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-button ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          🎮 Play Game
        </button>
        <button
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
      </nav>

      <div className="header-wallet">
        {!userData ? (
          <button className="connect-wallet-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <div className="wallet-connected">
            <div className="wallet-address">
              <span className="address-label">Connected:</span>
              <span className="address">
                {truncateAddress(userData.address)}
              </span>
            </div>
            <button className="disconnect-btn" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;