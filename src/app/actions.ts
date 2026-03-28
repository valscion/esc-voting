"use server";

import { serverAction } from "rwsdk/worker";
import { upsertVote, type RatingEmoji } from "@/app/airtable";
import { getEnv } from "@/app/env-store";

export const submitVote = serverAction(
  async (voter: string, country: string, rating: RatingEmoji): Promise<void> => {
    const env = getEnv();
    await upsertVote(env, voter, country, rating);
  },
);
