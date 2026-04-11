"use client";

import { useSyncedState } from "rwsdk/use-synced-state/client";

interface SongInfo {
  country: string;
  artist: string;
  song: string;
  flag: string;
}

interface DashboardControlsProps {
  gameId: string;
  songs: SongInfo[];
}

export function DashboardControls({ gameId, songs }: DashboardControlsProps) {
  const [activeSong, setActiveSong] = useSyncedState<string | null>(
    null,
    "activeSong",
    gameId,
  );

  return (
    <div className="mt-8">
      {activeSong && (
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-indigo-950/40 px-5 py-3 text-sm font-medium text-indigo-300 ring-1 ring-indigo-800">
          <span>
            🎵 Now playing:{" "}
            {(() => {
              const song = songs.find((s) => s.country === activeSong);
              return song
                ? `${song.flag} ${song.country} – ${song.artist}`
                : activeSong;
            })()}
          </span>
          <button
            type="button"
            onClick={() => setActiveSong(null)}
            className="ml-4 rounded-xl border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-red-500 hover:text-red-400"
          >
            ⏹ Stop
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {songs.map((song) => {
          const isActive = activeSong === song.country;
          return (
            <li key={song.country}>
              <button
                type="button"
                onClick={() =>
                  setActiveSong(isActive ? null : song.country)
                }
                data-song-country={song.country}
                className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                  isActive
                    ? "border-indigo-500 bg-indigo-950/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                    : "border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/80"
                }`}
                aria-pressed={isActive}
              >
                <span className="text-2xl">{isActive ? "⏸" : "▶️"}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-100">
                    {song.flag} {song.country}
                  </div>
                  <div className="text-sm text-gray-500">
                    {song.artist} – {song.song}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
