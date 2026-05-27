import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

// Chips are integer units stored server-side in Wallet.balanceCents (1:1).
// Display as comma-grouped numbers without a currency symbol.
export function formatChips(amount) {
  if (amount == null) return '0';
  const n = Math.abs(amount).toLocaleString('en-US');
  return amount < 0 ? `-${n}` : n;
}

// Back-compat alias for callsites not yet renamed.
export const formatMoney = formatChips;

export function getWagerTier(chips) {
  if (chips < 100) return { label: 'MICRO', class: 'badge-micro' };
  if (chips <= 500) return { label: 'LOW', class: 'badge-low' };
  if (chips <= 2000) return { label: 'MID', class: 'badge-mid' };
  return { label: 'HIGH', class: 'badge-high' };
}

/**
 * Format relative time.
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Dice pip positions for standard dice faces.
 */
export const DICE_PIPS = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
};

/**
 * Generate CSS transform for dice to show a specific face.
 */
export function diceRotation(value) {
  const rotations = {
    1: 'rotateY(0deg)',
    2: 'rotateY(-90deg)',
    3: 'rotateY(180deg)',
    4: 'rotateY(90deg)',
    5: 'rotateX(-90deg)',
    6: 'rotateX(90deg)',
  };
  return rotations[value] || 'rotateY(0deg)';
}

/**
 * Player seat positions around a circular table.
 */
export function getSeatPositions(playerCount) {
  const positions = [];
  const startAngle = -90; // top center
  for (let i = 0; i < playerCount; i++) {
    const angle = startAngle + (360 / playerCount) * i;
    const rad = (angle * Math.PI) / 180;
    positions.push({
      x: 50 + 38 * Math.cos(rad),
      y: 50 + 38 * Math.sin(rad),
      angle,
    });
  }
  return positions;
}
