;; contracts/bitcoin-dice.clar
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_BET (err u101))
(define-constant ERR_GAME_NOT_FOUND (err u102))
(define-constant ERR_GAME_ALREADY_RESOLVED (err u103))
(define-constant ERR_INSUFFICIENT_FUNDS (err u104))
(define-constant MIN_BET u1000000) ;; 1 STX
(define-constant MAX_BET u100000000) ;; 100 STX
(define-constant HOUSE_EDGE u200) ;; 2%

;; Game states
(define-constant GAME_PENDING u0)
(define-constant GAME_RESOLVED u1)
(define-constant GAME_CANCELLED u2)

;; Game modes
(define-constant MODE_CLASSIC u0)
(define-constant MODE_HIGH_LOW u1)
(define-constant MODE_RANGE u2)

;; Data structures
(define-map games
  { game-id: uint }
  {
    player: principal,
    bet-amount: uint,
    target: uint,
    game-mode: uint,
    block-height: uint,
    status: uint,
    result: (optional uint),
    payout: uint,
    timestamp: uint
  }
)

(define-map player-stats
  { player: principal }
  {
    total-games: uint,
    total-wagered: uint,
    total-won: uint,
    win-streak: uint,
    max-streak: uint,
    vip-tier: uint,
    achievements: (list 20 uint)
  }
)

(define-map jackpots
  { game-mode: uint }
  { amount: uint, last-winner: (optional principal) }
)

(define-data-var game-counter uint u0)
(define-data-var house-balance uint u0)
(define-data-var total-volume uint u0)

;; Place bet function with multiple game modes
(define-public (place-bet (target uint) (game-mode uint) (bet-amount uint))
  (let (
    (game-id (+ (var-get game-counter) u1))
    (player tx-sender)
    (current-height stacks-block-height)
  )
    (asserts! (>= bet-amount MIN_BET) ERR_INVALID_BET)
    (asserts! (<= bet-amount MAX_BET) ERR_INVALID_BET)
    (asserts! (is-valid-target target game-mode) ERR_INVALID_BET)
    
    ;; Transfer bet to contract
    (try! (stx-transfer? bet-amount player (as-contract tx-sender)))
    
    ;; Create game
    (map-set games
      { game-id: game-id }
      {
        player: player,
        bet-amount: bet-amount,
        target: target,
        game-mode: game-mode,
        block-height: (+ current-height u1),
        status: GAME_PENDING,
        result: none,
        payout: u0,
        timestamp: current-height
      }
    )
    
    ;; Update counters
    (var-set game-counter game-id)
    (var-set total-volume (+ (var-get total-volume) bet-amount))
    
    ;; Add to jackpot
    (update-jackpot game-mode bet-amount)
    
    ;; Update player stats
    (update-player-stats player bet-amount u0 false)
    
    (ok game-id)
  )
)

;; Auto-resolve game using VRF
;; #[allow(unchecked_data)]
(define-public (resolve-game (game-id uint))
  (let (
    (game (unwrap! (map-get? games { game-id: game-id }) ERR_GAME_NOT_FOUND))
    (player (get player game))
    (bet-amount (get bet-amount game))
    (target (get target game))
    (game-mode (get game-mode game))
    (resolve-height (get block-height game))
  )
    (asserts! (is-eq (get status game) GAME_PENDING) ERR_GAME_ALREADY_RESOLVED)
    (asserts! (>= stacks-block-height resolve-height) (err u105))
    
    ;; Generate random number using block hash
    ;; Note: In production, use Chainlink VRF or similar oracle for true randomness
    (let (
      (dice-result (+ u1 (mod (+ stacks-block-height game-id) u6)))
      (is-winner (check-win target dice-result game-mode))
      (payout-amount (if is-winner (calculate-payout bet-amount game-mode target) u0))
      (jackpot-win (and is-winner (check-jackpot-win dice-result)))
      (total-payout (if jackpot-win 
                      (+ payout-amount (get-jackpot-amount game-mode)) 
                      payout-amount))
    )
      
      ;; Update game
      (map-set games
        { game-id: game-id }
        (merge game {
          status: GAME_RESOLVED,
          result: (some dice-result),
          payout: total-payout
        })
      )
      
      ;; Pay winner
      (if (> total-payout u0)
        (try! (as-contract (stx-transfer? total-payout tx-sender player)))
        true
      )
      
      ;; Update house balance
      (if is-winner
        (var-set house-balance (- (var-get house-balance) (- total-payout bet-amount)))
        (var-set house-balance (+ (var-get house-balance) bet-amount))
      )
      
      ;; Update player stats
      (update-player-stats player u0 total-payout is-winner)
      
      ;; Reset jackpot if won
      (if jackpot-win (reset-jackpot game-mode player) true)
      
      (ok { result: dice-result, payout: total-payout, jackpot: jackpot-win })
    )
  )
)

;; Helper functions
(define-private (is-valid-target (target uint) (game-mode uint))
  (if (is-eq game-mode MODE_CLASSIC)
    (and (>= target u1) (<= target u6))
    (if (is-eq game-mode MODE_HIGH_LOW)
      (and (>= target u1) (<= target u6))
      (if (is-eq game-mode MODE_RANGE)
        (and (>= target u1) (<= target u3)) ;; 1=low, 2=mid, 3=high
        false
      )
    )
  )
)

(define-private (check-win (target uint) (result uint) (game-mode uint))
  (if (is-eq game-mode MODE_CLASSIC)
    (is-eq target result)
    (if (is-eq game-mode MODE_HIGH_LOW)
      (if (is-eq target u1) (<= result u3) (>= result u4)) ;; 1=low, 2=high
      (if (is-eq game-mode MODE_RANGE)
        (or 
          (and (is-eq target u1) (or (is-eq result u1) (is-eq result u2)))
          (and (is-eq target u2) (or (is-eq result u3) (is-eq result u4)))
          (and (is-eq target u3) (or (is-eq result u5) (is-eq result u6)))
        )
        false
      )
    )
  )
)

(define-private (calculate-payout (bet-amount uint) (game-mode uint) (target uint))
  (let (
    (base-multiplier (if (is-eq game-mode MODE_CLASSIC) u5
                      (if (is-eq game-mode MODE_HIGH_LOW) u2
                        u3))) ;; MODE_RANGE
  )
    (* bet-amount base-multiplier)
  )
)

(define-private (update-jackpot (game-mode uint) (bet-amount uint))
  (let (
    (current-jackpot (default-to { amount: u0, last-winner: none } 
                      (map-get? jackpots { game-mode: game-mode })))
    (contribution (/ bet-amount u100)) ;; 1% to jackpot
  )
    (map-set jackpots
      { game-mode: game-mode }
      (merge current-jackpot { amount: (+ (get amount current-jackpot) contribution) })
    )
  )
)

(define-private (update-player-stats (player principal) (wagered uint) (won uint) (is-winner bool))
  (let (
    (current-stats (default-to 
      { total-games: u0, total-wagered: u0, total-won: u0, win-streak: u0, max-streak: u0, vip-tier: u0, achievements: (list) }
      (map-get? player-stats { player: player })))
    (new-streak (if is-winner (+ (get win-streak current-stats) u1) u0))
    (new-max-streak (if (> new-streak (get max-streak current-stats)) new-streak (get max-streak current-stats)))
  )
    (map-set player-stats
      { player: player }
      {
        total-games: (+ (get total-games current-stats) u1),
        total-wagered: (+ (get total-wagered current-stats) wagered),
        total-won: (+ (get total-won current-stats) won),
        win-streak: new-streak,
        max-streak: new-max-streak,
        vip-tier: (calculate-vip-tier (+ (get total-wagered current-stats) wagered)),
        achievements: (get achievements current-stats)
      }
    )
  )
)

(define-private (check-jackpot-win (dice-result uint))
  ;; Simple jackpot trigger: rolling a 6
  ;; Can be made more complex (e.g., three 6s in a row)
  (is-eq dice-result u6)
)

(define-private (get-jackpot-amount (game-mode uint))
  (let (
    (jackpot-data (default-to { amount: u0, last-winner: none } 
                    (map-get? jackpots { game-mode: game-mode })))
  )
    (get amount jackpot-data)
  )
)

(define-private (reset-jackpot (game-mode uint) (winner principal))
  (map-set jackpots
    { game-mode: game-mode }
    { amount: u0, last-winner: (some winner) }
  )
)

(define-private (calculate-vip-tier (total-wagered uint))
  (if (>= total-wagered u5000000000) u4  ;; Diamond: 5000 STX
    (if (>= total-wagered u1000000000) u3  ;; Platinum: 1000 STX
      (if (>= total-wagered u500000000) u2  ;; Gold: 500 STX
        (if (>= total-wagered u100000000) u1  ;; Silver: 100 STX
          u0  ;; Bronze: < 100 STX
        )
      )
    )
  )
)

;; Read-only functions
(define-read-only (get-game (game-id uint))
  (map-get? games { game-id: game-id })
)

(define-read-only (get-player-stats (player principal))
  (map-get? player-stats { player: player })
)

(define-read-only (get-jackpot (game-mode uint))
  (map-get? jackpots { game-mode: game-mode })
)

(define-read-only (get-house-stats)
  {
    balance: (var-get house-balance),
    total-games: (var-get game-counter),
    total-volume: (var-get total-volume)
  }
)