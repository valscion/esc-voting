"use client";

import { useState } from "react";
import type { SongResult } from "@/app/data";

interface ResultsRevealProps {
  token: string;
  results: { score: number; songs: SongResult[] }[];
}

export function ResultsReveal({ token, results }: ResultsRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  const totalGroups = results.length;
  const allRevealed = revealedCount >= totalGroups;

  // The currently visible section (the last revealed group)
  const currentIndex = revealedCount - 1;
  const currentGroup = currentIndex >= 0 ? results[currentIndex] : null;

  // Is this the winning section (last group = highest score)?
  const isWinner = currentIndex === totalGroups - 1;

  if (revealedCount === 0) {
    // Initial screen before any reveal
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-bold text-indigo-300 sm:text-5xl">
          🏆 Final Results
        </h1>
        <p className="mt-4 text-center text-lg text-gray-400">
          Ready to reveal the results? We&apos;ll start from the bottom
          and work our way up to the winner!
        </p>
        <button
          type="button"
          onClick={() => setRevealedCount(1)}
          className="mt-10 rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-indigo-500 hover:shadow-xl active:scale-95"
        >
          Reveal first group →
        </button>
        <a
          href={`/${token}`}
          className="mt-8 text-sm text-gray-500 no-underline hover:text-gray-400"
        >
          ← Back to game
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      {/* Position indicator */}
      <div className="mb-6 text-sm text-gray-500">
        Group {revealedCount} of {totalGroups}
      </div>

      {currentGroup && (
        <div className="w-full max-w-2xl">
          {/* Score badge */}
          <div className="mb-8 text-center">
            {isWinner && (
              <div className="mb-4 text-5xl sm:text-6xl">🏆</div>
            )}
            <h2
              className={`text-3xl font-bold sm:text-4xl ${
                isWinner ? "text-amber-300" : "text-indigo-300"
              }`}
            >
              {isWinner ? "Winner!" : `Score: ${currentGroup.score}`}
            </h2>
            {isWinner && (
              <p className="mt-2 text-xl text-amber-400/80">
                Score: {currentGroup.score}
              </p>
            )}
          </div>

          {/* Songs in this group */}
          <ul className="flex flex-col gap-4">
            {currentGroup.songs.map((song) => (
              <li
                key={song.country}
                className={`rounded-2xl border px-6 py-5 ${
                  isWinner
                    ? "border-amber-600/50 bg-amber-950/30 shadow-[0_0_30px_rgba(251,191,36,0.15)]"
                    : "border-gray-700 bg-gray-900/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`text-2xl font-bold ${
                        isWinner ? "text-amber-200" : "text-gray-100"
                      }`}
                    >
                      {song.flag} {song.country}
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      {song.artist} – {song.song}
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      isWinner ? "text-amber-300" : "text-indigo-300"
                    }`}
                  >
                    {song.totalScore}
                  </div>
                </div>

                {/* Vote breakdown */}
                {song.voteBreakdown.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {song.voteBreakdown
                        .filter((vote) => !vote.assumed)
                        .map((vote) => (
                          <span
                            key={vote.voter}
                            className="rounded-lg bg-gray-800/80 px-2.5 py-1 text-sm text-gray-300"
                            title={`${vote.voter}: ${vote.emoji} (${vote.score > 0 ? "+" : ""}${vote.score})`}
                          >
                            {vote.voter}: {vote.emoji}
                          </span>
                        ))}
                    </div>
                    {song.voteBreakdown.some((vote) => vote.assumed) && (
                      <div className="mt-2">
                        <div className="mb-1 text-xs text-gray-500">
                          Assumed (didn&apos;t vote):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {song.voteBreakdown
                            .filter((vote) => vote.assumed)
                            .map((vote) => (
                              <span
                                key={vote.voter}
                                className="rounded-lg border border-dashed border-gray-700 bg-gray-900/50 px-2.5 py-1 text-sm text-gray-500"
                                title={`${vote.voter}: ${vote.emoji} (${vote.score > 0 ? "+" : ""}${vote.score}) – assumed from median`}
                              >
                                {vote.voter}: {vote.emoji}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Things said about this song */}
                {song.notes.length > 0 && (
                  <div className="mt-3 border-t border-gray-700/50 pt-3">
                    <div className="mb-1.5 text-xs font-medium text-gray-500">
                      💬 Things said about this song:
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {song.notes.map((n) => (
                        <div
                          key={n.voter}
                          className="rounded-lg bg-gray-800/50 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-indigo-400">
                            {n.voter}:
                          </span>{" "}
                          <span className="text-gray-300 italic">
                            &ldquo;{n.note}&rdquo;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-10 flex flex-col items-center gap-4">
        {!allRevealed ? (
          <button
            type="button"
            onClick={() => { setRevealedCount((c) => c + 1); window.scrollTo(0, 0); }}
            className="rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-indigo-500 hover:shadow-xl active:scale-95"
          >
            {revealedCount === totalGroups - 1
              ? "🏆 Reveal the winner!"
              : `Reveal next group →`}
          </button>
        ) : (
          <div className="text-center text-gray-500">
            🎉 All results revealed!
          </div>
        )}

        <a
          href={`/${token}`}
          className="text-sm text-gray-500 no-underline hover:text-gray-400"
        >
          ← Back to game
        </a>
      </div>
    </div>
  );
}
