/**
 * Shared constants and types for ESC Voting app.
 * Safe to import from both server and client code.
 */

export const RATINGS = {
  "🔥": "Fire – absolute banger",
  "❤️": "Heart – really love it",
  "😊": "Smile – it's good",
  "😐": "Meh – not feeling it",
  "💀": "Dead – please no",
} as const;

export type RatingEmoji = keyof typeof RATINGS;

export interface Song {
  id: string;
  country: string;
  artist: string;
  song: string;
  flag: string;
  runningOrder: number;
}

export interface Voter {
  id: string;
  name: string;
}

export interface Vote {
  id: string;
  voter: string;
  country: string;
  rating: RatingEmoji;
}
