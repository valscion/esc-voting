"use client";

import { useSyncedState } from "rwsdk/use-synced-state/client";

export function useActiveSong(gameId: string): string | null {
  const [activeSong] = useSyncedState<string | null>(
    null,
    "activeSong",
    gameId,
  );
  return activeSong;
}
