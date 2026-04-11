/**
 * Pure scoring utilities for computing assumed votes when not all players voted.
 *
 * When a game is closed and some players haven't voted on a song, we assume
 * they would have given the median score of all actual votes for that song
 * (rounded down to the nearest emoji score).
 */

import { RATING_SCORES, type RatingEmoji } from "./constants";

/**
 * Sorted score thresholds from lowest to highest, used for mapping a numeric
 * score back to the nearest emoji.
 */
const SCORE_THRESHOLDS: { emoji: RatingEmoji; score: number }[] = (
  Object.entries(RATING_SCORES) as [RatingEmoji, number][]
)
  .map(([emoji, score]) => ({ emoji, score }))
  .sort((a, b) => a.score - b.score);

/**
 * Compute the median of an array of numbers.
 *
 * For an even-length array, returns the average of the two middle values
 * (rounded down via Math.floor). For an odd-length array, returns the exact
 * middle value. Returns 0 for an empty array.
 */
export function computeMedianScore(scores: number[]): number {
  if (scores.length === 0) return 0;

  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }

  return Math.floor((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Map a numeric score to the closest rating emoji whose score is ≤ the given
 * value. This lets us "round down" a median score to a valid emoji rating.
 *
 * Examples:
 *   4 → 😁 (score 3)
 *   2 → 😐 (score 1)
 *   0 → 😴 (score 0)
 *  -0.5 → 🤮 (score -1)
 */
export function scoreToEmoji(score: number): RatingEmoji {
  let best = SCORE_THRESHOLDS[0]; // fallback: lowest emoji
  for (const entry of SCORE_THRESHOLDS) {
    if (entry.score <= score) {
      best = entry;
    }
  }
  return best.emoji;
}
