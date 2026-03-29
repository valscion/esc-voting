/**
 * Data access layer for ESC Voting app.
 *
 * Uses Cloudflare Durable Objects (via rwsdk/db + Kysely) for persistence.
 *
 * Tables:
 *   games   – id, token, closed, created_at
 *   songs   – id, game_id, country, artist, song, flag, runningOrder
 *   voters  – id, game_id, name
 *   votes   – id, game_id, voterName, country, rating
 */

import { db } from "@/db";
import type { Game, Song, Voter, Vote, RatingEmoji } from "@/app/shared/constants";
import { ESC_SONGS } from "@/app/shared/constants";

export type { Game, Song, Voter, Vote, RatingEmoji };
export { RATINGS } from "@/app/shared/constants";

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
): Promise<Game> {
  const gameId = crypto.randomUUID();
  const token = await generateUniqueToken();
  const now = new Date().toISOString();

  await db
    .insertInto("games")
    .values({ id: gameId, token, closed: 0, created_at: now })
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

  return { id: gameId, token, closed: 0, created_at: now };
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
