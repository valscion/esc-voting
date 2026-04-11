/**
 * Data access layer for ESC Voting app.
 *
 * Uses Cloudflare Durable Objects (via rwsdk/db + Kysely) for persistence.
 *
 * Tables:
 *   games   – id, token, closed, created_at
 *   songs   – id, game_id, country, artist, song, flag, runningOrder, youtubeId, durationSec
 *   voters  – id, game_id, name
 *   votes   – id, game_id, voterName, country, rating
 */

import { db } from "@/db";
import type { Game, Song, Voter, Vote, RatingEmoji } from "@/app/shared/constants";
import { ESC_SONGS, ESC_MONTAGE_YOUTUBE_ID, RATING_SCORES } from "@/app/shared/constants";

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
  montageYoutubeId: string = ESC_MONTAGE_YOUTUBE_ID,
): Promise<Game> {
  const gameId = crypto.randomUUID();
  const token = await generateUniqueToken();
  const now = new Date().toISOString();

  await db
    .insertInto("games")
    .values({ id: gameId, token, closed: 0, created_at: now, montageYoutubeId })
    .execute();

  // Insert songs from the constant set, in batches (SQLite variable limit)
  const songValues = ESC_SONGS.map((s, i) => ({
    id: crypto.randomUUID(),
    game_id: gameId,
    country: s.country,
    artist: s.artist,
    song: s.song,
    flag: s.flag,
    runningOrder: i + 1,
    youtubeId: s.youtubeId,
    durationSec: s.durationSec,
  }));
  for (let i = 0; i < songValues.length; i += 10) {
    await db
      .insertInto("songs")
      .values(songValues.slice(i, i + 10))
      .execute();
  }

  // Insert voters
  for (const name of voterNames) {
    await db
      .insertInto("voters")
      .values({ id: crypto.randomUUID(), game_id: gameId, name })
      .execute();
  }

  return { id: gameId, token, closed: 0, created_at: now, montageYoutubeId };
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
    montageYoutubeId: row.montageYoutubeId,
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
  await db.deleteFrom("songs").where("game_id", "=", gameId).execute();
  await db.deleteFrom("games").where("id", "=", gameId).execute();
}

// --- Game-scoped queries ---

export async function getSongs(gameId: string): Promise<Song[]> {
  const rows = await db
    .selectFrom("songs")
    .selectAll()
    .where("game_id", "=", gameId)
    .orderBy("runningOrder", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.id,
    country: r.country,
    artist: r.artist,
    song: r.song,
    flag: r.flag,
    runningOrder: r.runningOrder,
    youtubeId: r.youtubeId,
    durationSec: r.durationSec,
  }));
}

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
  voteBreakdown: { voter: string; emoji: RatingEmoji; score: number }[];
}

/**
 * Compute results grouped into sections by total score, sorted ascending
 * (worst first). Each section is a group of songs sharing the same total score.
 */
export async function getResultsByScore(
  gameId: string,
): Promise<{ score: number; songs: SongResult[] }[]> {
  const [songs, votes] = await Promise.all([
    getSongs(gameId),
    getAllVotes(gameId),
  ]);

  // Build a map of country → votes
  const votesByCountry = new Map<string, Vote[]>();
  for (const v of votes) {
    const list = votesByCountry.get(v.country) ?? [];
    list.push(v);
    votesByCountry.set(v.country, list);
  }

  // Calculate score for each song
  const songResults: SongResult[] = songs.map((song) => {
    const songVotes = votesByCountry.get(song.country) ?? [];
    const breakdown = songVotes.map((v) => ({
      voter: v.voter,
      emoji: v.rating,
      score: RATING_SCORES[v.rating] ?? 0,
    }));
    const totalScore = breakdown.reduce((sum, b) => sum + b.score, 0);
    return {
      country: song.country,
      artist: song.artist,
      song: song.song,
      flag: song.flag,
      totalScore,
      voteBreakdown: breakdown,
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
