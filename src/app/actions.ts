"use server";

import { serverAction } from "rwsdk/worker";
import {
  createGame as createGameData,
  closeGame as closeGameData,
  deleteGame as deleteGameData,
  getGameByToken,
  upsertVote,
  upsertNote,
  importGame,
  type RatingEmoji,
  type GameImportData,
} from "@/app/data";
import { MAX_NOTE_LENGTH } from "@/app/shared/constants";

export const createGame = serverAction(
  async (voterNames: string[]): Promise<Response> => {
    const game = await createGameData(voterNames);
    return new Response(null, {
      status: 302,
      headers: { Location: `/${game.token}` },
    });
  },
);

export const submitVote = serverAction(
  async (
    gameId: string,
    voter: string,
    country: string,
    rating: RatingEmoji,
  ): Promise<void> => {
    await upsertVote(gameId, voter, country, rating);
  },
);

export const closeGame = serverAction(
  async (token: string): Promise<void> => {
    const game = await getGameByToken(token);
    if (!game) throw new Error("Game not found");
    await closeGameData(game.id);
  },
);

export const deleteGame = serverAction(
  async (token: string): Promise<void> => {
    const game = await getGameByToken(token);
    if (!game) throw new Error("Game not found");
    await deleteGameData(game.id);
  },
);

export const submitNote = serverAction(
  async (
    gameId: string,
    voter: string,
    country: string,
    note: string,
  ): Promise<void> => {
    // Enforce tweet-sized max
    const trimmed = note.slice(0, MAX_NOTE_LENGTH);
    await upsertNote(gameId, voter, country, trimmed);
  },
);

export const importGameAction = serverAction(
  async (jsonString: string, includeRatings: boolean): Promise<Response> => {
    let data: GameImportData;
    try {
      data = JSON.parse(jsonString) as GameImportData;
    } catch {
      throw new Error("Invalid JSON data");
    }

    // Basic validation
    if (!data.escYear || typeof data.escYear !== "number") {
      throw new Error("Import must include a numeric 'escYear' field");
    }
    if (
      !Array.isArray(data.voters) ||
      data.voters.length === 0 ||
      !data.voters.every(
        (v: unknown) => typeof v === "string" && (v as string).trim().length > 0,
      )
    ) {
      throw new Error("Import must include a 'voters' array with at least one non-empty name");
    }

    const game = await importGame(data, includeRatings);
    return new Response(null, {
      status: 302,
      headers: { Location: `/${game.token}` },
    });
  },
);
