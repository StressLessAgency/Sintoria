import crypto from 'crypto';

export const HAND_SIZE = 5;
export const MAX_ROLLS = 5;
export const HOUSE_RAKE_PERCENT = parseFloat(process.env.HOUSE_RAKE_PERCENT || '2');

/**
 * Unbiased roll of N dice using cryptographically secure randomness.
 * Rejects bytes >= 252 (4 * 63) to avoid modulo bias.
 */
export function rollDice(count) {
  const max = 252;
  const dice = [];
  while (dice.length < count) {
    const byte = crypto.randomBytes(1)[0];
    if (byte < max) dice.push((byte % 6) + 1);
  }
  return dice;
}

/** Score set-aside dice. 3s count as 0; others sum normally. Lower is better. */
export function scoreSetAside(setAside) {
  return setAside.reduce((sum, d) => sum + (d === 3 ? 0 : d), 0);
}

/** All 5 dice showing 6 on a single roll = "Shooting the Moon" insta-win. */
export function isShootingTheMoon(roll) {
  return roll.length === HAND_SIZE && roll.every((d) => d === 6);
}

/** A player is finished when all 5 dice are set aside. */
export function isPlayerDone(player) {
  return player.setAside.length >= HAND_SIZE;
}

/** Number of dice the player will roll on their next turn. */
export function diceRemaining(player) {
  return HAND_SIZE - player.setAside.length;
}

/**
 * Pot distribution: winner takes the pot minus configurable house rake.
 */
export function calculatePayout(potCents) {
  const rake = Math.floor(potCents * (HOUSE_RAKE_PERCENT / 100));
  return {
    potCents,
    rakeCents: rake,
    winnerCents: potCents - rake,
  };
}

/**
 * Find the lowest score among finished players. Returns the IDs tied at
 * that score. If exactly one, that player wins outright; otherwise the
 * tied players re-ante and replay.
 */
export function resolveScores(playerScores) {
  if (playerScores.length === 0) return { winners: [], minScore: null };
  const minScore = Math.min(...playerScores.map((p) => p.score));
  const winners = playerScores.filter((p) => p.score === minScore).map((p) => p.userId);
  return { winners, minScore };
}

export function validateWager(amountCents) {
  const min = parseInt(process.env.MIN_WAGER_CENTS || '25', 10);
  const max = parseInt(process.env.MAX_WAGER_CENTS || '50000', 10);
  if (amountCents < min) return { valid: false, error: `Minimum wager is $${(min / 100).toFixed(2)}` };
  if (amountCents > max) return { valid: false, error: `Maximum wager is $${(max / 100).toFixed(2)}` };
  return { valid: true };
}

/** Must set aside at least one die; indices must be unique and in range of the current roll. */
export function validateSetAside(roll, indices) {
  if (!Array.isArray(indices) || indices.length < 1) {
    return { valid: false, error: 'Must set aside at least one die' };
  }
  if (indices.length > roll.length) {
    return { valid: false, error: 'Cannot set aside more dice than rolled' };
  }
  const seen = new Set();
  for (const i of indices) {
    if (!Number.isInteger(i) || i < 0 || i >= roll.length) {
      return { valid: false, error: 'Invalid die index' };
    }
    if (seen.has(i)) return { valid: false, error: 'Duplicate die index' };
    seen.add(i);
  }
  return { valid: true };
}
