/**
 * Data access layer for ESC Voting app.
 *
 * Uses Cloudflare Durable Objects (via rwsdk/db + Kysely) for persistence.
 *
 * Tables:
 *   games   – id, token, closed, created_at, escYear
 *   voters  – id, game_id, name
 *   votes   – id, game_id, voterName, country (3-letter ISO code), rating
 *
 * Song data is served from constants keyed by ESC year (no songs table).
 */

import { db } from "@/db";
import type { Game, Song, Voter, Vote, RatingEmoji } from "@/app/shared/constants";
import { getSongsForYear, DEFAULT_ESC_YEAR, RATING_SCORES } from "@/app/shared/constants";
import { computeMedianScore, scoreToEmoji } from "@/app/shared/scoring";

export type { Game, Song, Voter, Vote, RatingEmoji };
export { RATINGS, RATING_SCORES } from "@/app/shared/constants";

// --- Token generation ---

const ADJECTIVES = [
  "brave", "happy", "swift", "calm", "bold", "cool", "keen", "warm",
  "wild", "free", "fair", "wise", "glad", "kind", "pure", "rare",
  "vast", "cozy", "epic", "zany", "rosy", "lush", "trim", "snug",
];

const NOUNS = [
  "fox", "owl", "bear", "wolf", "hawk", "deer", "dove", "swan",
  "lynx", "puma", "crow", "wren", "hare", "seal", "frog", "moth",
  "lark", "colt", "bass", "newt", "mink", "orca", "ibis", "wasp",
];

export function generateToken(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}

async function generateUniqueToken(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const token = generateToken();
    const existing = await db
      .selectFrom("games")
      .select("id")
      .where("token", "=", token)
      .executeTakeFirst();
    if (!existing) return token;
  }
  // Fallback: append random suffix
  return `${generateToken()}-${Math.floor(Math.random() * 10000)}`;
}

// --- Game CRUD ---

export async function createGame(
  voterNames: string[],
  escYear: number = DEFAULT_ESC_YEAR,
): Promise<Game> {
  const gameId = crypto.randomUUID();
  const token = await generateUniqueToken();
  const now = new Date().toISOString();

  await db
    .insertInto("games")
    .values({ id: gameId, token, closed: 0, created_at: now, escYear })
    .execute();

  // Insert voters
  for (const name of voterNames) {
    await db
      .insertInto("voters")
      .values({ id: crypto.randomUUID(), game_id: gameId, name })
      .execute();
  }

  return { id: gameId, token, closed: 0, created_at: now, escYear };
}

export async function getGameByToken(token: string): Promise<Game | null> {
  const row = await db
    .selectFrom("games")
    .selectAll()
    .where("token", "=", token)
    .executeTakeFirst();
  if (!row) return null;
  return {
    id: row.id,
    token: row.token,
    closed: row.closed,
    created_at: row.created_at,
    escYear: row.escYear,
  };
}

export async function closeGame(gameId: string): Promise<void> {
  await db
    .updateTable("games")
    .set({ closed: 1 })
    .where("id", "=", gameId)
    .execute();
}

export async function deleteGame(gameId: string): Promise<void> {
  await db.deleteFrom("votes").where("game_id", "=", gameId).execute();
  await db.deleteFrom("voters").where("game_id", "=", gameId).execute();
  await db.deleteFrom("games").where("id", "=", gameId).execute();
}

// --- Game-scoped queries ---

export async function getVoters(gameId: string): Promise<Voter[]> {
  const rows = await db
    .selectFrom("voters")
    .selectAll()
    .where("game_id", "=", gameId)
    .orderBy("name", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
  }));
}

export async function getVotesForVoter(
  gameId: string,
  voterName: string,
): Promise<Vote[]> {
  const rows = await db
    .selectFrom("votes")
    .selectAll()
    .where("game_id", "=", gameId)
    .where("voterName", "=", voterName)
    .execute();
  return rows.map((r) => ({
    id: r.id,
    voter: r.voterName,
    country: r.country,
    rating: r.rating as RatingEmoji,
  }));
}

export async function upsertVote(
  gameId: string,
  voter: string,
  country: string,
  rating: RatingEmoji,
): Promise<void> {
  const existing = await db
    .selectFrom("votes")
    .selectAll()
    .where("game_id", "=", gameId)
    .where("voterName", "=", voter)
    .where("country", "=", country)
    .executeTakeFirst();

  if (existing) {
    await db
      .updateTable("votes")
      .set({ rating })
      .where("id", "=", existing.id)
      .execute();
  } else {
    await db
      .insertInto("votes")
      .values({
        id: crypto.randomUUID(),
        game_id: gameId,
        voterName: voter,
        country,
        rating,
      })
      .execute();
  }
}

export async function getAllVotes(gameId: string): Promise<Vote[]> {
  const rows = await db
    .selectFrom("votes")
    .selectAll()
    .where("game_id", "=", gameId)
    .execute();
  return rows.map((r) => ({
    id: r.id,
    voter: r.voterName,
    country: r.country,
    rating: r.rating as RatingEmoji,
  }));
}

// --- Results ---

export interface SongResult {
  country: string;
  artist: string;
  song: string;
  flag: string;
  totalScore: number;
  voteBreakdown: { voter: string; emoji: RatingEmoji; score: number; assumed: boolean }[];
}

/**
 * Compute assumed votes for songs where a given voter didn't cast a vote.
 *
 * For each unrated song, the assumed score is the median of all scores given
 * by other voters, rounded down to the nearest emoji score.
 *
 * Returns a record mapping country code → assumed RatingEmoji. Only includes
 * entries for songs that have at least one real vote from another voter.
 */
export async function getAssumedVotesForVoter(
  gameId: string,
  voterName: string,
  escYear: number,
): Promise<Record<string, RatingEmoji>> {
  const songs = getSongsForYear(escYear);
  const [allVotes, voterVotes] = await Promise.all([
    getAllVotes(gameId),
    getVotesForVoter(gameId, voterName),
  ]);

  // Country codes this voter already rated
  const ratedCodes = new Set(voterVotes.map((v) => v.country));

  // Build a map of country code → all votes
  const votesByCode = new Map<string, Vote[]>();
  for (const v of allVotes) {
    const list = votesByCode.get(v.country) ?? [];
    list.push(v);
    votesByCode.set(v.country, list);
  }

  const assumed: Record<string, RatingEmoji> = {};
  for (const song of songs) {
    if (ratedCodes.has(song.code)) continue;

    const songVotes = votesByCode.get(song.code) ?? [];
    if (songVotes.length === 0) continue;

    const scores = songVotes.map((v) => RATING_SCORES[v.rating] ?? 0);
    const medianScore = computeMedianScore(scores);
    assumed[song.code] = scoreToEmoji(medianScore);
  }

  return assumed;
}

/**
 * Compute results grouped into sections by total score, sorted ascending
 * (worst first). Each section is a group of songs sharing the same total score.
 *
 * When not all voters have voted for a song, assumed votes are computed using
 * the median of the actual scores (rounded down to the nearest emoji score).
 */
export async function getResultsByScore(
  gameId: string,
  escYear: number,
): Promise<{ score: number; songs: SongResult[] }[]> {
  const songs = getSongsForYear(escYear);
  const [votes, voters] = await Promise.all([
    getAllVotes(gameId),
    getVoters(gameId),
  ]);

  const voterNames = voters.map((v) => v.name);

  // Build a map of country code → votes
  const votesByCode = new Map<string, Vote[]>();
  for (const v of votes) {
    const list = votesByCode.get(v.country) ?? [];
    list.push(v);
    votesByCode.set(v.country, list);
  }

  // Calculate score for each song
  const songResults: SongResult[] = songs.map((song) => {
    const songVotes = votesByCode.get(song.code) ?? [];
    const actualBreakdown = songVotes.map((v) => ({
      voter: v.voter,
      emoji: v.rating,
      score: RATING_SCORES[v.rating] ?? 0,
      assumed: false,
    }));

    // Find voters who didn't vote for this song
    const votedVoters = new Set(songVotes.map((v) => v.voter));
    const missingVoters = voterNames.filter((name) => !votedVoters.has(name));

    // Compute assumed votes for missing voters
    const assumedBreakdown: typeof actualBreakdown = [];
    if (missingVoters.length > 0 && actualBreakdown.length > 0) {
      const actualScores = actualBreakdown.map((b) => b.score);
      const medianScore = computeMedianScore(actualScores);
      const assumedEmoji = scoreToEmoji(medianScore);
      const assumedScore = RATING_SCORES[assumedEmoji];

      for (const voter of missingVoters) {
        assumedBreakdown.push({
          voter,
          emoji: assumedEmoji,
          score: assumedScore,
          assumed: true,
        });
      }
    }

    const allBreakdown = [...actualBreakdown, ...assumedBreakdown];
    const totalScore = allBreakdown.reduce((sum, b) => sum + b.score, 0);

    return {
      country: song.country,
      artist: song.artist,
      song: song.song,
      flag: song.flag,
      totalScore,
      voteBreakdown: allBreakdown,
    };
  });

  // Group by score
  const groupMap = new Map<number, SongResult[]>();
  for (const result of songResults) {
    const list = groupMap.get(result.totalScore) ?? [];
    list.push(result);
    groupMap.set(result.totalScore, list);
  }

  // Sort groups ascending (lowest score first → revealed first)
  const groups = Array.from(groupMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([score, songs]) => ({ score, songs }));

  return groups;
}
