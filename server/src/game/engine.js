import crypto from 'crypto';

const HOUSE_RAKE_PERCENT = parseInt(process.env.HOUSE_RAKE_PERCENT || '5', 10);

/**
 * Roll N dice using cryptographically secure randomness.
 * Server-authoritative — client never generates rolls.
 */
export function rollDice(count = 6) {
  return Array.from({ length: count }, () => {
    const bytes = crypto.randomBytes(1);
    return (bytes[0] % 6) + 1;
  });
}

/**
 * Score a roll: 3s are worth 0, sum the rest.
 */
export function scoreRoll(dice) {
  return dice.reduce((sum, d) => sum + (d === 3 ? 0 : d), 0);
}

/**
 * Check if all dice are 3s — instant elimination.
 */
export function isAllThrees(dice) {
  return dice.every(d => d === 3);
}

/**
 * Apply reroll: keep 3s locked, reroll everything else.
 * Returns new full dice array with locked 3s preserved.
 */
export function rerollDice(originalDice) {
  return originalDice.map(d => {
    if (d === 3) return 3; // locked
    const bytes = crypto.randomBytes(1);
    return (bytes[0] % 6) + 1;
  });
}

/**
 * Resolve a round given all rolls.
 * Returns scores, eliminated players, and losers (lowest scorers).
 */
export function resolveRound(rolls) {
  const scores = {};
  const eliminated = [];

  for (const [userId, dice] of Object.entries(rolls)) {
    if (isAllThrees(dice)) {
      eliminated.push(userId);
      scores[userId] = 0;
    } else {
      scores[userId] = scoreRoll(dice);
    }
  }

  // Among non-eliminated players, find lowest score
  const activePlayers = Object.entries(scores)
    .filter(([uid]) => !eliminated.includes(uid));

  if (activePlayers.length === 0) {
    // Everyone eliminated — edge case
    return { scores, losers: eliminated, eliminated };
  }

  const minScore = Math.min(...activePlayers.map(([, s]) => s));
  const lowestScorers = activePlayers
    .filter(([, s]) => s === minScore)
    .map(([uid]) => uid);

  // All losers: eliminated + lowest scorers
  const losers = [...new Set([...eliminated, ...lowestScorers])];

  return { scores, losers, eliminated };
}

/**
 * Calculate pot distribution.
 * Pot = wager * number of losers.
 * Rake = house percentage of pot.
 * Remainder split among winners.
 */
export function calculatePayout(wagerCents, playerCount, loserCount) {
  const totalPot = wagerCents * playerCount;
  const loserContribution = wagerCents * loserCount;
  const rake = Math.floor(loserContribution * (HOUSE_RAKE_PERCENT / 100));
  const distributable = loserContribution - rake;
  const winnersCount = playerCount - loserCount;
  const payoutPerWinner = winnersCount > 0
    ? Math.floor(distributable / winnersCount)
    : 0;

  // Each winner gets their original wager back + share of losers' pot minus rake
  return {
    totalPot,
    loserContribution,
    rake,
    distributable,
    winnersCount,
    payoutPerWinner, // this is the PROFIT per winner (on top of getting wager back)
    returnPerWinner: wagerCents + payoutPerWinner, // total returned to each winner
  };
}

/**
 * Validate wager amount against configured limits.
 */
export function validateWager(amountCents) {
  const min = parseInt(process.env.MIN_WAGER_CENTS || '25', 10);
  const max = parseInt(process.env.MAX_WAGER_CENTS || '50000', 10);
  if (amountCents < min) return { valid: false, error: `Minimum wager is $${(min / 100).toFixed(2)}` };
  if (amountCents > max) return { valid: false, error: `Maximum wager is $${(max / 100).toFixed(2)}` };
  return { valid: true };
}
