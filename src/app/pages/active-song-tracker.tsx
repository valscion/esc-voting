"use client";

import { useSyncedState } from "rwsdk/use-synced-state/client";

interface SongInfo {
  country: string;
  artist: string;
  song: string;
  flag: string;
}

interface ActiveSongTrackerProps {
  gameId: string;
  songs: SongInfo[];
}

export function ActiveSongTracker({ gameId, songs }: ActiveSongTrackerProps) {
  const [activeSong] = useSyncedState<string | null>(
    null,
    "activeSong",
    gameId,
  );

  const activeInfo = activeSong
    ? songs.find((s) => s.country === activeSong)
    : null;

  return (
    <>
      {activeSong && (
        <style>{`[data-song-list] > li[data-country="${CSS.escape(activeSong)}"] {
  position: relative;
  z-index: 0;
}
[data-song-list] > li[data-country="${CSS.escape(activeSong)}"]::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(99,102,241,0.35), rgba(168,85,247,0.25), rgba(99,102,241,0.15));
  opacity: 1;
  animation: active-song-pulse 2s ease-in-out infinite alternate;
}
@keyframes active-song-pulse {
  from { opacity: 0.7; }
  to { opacity: 1; }
}`}</style>
      )}
      <div
        aria-live="polite"
        data-testid="now-playing"
        className="sr-only"
      >
        {activeInfo
          ? `Now playing: ${activeInfo.flag} ${activeInfo.country} – ${activeInfo.artist} – ${activeInfo.song}`
          : ""}
      </div>
    </>
  );
}
