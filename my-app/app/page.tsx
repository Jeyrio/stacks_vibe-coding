"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import './App.css';
import { WalletInfo } from '@/types/wallet';

// Dynamic imports to prevent SSR issues
const GameInterface = dynamic(() => import('@/components/GameInterface'), { ssr: false });
const Header = dynamic(() => import('@/components/Header'), { ssr: false });
const LiveFeed = dynamic(() => import('@/components/LiveFeed'), { ssr: false });
const Leaderboard = dynamic(() => import('@/components/Leaderboard'), { ssr: false });
const PlayerDashboard = dynamic(() => import('@/components/PlayerDashboard'), { ssr: false });
const AIAssistant = dynamic(() => import('@/components/AIAssistant'), { ssr: false });

// Initialize wallet service
let walletService: any = null;
if (typeof window !== 'undefined') {
  import('@/lib/wallet-service').then((module) => {
    walletService = module.default;
  });
}

interface AISuggestion {
  type: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}

interface GameStats {
  totalGames?: number;
  wins?: number;
  losses?: number;
  totalWagered?: number;
  totalWinnings?: number;
}

interface GameResult {
  aiAnalysis?: AISuggestion[];
}

function App() {
  const [userData, setUserData] = useState<WalletInfo | null>(null);
  const [activeTab, setActiveTab] = useState('game');
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [isWalletServiceReady, setIsWalletServiceReady] = useState(false);
  const [currentBet, setCurrentBet] = useState<{ betAmount: string; gameMode: number; target: number } | undefined>(undefined);

  useEffect(() => {
    // Initialize wallet service
    const initWalletService = async () => {
      if (typeof window !== 'undefined') {
        const module = await import('@/lib/wallet-service');
        walletService = module.default;
        setIsWalletServiceReady(true);

        // Check if wallet is already connected
        const walletData = await walletService.getCurrentWalletData();
        if (walletData) {
          setUserData({
            address: walletData.address,
            publicKey: walletData.publicKey,
            profile: walletData.profile,
            isConnected: true,
          });
          loadPlayerStats();
        }
      }
    };

    initWalletService();
  }, []);

  // Load player stats when userData changes
  useEffect(() => {
    if (userData?.address) {
      loadPlayerStats();
    } else {
      setGameStats(null);
    }
  }, [userData]);

  const connectWallet = async () => {
    try {
      if (!walletService) {
        console.error('Wallet service not initialized');
        return;
      }

      const walletInfo = await walletService.connectWallet({
        name: 'Bitcoin Dice',
        icon: window.location.origin + '/logo.png',
      });

      setUserData(walletInfo);
      loadPlayerStats();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (!walletService) {
        console.error('Wallet service not initialized');
        return;
      }

      await walletService.disconnectWallet();
      setUserData(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const loadPlayerStats = async () => {
    // Fetch player statistics from blockchain
    if (!userData?.address) {
      console.log('📊 [Page] No user address, clearing gameStats');
      setGameStats(null);
      return;
    }

    try {
      console.log('📊 [Page] Fetching player stats for:', userData.address);
      const contractService = (await import('@/lib/contract-service')).default;
      const stats = await contractService.getPlayerStats(userData.address);
      console.log('📊 [Page] Player stats loaded:', stats);
      setGameStats(stats);
    } catch (error) {
      console.error('📊 [Page] Error loading player stats:', error);
      setGameStats(null);
    }
  };

  const handleGameResult = (result: GameResult) => {
    if (result.aiAnalysis) {
      setAiSuggestions(result.aiAnalysis);
    }
    loadPlayerStats();
  };

  return (
    <div className="app">
      <Header
        userData={userData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />

      <main className="app-main">
        <div className="main-content">
          {activeTab === 'game' && (
            <GameInterface
              userData={userData}
              onGameResult={handleGameResult}
              aiSuggestions={aiSuggestions}
              onBetChange={setCurrentBet}
            />
          )}
          {activeTab === 'dashboard' && (
            <PlayerDashboard userData={userData} gameStats={gameStats} />
          )}
          {activeTab === 'leaderboard' && <Leaderboard />}
        </div>

        <aside className="sidebar">
          <LiveFeed />
          <AIAssistant 
            suggestions={aiSuggestions} 
            userData={userData} 
            gameStats={gameStats}
            currentBet={activeTab === 'game' ? currentBet : undefined}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;