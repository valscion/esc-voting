"use client";

import { useActiveSong } from "./use-active-song";
import { RatingButtons } from "./rating-buttons";
import type { Song, RatingEmoji } from "@/app/shared/constants";

interface VoteSongListProps {
  gameId: string;
  songs: Song[];
  voterName: string;
  votes: Record<string, RatingEmoji>;
  isClosed: boolean;
}

export function VoteSongList({
  gameId,
  songs,
  voterName,
  votes,
  isClosed,
}: VoteSongListProps) {
  const activeSong = useActiveSong(gameId);

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

      <ul className="mt-6">
        {songs.map((song, idx) => {
          const currentRating = votes[song.country];
          const isActive = activeSong === song.country;
          const mins = Math.floor(song.durationSec / 60);
          const secs = song.durationSec % 60;
          const duration = `${mins}:${String(secs).padStart(2, "0")}`;
          return (
            <li
              key={song.id}
              className={`relative flex items-center justify-between gap-4 pt-4 ${
                idx !== songs.length - 1 ? "border-b border-gray-800/60 pb-4" : ""
              } ${
                isActive
                  ? "z-0 before:content-[''] before:absolute before:-inset-0.5 before:-z-10 before:rounded-2xl before:bg-linear-to-br before:from-indigo-500/35 before:via-purple-500/25 before:to-indigo-500/15 before:animate-(--animate-active-song-pulse)"
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
              <RatingButtons
                gameId={gameId}
                voterName={voterName}
                country={song.country}
                currentRating={currentRating}
                readOnly={isClosed}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
