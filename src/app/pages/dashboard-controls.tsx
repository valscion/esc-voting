"use client";

import { useState, useMemo } from "react";
import { useSyncedState } from "rwsdk/use-synced-state/client";
import { ESC_MONTAGE_DATA, sortSongsByMontageOrder, type CountryCode } from "@/app/shared/constants";

interface SongInfo {
  code: CountryCode;
  country: string;
  artist: string;
  song: string;
  flag: string;
  youtubeId: string;
  durationSec: number;
  semifinal: number;
  semifinalHalf: number;
}

interface TVPlayback {
  command: "play" | "pause" | "seek";
  seekTo?: number;
}

interface TVProgress {
  playedFraction: number;
  playedSeconds: number;
  loadedFraction: number;
}

interface DashboardControlsProps {
  gameId: string;
  songs: SongInfo[];
  escYear: number;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Human-readable label for each semifinal group. */
function groupLabel(semifinal: number, half: number): string {
  return `Semi-final ${semifinal} · ${half === 1 ? "First" : "Second"} half`;
}

/** Build an ordered list of groups, each containing its songs. */
function groupSongs(songs: SongInfo[]) {
  const groups: { key: string; label: string; songs: SongInfo[] }[] = [];
  let currentKey = "";

  for (const song of songs) {
    const key = `${song.semifinal}-${song.semifinalHalf}`;
    if (key !== currentKey) {
      currentKey = key;
      groups.push({
        key,
        label: groupLabel(song.semifinal, song.semifinalHalf),
        songs: [],
      });
    }
    groups[groups.length - 1].songs.push(song);
  }

  return groups;
}

export function DashboardControls({ gameId, songs, escYear }: DashboardControlsProps) {
  const [activeSong, setActiveSong] = useSyncedState<string | null>(
    null,
    "activeSong",
    gameId,
  );
  const [, setTvPlayback] = useSyncedState<TVPlayback | null>(
    null,
    "tvPlayback",
    gameId,
  );
  const [tvMode, setTvMode] = useSyncedState<"song" | "montage" | null>(
    null,
    "tvMode",
    gameId,
  );
  const [tvProgress] = useSyncedState<TVProgress | null>(
    null,
    "tvProgress",
    gameId,
  );

  const [isPaused, setIsPaused] = useState(false);
  const [montageOrder, setMontageOrder] = useState(false);
  const montageData = ESC_MONTAGE_DATA[escYear];

  const displaySongs = useMemo(
    () => (montageOrder ? sortSongsByMontageOrder(songs, escYear) : songs),
    [songs, montageOrder, escYear],
  );

  const handleSongClick = (country: string) => {
    const isActive = activeSong === country;
    if (isActive) {
      setActiveSong(null);
      setTvMode(null);
      setIsPaused(false);
    } else {
      setActiveSong(country);
      setTvMode("song");
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    setActiveSong(null);
    setTvMode(null);
    setIsPaused(false);
  };

  const handlePlayPause = () => {
    if (isPaused) {
      setTvPlayback({ command: "play" });
      setIsPaused(false);
    } else {
      setTvPlayback({ command: "pause" });
      setIsPaused(true);
    }
  };

  const handleSkip = () => {
    if (!activeSong) return;
    const currentIndex = displaySongs.findIndex((s) => s.country === activeSong);
    if (currentIndex >= 0 && currentIndex < displaySongs.length - 1) {
      setActiveSong(displaySongs[currentIndex + 1].country);
      setTvMode("song");
      setIsPaused(false);
    } else {
      setActiveSong(null);
      setTvMode(null);
      setIsPaused(false);
    }
  };

  const handleMontageToggle = () => {
    if (tvMode === "montage") {
      setActiveSong(null);
      setTvMode(null);
      setIsPaused(false);
    } else {
      setTvMode("montage");
      setTvPlayback({ command: "play" });
      setIsPaused(false);
    }
  };

  /**
   * Seek the montage to the previous song's timestamp.
   * Finds the entry before the current playback position and seeks there.
   */
  const handleMontagePrev = () => {
    if (!montageData || !tvProgress) return;
    const currentSec = tvProgress.playedSeconds;
    const timestamps = montageData.timestamps;

    // Find the last timestamp that is at least 3 seconds before current position.
    // The 3s threshold avoids getting stuck at the start of the current song.
    let prevIdx = -1;
    for (let i = timestamps.length - 1; i >= 0; i--) {
      if (timestamps[i].startSec < currentSec - 3) {
        prevIdx = i;
        break;
      }
    }
    if (prevIdx >= 0) {
      setTvPlayback({ command: "seek", seekTo: timestamps[prevIdx].startSec });
      setIsPaused(false);
    } else {
      // Already at the beginning — seek to 0
      setTvPlayback({ command: "seek", seekTo: 0 });
      setIsPaused(false);
    }
  };

  /**
   * Seek the montage to the next song's timestamp.
   * Finds the entry after the current playback position and seeks there.
   */
  const handleMontageNext = () => {
    if (!montageData || !tvProgress) return;
    const currentSec = tvProgress.playedSeconds;
    const timestamps = montageData.timestamps;

    // Find the first timestamp after the current position
    const nextEntry = timestamps.find((t) => t.startSec > currentSec + 1);
    if (nextEntry) {
      setTvPlayback({ command: "seek", seekTo: nextEntry.startSec });
      setIsPaused(false);
    }
  };

  const progressPercent = tvProgress
    ? Math.round(tvProgress.playedFraction * 100)
    : 0;

  const groups = montageOrder ? null : groupSongs(displaySongs);

  return (
    <div className="mt-8">
      {/* Montage controls */}
      {montageData && (
        <div className="mb-6 flex items-center gap-2">
          <button
            type="button"
            onClick={handleMontageToggle}
            className={`rounded-2xl border px-5 py-3 text-sm font-medium transition-all ${
              tvMode === "montage"
                ? "border-amber-600 bg-amber-950/40 text-amber-300 hover:border-red-500 hover:text-red-400"
                : "border-gray-700 bg-gray-900 text-gray-400 hover:border-amber-600 hover:text-amber-300"
            }`}
          >
            {tvMode === "montage" ? "⏹ Stop Montage" : "▶️ Play Montage"}
          </button>
          {tvMode === "montage" && (
            <>
              <button
                type="button"
                onClick={handleMontagePrev}
                className="rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-medium text-gray-400 transition-all hover:border-amber-600 hover:text-amber-300"
              >
                ⏮ Prev
              </button>
              <button
                type="button"
                onClick={handleMontageNext}
                className="rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-medium text-gray-400 transition-all hover:border-amber-600 hover:text-amber-300"
              >
                Next ⏭
              </button>
            </>
          )}
        </div>
      )}

      {/* Now playing bar */}
      <div
        className={`mb-6 rounded-2xl px-5 py-3 text-sm font-medium ring-1 ${
          activeSong || tvMode === "montage"
            ? "bg-indigo-950/40 text-indigo-300 ring-indigo-800"
            : "bg-gray-900/40 text-gray-600 ring-gray-800"
        }`}
      >
        {activeSong ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
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
                onClick={handleStop}
                className="ml-4 rounded-xl border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-red-500 hover:text-red-400"
              >
                ⏹ Stop
              </button>
            </div>
            {/* TV playback controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlayPause}
                className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-400 transition-colors hover:border-indigo-500 hover:text-indigo-400"
              >
                {isPaused ? "▶️ Play" : "⏸ Pause"}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-400 transition-colors hover:border-indigo-500 hover:text-indigo-400"
              >
                ⏭ Skip
              </button>
              {tvProgress && (
                <div className="ml-2 flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {progressPercent}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : tvMode === "montage" ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>🎬 Montage playing</span>
              <button
                type="button"
                onClick={handleStop}
                className="ml-4 rounded-xl border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-red-500 hover:text-red-400"
              >
                ⏹ Stop
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlayPause}
                className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-400 transition-colors hover:border-indigo-500 hover:text-indigo-400"
              >
                {isPaused ? "▶️ Play" : "⏸ Pause"}
              </button>
              {tvProgress && (
                <div className="ml-2 flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {progressPercent}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <span>🎵 No song currently playing</span>
        )}
      </div>

      {/* Sort order toggle */}
      {montageData && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setMontageOrder((prev) => !prev)}
            className={`rounded-2xl border px-4 py-2 text-sm font-medium transition-all ${
              montageOrder
                ? "border-amber-600 bg-amber-950/40 text-amber-300 hover:border-amber-500"
                : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-300"
            }`}
          >
            {montageOrder ? "🎬 Montage order" : "📋 Semi-final order"}
          </button>
        </div>
      )}

      {/* Song grid */}
      {montageOrder ? (
        <ul
          className="grid gap-2"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          }}
        >
          {displaySongs.map((song) => {
            const isActive = activeSong === song.country;
            return (
              <li key={song.country}>
                <button
                  type="button"
                  onClick={() => handleSongClick(song.country)}
                  data-song-country={song.country}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                    isActive
                      ? "border-indigo-500 bg-indigo-950/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                      : "border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/80"
                  }`}
                  aria-pressed={isActive}
                  aria-label={
                    isActive
                      ? `Stop playing ${song.country}`
                      : `Play ${song.country}`
                  }
                >
                  <span className="text-xl" aria-hidden="true">{isActive ? "⏸" : "▶️"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-100 text-sm">
                      {song.flag} {song.country}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {song.artist} – {song.song}
                      {song.durationSec > 0 && (
                        <span className="ml-1 text-gray-600">
                          ({formatDuration(song.durationSec)})
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        /* Song grid grouped by semifinal halves */
        groups!.map((group, groupIdx) => (
          <div key={group.key}>
            {/* Group separator */}
            {groupIdx > 0 && (
              <div className="my-4 border-t-2 border-dashed border-gray-700/60" />
            )}
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {group.label}
            </h2>

            <ul
              className="grid gap-2"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              }}
            >
              {group.songs.map((song) => {
                const isActive = activeSong === song.country;
                return (
                  <li key={song.country}>
                    <button
                      type="button"
                      onClick={() => handleSongClick(song.country)}
                      data-song-country={song.country}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? "border-indigo-500 bg-indigo-950/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                          : "border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/80"
                      }`}
                      aria-pressed={isActive}
                      aria-label={
                        isActive
                          ? `Stop playing ${song.country}`
                          : `Play ${song.country}`
                      }
                    >
                      <span className="text-xl" aria-hidden="true">{isActive ? "⏸" : "▶️"}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-100 text-sm">
                          {song.flag} {song.country}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {song.artist} – {song.song}
                          {song.durationSec > 0 && (
                            <span className="ml-1 text-gray-600">
                              ({formatDuration(song.durationSec)})
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
