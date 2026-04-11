"use client";

import { useState, useTransition } from "react";
import { submitVote } from "@/app/actions";
import { RATINGS, type RatingEmoji } from "@/app/shared/constants";

interface RatingButtonsProps {
  gameId: string;
  voterName: string;
  country: string;
  currentRating: RatingEmoji | undefined;
  assumedRating?: RatingEmoji;
  readOnly?: boolean;
}

export function RatingButtons({
  gameId,
  voterName,
  country,
  currentRating,
  assumedRating,
  readOnly,
}: RatingButtonsProps) {
  const [selected, setSelected] = useState<RatingEmoji | undefined>(
    currentRating,
  );
  const [isPending, startTransition] = useTransition();

  const handleRate = (emoji: RatingEmoji) => {
    if (readOnly) return;
    startTransition(async () => {
      setSelected(emoji);
      await submitVote(gameId, voterName, country, emoji);
    });
  };

  // When read-only with no real vote but an assumed vote, show the assumed emoji
  const displayEmoji = selected ?? (readOnly ? assumedRating : undefined);
  const isAssumed = !selected && !!assumedRating && readOnly;

  return (
    <div
      className={`flex shrink-0 gap-1 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}
      role="group"
      aria-label={`Rate ${country}`}
    >
      {(Object.keys(RATINGS) as RatingEmoji[]).map((emoji) => {
        const isDisplayed = displayEmoji === emoji;
        return (
          <button
            key={emoji}
            onClick={() => handleRate(emoji)}
            disabled={isPending || readOnly}
            title={
              isAssumed && isDisplayed
                ? `${RATINGS[emoji]} (assumed – you didn't vote)`
                : RATINGS[emoji]
            }
            aria-label={`${emoji} – ${RATINGS[emoji]}`}
            aria-pressed={isDisplayed}
            className={`rounded-xl border-2 p-1.5 text-2xl leading-none transition-all ${
              isDisplayed
                ? isAssumed
                  ? "border-dashed border-gray-500 bg-gray-900/40 opacity-50"
                  : "border-indigo-500 bg-indigo-950/60 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                : "border-transparent bg-transparent hover:bg-gray-800"
            } ${isPending || readOnly ? "cursor-not-allowed" : "cursor-pointer"} ${readOnly && !isDisplayed ? "opacity-40" : ""}`}
          >
            {emoji}
          </button>
        );
      })}
      {isAssumed && (
        <span className="self-center text-xs text-gray-600 ml-1" title="Score assumed from median of other votes">
          (assumed)
        </span>
      )}
    </div>
  );
}
