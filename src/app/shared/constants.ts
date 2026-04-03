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

export interface Game {
  id: string;
  token: string;
  closed: number;
  created_at: string;
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
 * The set of ESC 2026 songs. Used as source of truth when creating a new game.
 *
 * Ordered by the official running order for each semi-final.
 * Pre-qualified (non-competing) countries are placed at their actual
 * performance slot within each semi-final.
 * Source: https://eurovisionworld.com/eurovision/2026/semi-final-1
 *         https://eurovisionworld.com/eurovision/2026/semi-final-2
 */
export const ESC_SONGS = [
  // ── Semi-final 1 ───────────────────────────────────────────
  { country: "Moldova", artist: "Satoshi", song: "Viva, Moldova", flag: "🇲🇩", youtubeId: "k340WWX6zHk", durationSec: 174 },
  { country: "Sweden", artist: "Felicia", song: "My System", flag: "🇸🇪", youtubeId: "W7AZN_me8eA", durationSec: 182 },
  { country: "Croatia", artist: "Lelek", song: "Andromeda", flag: "🇭🇷", youtubeId: "5JXpBZgiHkY", durationSec: 179 },
  { country: "Greece", artist: "Akylas", song: "Ferto", flag: "🇬🇷", youtubeId: "VlwIKCFYQyw", durationSec: 180 },
  { country: "Portugal", artist: "Bandidos do Cante", song: "Rosa", flag: "🇵🇹", youtubeId: "8emG9PghYXg", durationSec: 179 },
  { country: "Italy", artist: "Sal Da Vinci", song: "Per sempre sì", flag: "🇮🇹", youtubeId: "kA7pS6kaTpg", durationSec: 175 }, // non-competing
  { country: "Georgia", artist: "Bzikebi", song: "On Replay", flag: "🇬🇪", youtubeId: "coh-lygCINY", durationSec: 187 },
  { country: "Finland", artist: "Linda Lampenius & Pete Parkkonen", song: "Liekinheitin", flag: "🇫🇮", youtubeId: "GS91CAAddZA", durationSec: 180 },
  { country: "Montenegro", artist: "Tamara Živković", song: "Nova zora", flag: "🇲🇪", youtubeId: "6TfmkUXeKf0", durationSec: 171 },
  { country: "Germany", artist: "Sarah Engels", song: "Fire", flag: "🇩🇪", youtubeId: "8zjFGH4_Te8", durationSec: 177 }, // non-competing
  { country: "Estonia", artist: "Vanilla Ninja", song: "Too Epic To Be True", flag: "🇪🇪", youtubeId: "pf-oPWrkXFw", durationSec: 179 },
  { country: "Israel", artist: "Noam Bettan", song: "Michelle", flag: "🇮🇱", youtubeId: "j2uPlJndByI", durationSec: 180 },
  { country: "Belgium", artist: "Essyla", song: "Dancing on the Ice", flag: "🇧🇪", youtubeId: "9sfI4g6DWTU", durationSec: 180 },
  { country: "Lithuania", artist: "Lion Ceccah", song: "Sólo quiero más", flag: "🇱🇹", youtubeId: "mPZMHqSsoeo", durationSec: 182 },
  { country: "San Marino", artist: "Senhit", song: "Superstar", flag: "🇸🇲", youtubeId: "tC3eHYO38do", durationSec: 174 },
  { country: "Poland", artist: "Alicja", song: "Pray", flag: "🇵🇱", youtubeId: "bWgdnuww4eY", durationSec: 180 },
  { country: "Serbia", artist: "Lavina", song: "Kraj mene", flag: "🇷🇸", youtubeId: "931yYfZH2F8", durationSec: 181 },

  // ── Semi-final 2 ───────────────────────────────────────────
  { country: "Bulgaria", artist: "Dara", song: "Bangaranga", flag: "🇧🇬", youtubeId: "_pkC9J6BPFY", durationSec: 177 },
  { country: "Azerbaijan", artist: "Jiva", song: "Just Go", flag: "🇦🇿", youtubeId: "iMDBPe25JhM", durationSec: 180 },
  { country: "Romania", artist: "Alexandra Căpitănescu", song: "Choke Me", flag: "🇷🇴", youtubeId: "f2byUc4L9wo", durationSec: 180 },
  { country: "Luxembourg", artist: "Eva Marija", song: "Mother Nature", flag: "🇱🇺", youtubeId: "4WA162bl1Fo", durationSec: 178 },
  { country: "France", artist: "Monroe", song: "Regarde !", flag: "🇫🇷", youtubeId: "f1RDzzLzFBs", durationSec: 177 }, // non-competing
  { country: "Czechia", artist: "Daniel Žižka", song: "Crossroads", flag: "🇨🇿", youtubeId: "6ea25aRGpLo", durationSec: 180 },
  { country: "Armenia", artist: "Simón", song: "Paloma Rumba", flag: "🇦🇲", youtubeId: "5EXoK-lgocw", durationSec: 158 },
  { country: "Austria", artist: "Cosmó", song: "Tanzschein", flag: "🇦🇹", youtubeId: "IPvJbGy5_o0", durationSec: 162 }, // non-competing
  { country: "Switzerland", artist: "Veronica Fusaro", song: "Alice", flag: "🇨🇭", youtubeId: "PfpYGAzW5dM", durationSec: 180 },
  { country: "Cyprus", artist: "Antigoni", song: "Jalla", flag: "🇨🇾", youtubeId: "TzSs51BiQrE", durationSec: 179 },
  { country: "Latvia", artist: "Atvara", song: "Ēnā", flag: "🇱🇻", youtubeId: "ylj-kHKEFMY", durationSec: 173 },
  { country: "United Kingdom", artist: "Look Mum No Computer", song: "Eins, Zwei, Drei", flag: "🇬🇧", youtubeId: "8XR2RvfZ-68", durationSec: 190 }, // non-competing
  { country: "Denmark", artist: "Søren Torpegaard Lund", song: "Før vi går hjem", flag: "🇩🇰", youtubeId: "vKCsNbrt5yI", durationSec: 174 },
  { country: "Australia", artist: "Delta Goodrem", song: "Eclipse", flag: "🇦🇺", youtubeId: "KsFY11nOQDo", durationSec: 180 },
  { country: "Ukraine", artist: "Leléka", song: "Ridnym", flag: "🇺🇦", youtubeId: "qxEeWgjbxx0", durationSec: 178 },
  { country: "Albania", artist: "Alis", song: "Nân", flag: "🇦🇱", youtubeId: "rZuF1aDDxKE", durationSec: 189 },
  { country: "Malta", artist: "Aidan", song: "Bella", flag: "🇲🇹", youtubeId: "YA7Ku_P59Dk", durationSec: 177 },
  { country: "Norway", artist: "Jonas Lovv", song: "Ya ya ya", flag: "🇳🇴", youtubeId: "MasllzWk_bQ", durationSec: 169 },
] as const;
