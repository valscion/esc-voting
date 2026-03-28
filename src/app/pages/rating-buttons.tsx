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
      style={{
        display: "flex",
        gap: "0.25rem",
        flexShrink: 0,
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.15s",
      }}
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
          style={{
            fontSize: "1.5rem",
            lineHeight: 1,
            padding: "0.25rem",
            border: "2px solid",
            borderColor: selected === emoji ? "#6366f1" : "transparent",
            borderRadius: "8px",
            background: selected === emoji ? "#eef2ff" : "transparent",
            cursor: isPending ? "not-allowed" : "pointer",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
