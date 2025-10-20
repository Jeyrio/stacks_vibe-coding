// @ts-nocheck
// Note: This test file uses Clarinet-specific matchers that require proper setup
// TypeScript checking is disabled temporarily - tests may need to be updated for current Clarinet SDK version

import { describe, expect, it, beforeEach } from "vitest";
import { Cl, cvToValue } from "@stacks/transactions";
import type { ClarityValue } from "@stacks/transactions";

// Helper functions to check Clarity types
const isOk = (value: ClarityValue) => {
  const val = cvToValue(value) as any;
  return val?.success === true || (typeof val === 'object' && 'value' in val && val.type?.includes('ok'));
};

const isErr = (value: ClarityValue) => {
  const val = cvToValue(value) as any;
  return val?.success === false || (typeof val === 'object' && 'value' in val && val.type?.includes('err'));
};

const isSome = (value: ClarityValue) => {
  const val = cvToValue(value) as any;
  return val !== null && val !== undefined && (val.type?.includes('optional') || val.type?.includes('some'));
};

const isNone = (value: ClarityValue) => {
  const val = cvToValue(value) as any;
  return val === null || val === undefined || val.type?.includes('none');
};

// Constants from contract
const MIN_BET = 1_000_000; // 1 STX
const MAX_BET = 100_000_000; // 100 STX
const MODE_CLASSIC = 0;
const MODE_HIGH_LOW = 1;
const MODE_RANGE = 2;

/**
 * Bitcoin Dice Smart Contract Test Suite
 * 
 * Comprehensive tests covering:
 * - Contract initialization and state management
 * - Bet placement with validation (amounts, targets, game modes)
 * - Game resolution with randomness and payouts
 * - Player statistics tracking and VIP tier system
 * - Jackpot management and payouts
 * - Multi-game mode support (Classic, High-Low, Range)
 * - Edge cases and security validations
 */
describe("Bitcoin Dice Smart Contract", () => {
  let accounts: Map<string, string>;
  let wallet1: string;
  let wallet2: string;
  let wallet3: string;

  beforeEach(() => {
    accounts = simnet.getAccounts();
    deployer = accounts.get("deployer")!;
    wallet1 = accounts.get("wallet_1")!;
    wallet2 = accounts.get("wallet_2")!;
    wallet3 = accounts.get("wallet_3")!;
  });

  describe("Contract Initialization", () => {
    it("should initialize with correct default house stats", () => {
      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-house-stats",
        [],
        wallet1
      );
      
      expect(result).toBeTuple({
        balance: Cl.uint(0),
        "total-games": Cl.uint(0),
        "total-volume": Cl.uint(0),
      });
    });

    it("should have simnet properly initialized", () => {
      expect(simnet.blockHeight).toBeDefined();
      expect(simnet.blockHeight).toBeGreaterThan(0);
    });
  });

  describe("Place Bet - Classic Mode", () => {
    it("should successfully place a valid bet in classic mode", () => {
      const betAmount = 5_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      const { result, events } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      expect(result).toBmyeOk(Cl.uint(1));
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("stx_transfer_event");
    });

    it("should reject bet below minimum amount", () => {
      const betAmount = 500_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      const { result } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101));
    });

    it("should reject bet above maximum amount", () => {
      const betAmount = 150_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      const { result } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101));
    });

    it("should reject invalid target for classic mode (target > 6)", () => {
      const betAmount = 5_000_000;
      const target = 7;
      const gameMode = MODE_CLASSIC;

      const { result } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101));
    });

    it("should reject invalid target for classic mode (target = 0)", () => {
      const betAmount = 5_000_000;
      const target = 0;
      const gameMode = MODE_CLASSIC;

      const { result } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101));
    });
  });

  describe("Place Bet - High-Low Mode", () => {
    it("should accept valid bet in high-low mode (low)", () => {
      const betAmount = 10_000_000;
      const target = 1;
      const gameMode = MODE_HIGH_LOW;

      const { result } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1));
    });

    it("should accept valid bet in high-low mode (high)", () => {
      const betAmount = 10_000_000;
      const target = 2;
      const gameMode = MODE_HIGH_LOW;

      const { result } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1));
    });
  });

  describe("Place Bet - Range Mode", () => {
    it("should accept valid bet in range mode", () => {
      const betAmount = 10_000_000;
      const target = 2;
      const gameMode = MODE_RANGE;

      const { result } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1));
    });

    it("should reject invalid target for range mode", () => {
      const betAmount = 10_000_000;
      const target = 4;
      const gameMode = MODE_RANGE;

      const { result } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101));
    });
  });

  describe("Game Counter Management", () => {
    it("should increment game counter correctly", () => {
      const betAmount = 5_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      const { result: result1 } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );
      expect(result1).toBeOk(Cl.uint(1));

      const { result: result2 } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet2
      );
      expect(result2).toBeOk(Cl.uint(2));

      const { result: result3 } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet3
      );
      expect(result3).toBeOk(Cl.uint(3));
    });
  });

  describe("Player Statistics Tracking", () => {
    it("should create and update player stats after placing bet", () => {
      const betAmount = 5_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-player-stats",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          "total-games": Cl.uint(1),
          "total-wagered": Cl.uint(betAmount),
          "total-won": Cl.uint(0),
          "win-streak": Cl.uint(0),
          "max-streak": Cl.uint(0),
          "vip-tier": Cl.uint(0),
          achievements: Cl.list([]),
        })
      );
    });

    it("should return none for player with no stats", () => {
      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-player-stats",
        [Cl.principal(wallet3)],
        wallet1
      );

      expect(result).toBeNone();
    });

    it("should accumulate total wagered across multiple bets", () => {
      const betAmount = 5_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-player-stats",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          "total-games": Cl.uint(3),
          "total-wagered": Cl.uint(betAmount * 3),
          "total-won": Cl.uint(0),
          "win-streak": Cl.uint(0),
          "max-streak": Cl.uint(0),
          "vip-tier": Cl.uint(0),
          achievements: Cl.list([]),
        })
      );
    });
  });

  describe("Jackpot System", () => {
    it("should contribute 1% of bet to jackpot", () => {
      const betAmount = 10_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-jackpot",
        [Cl.uint(gameMode)],
        wallet1
      );

      const expectedContribution = betAmount / 100;
      expect(result).toBeSome(
        Cl.tuple({
          amount: Cl.uint(expectedContribution),
          "last-winner": Cl.none(),
        })
      );
    });

    it("should accumulate jackpot across multiple bets", () => {
      const betAmount = 10_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-jackpot",
        [Cl.uint(gameMode)],
        wallet1
      );

      const expectedContribution = (betAmount / 100) * 2;
      expect(result).toBeSome(
        Cl.tuple({
          amount: Cl.uint(expectedContribution),
          "last-winner": Cl.none(),
        })
      );
    });

    it("should have separate jackpots for different game modes", () => {
      const betAmount = 10_000_000;
      const target = 3;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(MODE_CLASSIC), Cl.uint(betAmount)],
        wallet1
      );

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(1), Cl.uint(MODE_HIGH_LOW), Cl.uint(betAmount)],
        wallet2
      );

      const { result: jackpotClassic } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-jackpot",
        [Cl.uint(MODE_CLASSIC)],
        wallet1
      );

      const { result: jackpotHighLow } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-jackpot",
        [Cl.uint(MODE_HIGH_LOW)],
        wallet1
      );

      const expectedContribution = betAmount / 100;
      expect(jackpotClassic).toBeSome(
        Cl.tuple({
          amount: Cl.uint(expectedContribution),
          "last-winner": Cl.none(),
        })
      );

      expect(jackpotHighLow).toBeSome(
        Cl.tuple({
          amount: Cl.uint(expectedContribution),
          "last-winner": Cl.none(),
        })
      );
    });
  });

  describe("Game Resolution", () => {
    it("should successfully resolve a pending game", () => {
      const betAmount = 5_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      const gameId = 1;
      simnet.mineEmptyBlocks(2);

      const resolveResult = simnet.callPublicFn(
        "bitcoin-dice",
        "resolve-game",
        [Cl.uint(gameId)],
        wallet1
      );

      expect(resolveResult.result).toBeOk(expect.anything());
    });

    it("should reject resolution of non-existent game", () => {
      const gameId = 999;

      const response = simnet.callPublicFn(
        "bitcoin-dice",
        "resolve-game",
        [Cl.uint(gameId)],
        wallet1
      );

      expect(response.result).toBeErr(Cl.uint(102));
    });

    it("should reject double resolution of same game", () => {
      const betAmount = 5_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      const gameId = 1;
      simnet.mineEmptyBlocks(2);

      const firstResolve = simnet.callPublicFn(
        "bitcoin-dice",
        "resolve-game",
        [Cl.uint(gameId)],
        wallet1
      );
      expect(firstResolve.result).toBeOk(expect.anything());

      const secondResolve = simnet.callPublicFn(
        "bitcoin-dice",
        "resolve-game",
        [Cl.uint(gameId)],
        wallet1
      );

      expect(secondResolve.result).toBeErr(Cl.uint(103));
    });
  });

  describe("Read-Only Functions", () => {
    it("should retrieve game details correctly", () => {
      const betAmount = 5_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-game",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeSome(expect.anything());
    });

    it("should return none for non-existent game", () => {
      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-game",
        [Cl.uint(999)],
        wallet1
      );

      expect(result).toBeNone();
    });

    it("should track house statistics correctly", () => {
      const betAmount = 5_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-house-stats",
        [],
        wallet1
      );

      expect(result).toBeTuple({
        balance: expect.anything(),
        "total-games": Cl.uint(2),
        "total-volume": Cl.uint(betAmount * 2),
      });
    });
  });

  describe("VIP Tier System", () => {
    it("should start at Bronze tier for new players", () => {
      const betAmount = 1_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-player-stats",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          "total-games": Cl.uint(1),
          "total-wagered": Cl.uint(betAmount),
          "total-won": Cl.uint(0),
          "win-streak": Cl.uint(0),
          "max-streak": Cl.uint(0),
          "vip-tier": Cl.uint(0),
          achievements: Cl.list([]),
        })
      );
    });

    it("should upgrade to Silver tier at 100 STX wagered", () => {
      const betAmount = 100_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-player-stats",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          "total-games": Cl.uint(1),
          "total-wagered": Cl.uint(betAmount),
          "total-won": Cl.uint(0),
          "win-streak": Cl.uint(0),
          "max-streak": Cl.uint(0),
          "vip-tier": Cl.uint(1),
          achievements: Cl.list([]),
        })
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimum bet correctly", () => {
      const response = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(3), Cl.uint(MODE_CLASSIC), Cl.uint(MIN_BET)],
        wallet1
      );

      expect(response.result).toBeOk(Cl.uint(1));
    });

    it("should handle maximum bet correctly", () => {
      const response = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(3), Cl.uint(MODE_CLASSIC), Cl.uint(MAX_BET)],
        wallet1
      );

      expect(response.result).toBeOk(Cl.uint(1));
    });

    it("should handle multiple consecutive games", () => {
      const betAmount = 5_000_000;

      for (let i = 0; i < 5; i++) {
        const response = simnet.callPublicFn(
          "bitcoin-dice",
          "place-bet",
          [Cl.uint(3), Cl.uint(MODE_CLASSIC), Cl.uint(betAmount)],
          wallet1
        );

        expect(response.result).toBeOk(Cl.uint(i + 1));
      }

      const stats = simnet.callReadOnlyFn(
        "bitcoin-dice",
        "get-house-stats",
        [],
        wallet1
      );

      expect(stats.result).toBeTuple({
        balance: expect.anything(),
        "total-games": Cl.uint(5),
        "total-volume": Cl.uint(betAmount * 5),
      });
    });

    it("should handle all valid targets in classic mode", () => {
      const betAmount = 5_000_000;
      const gameMode = MODE_CLASSIC;

      for (let target = 1; target <= 6; target++) {
        const response = simnet.callPublicFn(
          "bitcoin-dice",
          "place-bet",
          [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
          wallet1
        );

        expect(response.result).toBeOk(Cl.uint(target));
      }
    });
  });

  describe("STX Transfer Events", () => {
    it("should emit STX transfer event when bet is placed", () => {
      const betAmount = 5_000_000;
      const target = 3;
      const gameMode = MODE_CLASSIC;

      const { events } = simnet.callPublicFn(
        "bitcoin-dice",
        "place-bet",
        [Cl.uint(target), Cl.uint(gameMode), Cl.uint(betAmount)],
        wallet1
      );

      expect(events).toHaveLength(1);
      const transferEvent = events[0];
      expect(transferEvent.event).toBe("stx_transfer_event");
      expect(transferEvent.data.amount).toBe(betAmount.toString());
      expect(transferEvent.data.sender).toBe(wallet1);
    });
  });
});
