/**
 * ChitShuffleAnimation.ts
 * Core shuffle physics and animation utilities for modern ChitChor.
 * Ensures chits visibly swirl, swap, and shuffle smoothly before every round starts.
 */

import { ChitShuffleAnimation } from './ChitShuffleAnimation.tsx';
export { ChitShuffleAnimation };
export default ChitShuffleAnimation;

export interface ChitPosition {
  x: number;
  y: number;
  rotateZ: number;
  rotateY: number;
  scale: number;
  zIndex: number;
}

/**
 * Calculates smooth 3D orbital trajectory positions for chit shuffling.
 */
export function calculateChitShufflePositions(
  count: number,
  step: number
): ChitPosition[] {
  return Array.from({ length: count }).map((_, idx) => {
    const angle = ((idx + step * 1.6) % count) * (360 / count);
    const rad = (angle * Math.PI) / 180;
    const x = Math.sin(rad) * 105;
    const y = Math.cos(rad) * 48;
    const rotateZ = (idx % 2 === 0 ? 1 : -1) * (14 + (step % 4) * 9);
    const rotateY = Math.sin(rad) * 28;
    const scale = 0.94 + ((idx + step) % count) * 0.08;
    const zIndex = ((idx + step) % count) + 10;

    return { x, y, rotateZ, rotateY, scale, zIndex };
  });
}

/**
 * Generates randomized chit roles for 4-player or 5-player court.
 */
export function generateShuffledCourtChits(mode: 'classic4' | 'extended5') {
  const roles =
    mode === 'classic4'
      ? ['raja', 'rani', 'sipahi', 'chor']
      : ['raja', 'rani', 'katual', 'sipahi', 'chor'];

  return [...roles].sort(() => Math.random() - 0.5);
}
