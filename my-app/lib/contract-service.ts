// lib/contract-service.ts
import {
  openContractCall,
  ContractCallRegularOptions,
} from '@stacks/connect';
import {
  uintCV,
  principalCV,
  PostConditionMode,
  ClarityValue,
  cvToJSON,
  fetchCallReadOnlyFunction,
  standardPrincipalCV,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST3Y2767DSNTBTP7Q86GRQ4NBG69C6SD1AKC3P4SK';
const CONTRACT_NAME = 'bitcoin-dice';
const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
  ? STACKS_MAINNET
  : STACKS_TESTNET;

// Game modes
export const GAME_MODES = {
  CLASSIC: 0,
  HIGH_LOW: 1,
  RANGE: 2,
};

// Helper to convert microSTX to STX
export const microToStx = (micro: number): number => micro / 1_000_000;
export const stxToMicro = (stx: number): number => Math.floor(stx * 1_000_000);

interface PlaceBetParams {
  target: number;
  gameMode: number;
  betAmount: number; // in STX
  userAddress: string;
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}

interface ResolveGameParams {
  gameId: number;
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}

/**
 * Place a bet on the dice game
 */
export const placeBet = async ({
  target,
  gameMode,
  betAmount,
  userAddress,
  onFinish,
  onCancel,
}: PlaceBetParams): Promise<void> => {
  const betAmountMicro = stxToMicro(betAmount);

  const options: ContractCallRegularOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'place-bet',
    functionArgs: [
      uintCV(target),
      uintCV(gameMode),
      uintCV(betAmountMicro),
    ],
    postConditionMode: PostConditionMode.Allow,
    network: NETWORK,
    onFinish: (data) => {
      console.log('Bet placed successfully:', data);
      onFinish?.(data);
    },
    onCancel: () => {
      console.log('Bet cancelled');
      onCancel?.();
    },
  };

  await openContractCall(options);
};

/**
 * Resolve a pending game
 */
export const resolveGame = async ({
  gameId,
  onFinish,
  onCancel,
}: ResolveGameParams): Promise<void> => {
  const options: ContractCallRegularOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'resolve-game',
    functionArgs: [uintCV(gameId)],
    postConditionMode: PostConditionMode.Allow,
    network: NETWORK,
    onFinish: (data) => {
      console.log('Game resolved:', data);
      onFinish?.(data);
    },
    onCancel: () => {
      console.log('Resolution cancelled');
      onCancel?.();
    },
  };

  await openContractCall(options);
};

/**
 * Get game details by game ID
 */
export const getGame = async (gameId: number): Promise<any | null> => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-game',
      functionArgs: [uintCV(gameId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    if (jsonResult.value === null) {
      return null;
    }

    return jsonResult.value;
  } catch (error) {
    console.error('Error fetching game:', error);
    return null;
  }
};

/**
 * Get player statistics
 */
export const getPlayerStats = async (playerAddress: string): Promise<any | null> => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-player-stats',
      functionArgs: [standardPrincipalCV(playerAddress)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    if (jsonResult.value === null) {
      return null;
    }

    return jsonResult.value;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return null;
  }
};

/**
 * Get jackpot amount for a specific game mode
 */
export const getJackpot = async (gameMode: number): Promise<number> => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-jackpot',
      functionArgs: [uintCV(gameMode)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    
    if (jsonResult.value === null) {
      return 0;
    }

    const amount = jsonResult.value.value?.amount?.value || 0;
    return microToStx(parseInt(amount));
  } catch (error) {
    console.error('Error fetching jackpot:', error);
    return 0;
  }
};

/**
 * Get house statistics
 */
export const getHouseStats = async (): Promise<any> => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-house-stats',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const jsonResult = cvToJSON(result);
    return jsonResult.value || { balance: 0, 'total-games': 0, 'total-volume': 0 };
  } catch (error) {
    console.error('Error fetching house stats:', error);
    return { balance: 0, 'total-games': 0, 'total-volume': 0 };
  }
};

/**
 * Poll for transaction confirmation
 */
export const pollTransaction = async (
  txId: string,
  maxAttempts: number = 30,
  intervalMs: number = 3000
): Promise<any> => {
  const apiUrl = process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
    ? 'https://api.mainnet.hiro.so'
    : 'https://api.testnet.hiro.so';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
      const data = await response.json();

      if (data.tx_status === 'success') {
        return data;
      } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
        // Extract contract error details
        const errorDetails = data.tx_result?.repr || data.tx_result || 'Unknown error';
        console.error('Contract error details:', {
          status: data.tx_status,
          result: data.tx_result,
          error: errorDetails
        });
        throw new Error(`Transaction failed: ${data.tx_status} - ${errorDetails}`);
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error);
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error('Transaction confirmation timeout');
};

/**
 * Get multiple games for a player (for history)
 */
export const getPlayerGameHistory = async (
  playerAddress: string,
  limit: number = 10
): Promise<any[]> => {
  try {
    // In a real implementation, you'd need to either:
    // 1. Add a contract function to get player games
    // 2. Use an indexer/API to query events
    // 3. Store game IDs off-chain
    
    // For now, return empty array - you'll need to implement proper indexing
    console.warn('Game history requires indexing implementation');
    return [];
  } catch (error) {
    console.error('Error fetching game history:', error);
    return [];
  }
};

export default {
  placeBet,
  resolveGame,
  getGame,
  getPlayerStats,
  getJackpot,
  getHouseStats,
  pollTransaction,
  getPlayerGameHistory,
  GAME_MODES,
  microToStx,
  stxToMicro,
};
