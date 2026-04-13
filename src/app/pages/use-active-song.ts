"use client";

import { useSyncedState } from "./use-reconnecting-synced-state";

export function useActiveSong(gameId: string): string | null {
  const [activeSong] = useSyncedState<string | null>(
    null,
    "activeSong",
    gameId,
  );
  return activeSong;
}
