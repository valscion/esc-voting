"use server";

import { serverAction } from "rwsdk/worker";
import {
  createGame as createGameData,
  closeGame as closeGameData,
  deleteGame as deleteGameData,
  getGameByToken,
  upsertVote,
  type RatingEmoji,
} from "@/app/data";

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
