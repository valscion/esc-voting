"use client";

import { useState, useTransition } from "react";
import { submitVote } from "@/app/actions";
import { RATINGS, type RatingEmoji } from "@/app/shared/constants";

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
          className={`rounded-xl border-2 p-1.5 text-2xl leading-none transition-all ${
            selected === emoji
              ? "border-indigo-500 bg-indigo-950/60 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
              : "border-transparent bg-transparent hover:bg-gray-800"
          } ${isPending ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
