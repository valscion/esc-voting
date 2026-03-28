/**
 * Data access layer for ESC Voting app.
 *
 * Uses Cloudflare Durable Objects (via rwsdk/db + Kysely) for persistence.
 *
 * Tables:
 *   songs   – id, country, artist, song, flag, runningOrder
 *   voters  – id, name
 *   votes   – id, voterName, country, rating
 */

import { db } from "@/db";
import type { Song, Voter, Vote, RatingEmoji } from "@/app/shared/constants";

export type { Song, Voter, Vote, RatingEmoji };
export { RATINGS } from "@/app/shared/constants";

export async function getSongs(): Promise<Song[]> {
  const rows = await db
    .selectFrom("songs")
    .selectAll()
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

export async function getVoters(): Promise<Voter[]> {
  const rows = await db
    .selectFrom("voters")
    .selectAll()
    .orderBy("name", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
  }));
}

export async function getVotesForVoter(voterName: string): Promise<Vote[]> {
  const rows = await db
    .selectFrom("votes")
    .selectAll()
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
  voter: string,
  country: string,
  rating: RatingEmoji,
): Promise<void> {
  const existing = await db
    .selectFrom("votes")
    .selectAll()
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
        voterName: voter,
        country,
        rating,
      })
      .execute();
  }
}

export async function getAllVotes(): Promise<Vote[]> {
  const rows = await db.selectFrom("votes").selectAll().execute();
  return rows.map((r) => ({
    id: r.id,
    voter: r.voterName,
    country: r.country,
    rating: r.rating as RatingEmoji,
  }));
}
