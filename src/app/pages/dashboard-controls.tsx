"use client";

import { useState } from "react";
import { useSyncedState } from "rwsdk/use-synced-state/client";
import { ESC_MONTAGE_DATA, type CountryCode } from "@/app/shared/constants";
import { MontagePlayer } from "./montage-player";

interface SongInfo {
  code: CountryCode;
  country: string;
  artist: string;
  song: string;
  flag: string;
  semifinal: number;
  semifinalHalf: number;
}

interface DashboardControlsProps {
  gameId: string;
  songs: SongInfo[];
  escYear: number;
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
  const [isMontageActive, setIsMontageActive] = useState(false);
  const montageData = ESC_MONTAGE_DATA[escYear];

  const handleMontageToggle = () => {
    if (isMontageActive) {
      setIsMontageActive(false);
      setActiveSong(null);
    } else {
      setIsMontageActive(true);
    }
  };

  const groups = groupSongs(songs);

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

      {/* Montage video player */}
      {isMontageActive && montageData && (
        <MontagePlayer
          youtubeId={montageData.youtubeId}
          timestamps={montageData.timestamps}
          onSongChange={(country) => setActiveSong(country)}
          onEnded={() => {
            setIsMontageActive(false);
            setActiveSong(null);
          }}
        />
      )}

      {/* Now playing bar */}
      <div
        className={`mb-6 flex items-center justify-between rounded-2xl px-5 py-3 text-sm font-medium ring-1 ${
          activeSong
            ? "bg-indigo-950/40 text-indigo-300 ring-indigo-800"
            : "bg-gray-900/40 text-gray-600 ring-gray-800"
        }`}
      >
        {activeSong ? (
          <>
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
              onClick={() => {
                setActiveSong(null);
                setIsMontageActive(false);
              }}
              className="ml-4 rounded-xl border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-red-500 hover:text-red-400"
            >
              ⏹ Stop
            </button>
          </>
        ) : (
          <span>🎵 No song currently playing</span>
        )}
      </div>

      {/* Song grid grouped by semifinal halves */}
      {groups.map((group, groupIdx) => (
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
                    onClick={() => {
                      if (isActive) {
                        setActiveSong(null);
                      } else {
                        setActiveSong(song.country);
                        setIsMontageActive(false);
                      }
                    }}
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
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
