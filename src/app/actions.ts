"use server";

import { serverAction } from "rwsdk/worker";
import { upsertVote, type RatingEmoji } from "@/app/data";

export const submitVote = serverAction(
  async (voter: string, country: string, rating: RatingEmoji): Promise<void> => {
    await upsertVote(voter, country, rating);
  },
);
