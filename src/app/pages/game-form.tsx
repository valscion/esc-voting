"use client";

import { useState, useTransition } from "react";
import { createGame } from "@/app/actions";

export function GameForm() {
  const [names, setNames] = useState<string[]>(["", ""]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const updateName = (index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const addField = () => {
    setNames((prev) => [...prev, ""]);
  };

  const removeField = (index: number) => {
    if (names.length <= 2) return;
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = names.map((n) => n.trim()).filter(Boolean);
    if (trimmed.length < 2) {
      setError("Please enter at least two names.");
      return;
    }

    const unique = [...new Set(trimmed)];
    if (unique.length !== trimmed.length) {
      setError("Names must be unique.");
      return;
    }

    startTransition(async () => {
      const token = await createGame(unique);
      window.location.href = `/${token}`;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      {names.map((name, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => updateName(i, e.target.value)}
            placeholder={`Friend ${i + 1}`}
            className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100 placeholder-gray-600 outline-none transition-colors focus:border-indigo-500"
            disabled={isPending}
          />
          {names.length > 2 && (
            <button
              type="button"
              onClick={() => removeField(i)}
              disabled={isPending}
              className="rounded-xl border border-gray-700 px-3 py-2 text-gray-500 transition-colors hover:border-red-500 hover:text-red-400"
              aria-label={`Remove friend ${i + 1}`}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addField}
        disabled={isPending}
        className="self-start rounded-xl border border-dashed border-gray-700 px-4 py-2 text-sm text-gray-500 transition-colors hover:border-indigo-500 hover:text-indigo-400"
      >
        + Add another friend
      </button>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={`mt-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-500 ${isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        {isPending ? "Creating game…" : "🎤 Start voting!"}
      </button>
    </form>
  );
}
