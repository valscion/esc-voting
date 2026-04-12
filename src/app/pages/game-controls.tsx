"use client";

import { useTransition } from "react";
import { closeGame, deleteGame } from "@/app/actions";

interface GameControlsProps {
  token: string;
  closed: boolean;
  hideDeleteButton?: boolean;
}

export function GameControls({ token, closed, hideDeleteButton }: GameControlsProps) {
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (!confirm("Stop voting? Votes will become read-only.")) return;
    startTransition(async () => {
      await closeGame(token);
      window.location.reload();
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this game? All votes will be permanently removed."))
      return;
    startTransition(async () => {
      await deleteGame(token);
      window.location.href = "/";
    });
  };

  return (
    <div className="mt-10 flex flex-wrap gap-3 border-t border-gray-800 pt-6">
      {!closed && (
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending}
          className={`rounded-2xl border border-amber-700 bg-amber-950/40 px-5 py-2.5 text-sm font-medium text-amber-300 transition-all hover:bg-amber-950/70 ${isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        >
          🔒 Stop voting now
        </button>
      )}

      {!hideDeleteButton && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className={`rounded-2xl border border-red-700 bg-red-950/40 px-5 py-2.5 text-sm font-medium text-red-300 transition-all hover:bg-red-950/70 ${isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        >
          🗑️ Delete game
        </button>
      )}
    </div>
  );
}
