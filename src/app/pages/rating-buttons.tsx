"use client";

import { useState, useTransition } from "react";
import { submitVote } from "@/app/actions";
import { RATINGS, type RatingEmoji } from "@/app/airtable";

interface RatingButtonsProps {
  voterName: string;
  country: string;
  currentRating: RatingEmoji | undefined;
}

export function RatingButtons({
  voterName,
  country,
  currentRating,
}: RatingButtonsProps) {
  const [selected, setSelected] = useState<RatingEmoji | undefined>(
    currentRating,
  );
  const [isPending, startTransition] = useTransition();

  const handleRate = (emoji: RatingEmoji) => {
    startTransition(async () => {
      setSelected(emoji);
      await submitVote(voterName, country, emoji);
    });
  };

  return (
    <div
      className={`flex shrink-0 gap-1 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}
      role="group"
      aria-label={`Rate ${country}`}
    >
      {(Object.keys(RATINGS) as RatingEmoji[]).map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleRate(emoji)}
          disabled={isPending}
          title={RATINGS[emoji]}
          aria-label={`${emoji} – ${RATINGS[emoji]}`}
          aria-pressed={selected === emoji}
          className={`rounded-lg border-2 p-1 text-2xl leading-none transition-colors ${
            selected === emoji
              ? "border-indigo-500 bg-indigo-50"
              : "border-transparent bg-transparent hover:bg-mauve-100"
          } ${isPending ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
