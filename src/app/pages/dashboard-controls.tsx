"use client";

import { useState } from "react";
import { useSyncedState } from "rwsdk/use-synced-state/client";
import { ESC_MONTAGE_DATA } from "@/app/shared/constants";
import { MontagePlayer } from "./montage-player";

interface SongInfo {
  country: string;
  artist: string;
  song: string;
  flag: string;
  youtubeId: string;
  durationSec: number;
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
  montageYoutubeId: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function DashboardControls({ gameId, songs, escYear, montageYoutubeId }: DashboardControlsProps) {
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

  const [isMontageActive, setIsMontageActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const montageData = ESC_MONTAGE_DATA[escYear];

  const handleSongClick = (country: string) => {
    const isActive = activeSong === country;
    if (isActive) {
      setActiveSong(null);
      setTvMode(null);
      setIsPaused(false);
    } else {
      setActiveSong(country);
      setTvMode("song");
      setIsMontageActive(false);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    setActiveSong(null);
    setTvMode(null);
    setIsMontageActive(false);
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
    const currentIndex = songs.findIndex((s) => s.country === activeSong);
    if (currentIndex >= 0 && currentIndex < songs.length - 1) {
      setActiveSong(songs[currentIndex + 1].country);
      setTvMode("song");
      setIsPaused(false);
    } else {
      setActiveSong(null);
      setTvMode(null);
      setIsPaused(false);
    }
  };

  const handleMontageToggle = () => {
    if (isMontageActive) {
      setIsMontageActive(false);
      setActiveSong(null);
      setTvMode(null);
      setIsPaused(false);
    } else {
      setIsMontageActive(true);
      setTvMode("montage");
      setTvPlayback({ command: "play" });
      setIsPaused(false);
    }
  };

  const progressPercent = tvProgress
    ? Math.round(tvProgress.playedFraction * 100)
    : 0;

  return (
    <div className="mt-8">
      {/* Montage controls */}
      {montageData && (
        <div className="mb-6">
          <button
            type="button"
            onClick={handleMontageToggle}
            className={`rounded-2xl border px-5 py-3 text-sm font-medium transition-all ${
              isMontageActive
                ? "border-amber-600 bg-amber-950/40 text-amber-300 hover:border-red-500 hover:text-red-400"
                : "border-gray-700 bg-gray-900 text-gray-400 hover:border-amber-600 hover:text-amber-300"
            }`}
          >
            {isMontageActive ? "⏹ Stop Montage" : "▶️ Play Montage"}
          </button>
        </div>
      )}

      {/* Montage video player (inline on dashboard) */}
      {isMontageActive && montageData && (
        <MontagePlayer
          youtubeId={montageData.youtubeId}
          timestamps={montageData.timestamps}
          onSongChange={(country) => setActiveSong(country)}
          onEnded={() => {
            setIsMontageActive(false);
            setActiveSong(null);
            setTvMode(null);
          }}
        />
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

      {/* Song list */}
      <ul className="flex flex-col gap-2">
        {songs.map((song) => {
          const isActive = activeSong === song.country;
          return (
            <li key={song.country}>
              <button
                type="button"
                onClick={() => handleSongClick(song.country)}
                data-song-country={song.country}
                className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
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
                <span className="text-2xl" aria-hidden="true">
                  {isActive ? "⏸" : "▶️"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-100">
                    {song.flag} {song.country}
                  </div>
                  <div className="text-sm text-gray-500">
                    {song.artist} – {song.song}
                    {song.durationSec > 0 && (
                      <span className="ml-2 text-gray-600">
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
  );
}
