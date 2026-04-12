/**
 * Shared constants and types for ESC Voting app.
 * Safe to import from both server and client code.
 */

export const RATINGS = {
  "🤩": "Star-struck – absolute banger",
  "😁": "Grinning – really love it",
  "😐": "Meh – it's okay",
  "😴": "Sleepy – not feeling it",
  "🤮": "Puke – please no",
} as const;

export type RatingEmoji = keyof typeof RATINGS;

/**
 * Score assigned to each rating emoji, used for computing final results.
 * Best emoji scores highest.
 */
export const RATING_SCORES: Record<RatingEmoji, number> = {
  "🤩": 5,
  "😁": 3,
  "😐": 1,
  "😴": 0,
  "🤮": -1,
};

export interface Game {
  id: string;
  token: string;
  closed: number;
  created_at: string;
  escYear: number;
}

export interface Song {
  id: string;
  country: string;
  artist: string;
  song: string;
  flag: string;
  runningOrder: number;
  youtubeId: string;
  durationSec: number;
  semifinal: number;
  semifinalHalf: number;
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

/**
 * The default ESC year used when creating new games.
 */
export const DEFAULT_ESC_YEAR = 2026;

/**
 * Montage video data keyed by ESC year.
 *
 * Each entry contains the YouTube video ID for the montage and a timestamp
 * mapping that maps the start time (in seconds) of each song segment to its
 * country name. Only apply timestamps when the year matches — if a year has
 * no entry here, no montage features are available.
 */
export interface MontageData {
  youtubeId: string;
  timestamps: { startSec: number; country: string }[];
}

export const ESC_MONTAGE_DATA: Record<number, MontageData> = {
  2026: {
    youtubeId: "1jnR-m5u5yQ",
    timestamps: [
      { startSec: 0, country: "Albania" },
      { startSec: 31, country: "Armenia" },
      { startSec: 60, country: "Australia" },
      { startSec: 89, country: "Austria" },
      { startSec: 118, country: "Azerbaijan" },
      { startSec: 145, country: "Belgium" },
      { startSec: 173, country: "Bulgaria" },
      { startSec: 204, country: "Croatia" },
      { startSec: 235, country: "Cyprus" },
      { startSec: 264, country: "Czechia" },
      { startSec: 296, country: "Denmark" },
      { startSec: 326, country: "Estonia" },
      { startSec: 354, country: "Finland" },
      { startSec: 386, country: "France" },
      { startSec: 415, country: "Georgia" },
      { startSec: 444, country: "Germany" },
      { startSec: 476, country: "Greece" },
      { startSec: 508, country: "Israel" },
      { startSec: 539, country: "Italy" },
      { startSec: 568, country: "Latvia" },
      { startSec: 597, country: "Lithuania" },
      { startSec: 629, country: "Luxembourg" },
      { startSec: 663, country: "Malta" },
      { startSec: 692, country: "Moldova" },
      { startSec: 721, country: "Montenegro" },
      { startSec: 751, country: "Norway" },
      { startSec: 780, country: "Poland" },
      { startSec: 810, country: "Portugal" },
      { startSec: 838, country: "Romania" },
      { startSec: 869, country: "San Marino" },
      { startSec: 899, country: "Serbia" },
      { startSec: 929, country: "Sweden" },
      { startSec: 959, country: "Switzerland" },
      { startSec: 988, country: "Ukraine" },
      { startSec: 1020, country: "United Kingdom" },
    ],
  },
};

/**
 * The set of ESC 2026 songs. Used as source of truth when creating a new game.
 *
 * Ordered by the official running order for each semi-final.
 * Pre-qualified (non-competing) countries are placed at their actual
 * performance slot within each semi-final.
 *
 * semifinal: 1 or 2
 * semifinalHalf: 1 (first half) or 2 (second half)
 *
 * SF1 first/second half split: after Georgia (Italy interval ends first half).
 * SF2 first/second half split: after Switzerland (France & Austria intervals
 *     are in first half, UK interval is in second half).
 *
 * Source: https://eurovisionworld.com/eurovision/2026/semi-final-1
 *         https://eurovisionworld.com/eurovision/2026/semi-final-2
 *         https://static.eurovisionworld.com/js/voting/181.js (SF1 running order)
 *         https://static.eurovisionworld.com/js/voting/182.js (SF2 running order)
 */
export const ESC_SONGS = [
  // ── Semi-final 1 · First half ──────────────────────────────
  { country: "Moldova", artist: "Satoshi", song: "Viva, Moldova", flag: "🇲🇩", youtubeId: "k340WWX6zHk", durationSec: 174, semifinal: 1, semifinalHalf: 1 },
  { country: "Sweden", artist: "Felicia", song: "My System", flag: "🇸🇪", youtubeId: "W7AZN_me8eA", durationSec: 182, semifinal: 1, semifinalHalf: 1 },
  { country: "Croatia", artist: "Lelek", song: "Andromeda", flag: "🇭🇷", youtubeId: "5JXpBZgiHkY", durationSec: 179, semifinal: 1, semifinalHalf: 1 },
  { country: "Greece", artist: "Akylas", song: "Ferto", flag: "🇬🇷", youtubeId: "VlwIKCFYQyw", durationSec: 180, semifinal: 1, semifinalHalf: 1 },
  { country: "Portugal", artist: "Bandidos do Cante", song: "Rosa", flag: "🇵🇹", youtubeId: "8emG9PghYXg", durationSec: 179, semifinal: 1, semifinalHalf: 1 },
  { country: "Italy", artist: "Sal Da Vinci", song: "Per sempre sì", flag: "🇮🇹", youtubeId: "kA7pS6kaTpg", durationSec: 175, semifinal: 1, semifinalHalf: 1 }, // non-competing
  { country: "Georgia", artist: "Bzikebi", song: "On Replay", flag: "🇬🇪", youtubeId: "coh-lygCINY", durationSec: 187, semifinal: 1, semifinalHalf: 1 },

  // ── Semi-final 1 · Second half ─────────────────────────────
  { country: "Finland", artist: "Linda Lampenius & Pete Parkkonen", song: "Liekinheitin", flag: "🇫🇮", youtubeId: "GS91CAAddZA", durationSec: 180, semifinal: 1, semifinalHalf: 2 },
  { country: "Montenegro", artist: "Tamara Živković", song: "Nova zora", flag: "🇲🇪", youtubeId: "6TfmkUXeKf0", durationSec: 171, semifinal: 1, semifinalHalf: 2 },
  { country: "Germany", artist: "Sarah Engels", song: "Fire", flag: "🇩🇪", youtubeId: "8zjFGH4_Te8", durationSec: 177, semifinal: 1, semifinalHalf: 2 }, // non-competing
  { country: "Estonia", artist: "Vanilla Ninja", song: "Too Epic To Be True", flag: "🇪🇪", youtubeId: "pf-oPWrkXFw", durationSec: 179, semifinal: 1, semifinalHalf: 2 },
  { country: "Israel", artist: "Noam Bettan", song: "Michelle", flag: "🇮🇱", youtubeId: "j2uPlJndByI", durationSec: 180, semifinal: 1, semifinalHalf: 2 },
  { country: "Belgium", artist: "Essyla", song: "Dancing on the Ice", flag: "🇧🇪", youtubeId: "9sfI4g6DWTU", durationSec: 180, semifinal: 1, semifinalHalf: 2 },
  { country: "Lithuania", artist: "Lion Ceccah", song: "Sólo quiero más", flag: "🇱🇹", youtubeId: "mPZMHqSsoeo", durationSec: 182, semifinal: 1, semifinalHalf: 2 },
  { country: "San Marino", artist: "Senhit", song: "Superstar", flag: "🇸🇲", youtubeId: "tC3eHYO38do", durationSec: 174, semifinal: 1, semifinalHalf: 2 },
  { country: "Poland", artist: "Alicja", song: "Pray", flag: "🇵🇱", youtubeId: "bWgdnuww4eY", durationSec: 180, semifinal: 1, semifinalHalf: 2 },
  { country: "Serbia", artist: "Lavina", song: "Kraj mene", flag: "🇷🇸", youtubeId: "931yYfZH2F8", durationSec: 181, semifinal: 1, semifinalHalf: 2 },

  // ── Semi-final 2 · First half ──────────────────────────────
  { country: "Bulgaria", artist: "Dara", song: "Bangaranga", flag: "🇧🇬", youtubeId: "_pkC9J6BPFY", durationSec: 177, semifinal: 2, semifinalHalf: 1 },
  { country: "Azerbaijan", artist: "Jiva", song: "Just Go", flag: "🇦🇿", youtubeId: "iMDBPe25JhM", durationSec: 180, semifinal: 2, semifinalHalf: 1 },
  { country: "Romania", artist: "Alexandra Căpitănescu", song: "Choke Me", flag: "🇷🇴", youtubeId: "f2byUc4L9wo", durationSec: 180, semifinal: 2, semifinalHalf: 1 },
  { country: "Luxembourg", artist: "Eva Marija", song: "Mother Nature", flag: "🇱🇺", youtubeId: "4WA162bl1Fo", durationSec: 178, semifinal: 2, semifinalHalf: 1 },
  { country: "France", artist: "Monroe", song: "Regarde !", flag: "🇫🇷", youtubeId: "f1RDzzLzFBs", durationSec: 177, semifinal: 2, semifinalHalf: 1 }, // non-competing
  { country: "Czechia", artist: "Daniel Žižka", song: "Crossroads", flag: "🇨🇿", youtubeId: "6ea25aRGpLo", durationSec: 180, semifinal: 2, semifinalHalf: 1 },
  { country: "Armenia", artist: "Simón", song: "Paloma Rumba", flag: "🇦🇲", youtubeId: "5EXoK-lgocw", durationSec: 158, semifinal: 2, semifinalHalf: 1 },
  { country: "Austria", artist: "Cosmó", song: "Tanzschein", flag: "🇦🇹", youtubeId: "IPvJbGy5_o0", durationSec: 162, semifinal: 2, semifinalHalf: 1 }, // non-competing
  { country: "Switzerland", artist: "Veronica Fusaro", song: "Alice", flag: "🇨🇭", youtubeId: "PfpYGAzW5dM", durationSec: 180, semifinal: 2, semifinalHalf: 1 },

  // ── Semi-final 2 · Second half ─────────────────────────────
  { country: "Cyprus", artist: "Antigoni", song: "Jalla", flag: "🇨🇾", youtubeId: "TzSs51BiQrE", durationSec: 179, semifinal: 2, semifinalHalf: 2 },
  { country: "Latvia", artist: "Atvara", song: "Ēnā", flag: "🇱🇻", youtubeId: "ylj-kHKEFMY", durationSec: 173, semifinal: 2, semifinalHalf: 2 },
  { country: "United Kingdom", artist: "Look Mum No Computer", song: "Eins, Zwei, Drei", flag: "🇬🇧", youtubeId: "8XR2RvfZ-68", durationSec: 190, semifinal: 2, semifinalHalf: 2 }, // non-competing
  { country: "Denmark", artist: "Søren Torpegaard Lund", song: "Før vi går hjem", flag: "🇩🇰", youtubeId: "vKCsNbrt5yI", durationSec: 174, semifinal: 2, semifinalHalf: 2 },
  { country: "Australia", artist: "Delta Goodrem", song: "Eclipse", flag: "🇦🇺", youtubeId: "KsFY11nOQDo", durationSec: 180, semifinal: 2, semifinalHalf: 2 },
  { country: "Ukraine", artist: "Leléka", song: "Ridnym", flag: "🇺🇦", youtubeId: "qxEeWgjbxx0", durationSec: 178, semifinal: 2, semifinalHalf: 2 },
  { country: "Albania", artist: "Alis", song: "Nân", flag: "🇦🇱", youtubeId: "rZuF1aDDxKE", durationSec: 189, semifinal: 2, semifinalHalf: 2 },
  { country: "Malta", artist: "Aidan", song: "Bella", flag: "🇲🇹", youtubeId: "YA7Ku_P59Dk", durationSec: 177, semifinal: 2, semifinalHalf: 2 },
  { country: "Norway", artist: "Jonas Lovv", song: "Ya ya ya", flag: "🇳🇴", youtubeId: "MasllzWk_bQ", durationSec: 169, semifinal: 2, semifinalHalf: 2 },
] as const;
