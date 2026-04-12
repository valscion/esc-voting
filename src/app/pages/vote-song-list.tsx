"use client";

import { useCallback } from "react";
import { useActiveSong } from "./use-active-song";
import { RatingButtons } from "./rating-buttons";
import type { Song, RatingEmoji } from "@/app/shared/constants";

interface VoteSongListProps {
  gameId: string;
  songs: readonly Song[];
  voterName: string;
  votes: Record<string, RatingEmoji>;
  assumedVotes?: Record<string, RatingEmoji>;
  isClosed: boolean;
}

export function VoteSongList({
  gameId,
  songs,
  voterName,
  votes,
  assumedVotes = {},
  isClosed,
}: VoteSongListProps) {
  const activeSong = useActiveSong(gameId);

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      const target = e.target;
      if (!(target instanceof HTMLButtonElement)) return;

      const songIndex = target.dataset.songIndex;
      const ratingIndex = target.dataset.ratingIndex;
      if (songIndex == null || ratingIndex == null) return;

      const si = parseInt(songIndex, 10);
      const ri = parseInt(ratingIndex, 10);
      let nextSi = si;
      let nextRi = ri;

      switch (e.key) {
        case "ArrowUp":
          nextSi = si - 1;
          break;
        case "ArrowDown":
          nextSi = si + 1;
          break;
        case "ArrowLeft":
          nextRi = ri - 1;
          break;
        case "ArrowRight":
          nextRi = ri + 1;
          break;
        default:
          return;
      }

      const next = e.currentTarget.querySelector<HTMLButtonElement>(
        `button[data-song-index="${nextSi}"][data-rating-index="${nextRi}"]`,
      );
      if (next) {
        e.preventDefault();
        next.focus();
      }
    },
    [],
  );

  const activeInfo = activeSong
    ? songs.find((s) => s.country === activeSong)
    : null;

  return (
    <>
      <div aria-live="polite" data-testid="now-playing" className="sr-only">
        {activeInfo
          ? `Now playing: ${activeInfo.flag} ${activeInfo.country} – ${activeInfo.artist} – ${activeInfo.song}`
          : ""}
      </div>

      <ul className="mt-6" onKeyDown={handleGridKeyDown}>
        {songs.map((song, idx) => {
          const currentRating = votes[song.code];
          const assumedRating = assumedVotes[song.code];
          const isActive = activeSong === song.country;
          const mins = Math.floor(song.durationSec / 60);
          const secs = song.durationSec % 60;
          const duration = `${mins}:${String(secs).padStart(2, "0")}`;

          // Determine if we need a group separator before this song
          const prevSong = idx > 0 ? songs[idx - 1] : null;
          const groupChanged =
            prevSong != null &&
            (song.semifinal !== prevSong.semifinal ||
              song.semifinalHalf !== prevSong.semifinalHalf);

          const groupLabel = `Semi-final ${song.semifinal} · ${song.semifinalHalf === 1 ? "First" : "Second"} half`;

          return (
            <li
              key={song.code}
              className={`relative ${
                idx !== songs.length - 1 ? "border-b border-gray-800/60" : ""
              }`}
            >
              {/* Group separator */}
              {(idx === 0 || groupChanged) && (
                <div
                  className={`${idx === 0 ? "pb-3" : "border-t-2 border-dashed border-gray-700/60 pb-3 pt-4"}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {groupLabel}
                  </span>
                </div>
              )}

              <div
                className={`flex items-center justify-between gap-4 pt-4 pb-4 ${
                  isActive
                    ? "z-0 before:content-[''] before:absolute before:-inset-y-0.5 before:left-[calc(-50vw+50%)] before:w-screen before:-z-10 before:bg-linear-to-br before:from-indigo-500/35 before:via-purple-500/25 before:to-indigo-500/15 before:animate-(--animate-active-song-pulse)"
                    : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-100">
                    {song.flag} {song.country}
                  </div>
                  <div className="text-sm text-gray-500">
                    {song.artist} –{" "}
                    {song.youtubeId ? (
                      <a
                        href={`https://www.youtube.com/watch?v=${song.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 no-underline hover:text-indigo-300"
                      >
                        {song.song}
                      </a>
                    ) : (
                      song.song
                    )}
                    {song.durationSec > 0 && (
                      <span className="ml-1.5 text-gray-600">({duration})</span>
                    )}
                  </div>
                </div>
                <div>
                  <RatingButtons
                    gameId={gameId}
                    voterName={voterName}
                    countryCode={song.code}
                    country={song.country}
                    currentRating={currentRating}
                    assumedRating={assumedRating}
                    readOnly={isClosed}
                    songIndex={idx}
                  />
                  {assumedRating && (
                    <span
                      className="ml-2 self-center text-xs text-gray-600"
                      title="Score assumed from median of other votes"
                    >
                      (assumed rating)
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
