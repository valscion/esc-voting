"use client";

import { useState, useTransition } from "react";
import { submitNote } from "@/app/actions";
import type { CountryCode } from "@/app/shared/constants";
import { MAX_NOTE_LENGTH } from "@/app/shared/constants";

interface NoteEditorProps {
  gameId: string;
  voterName: string;
  countryCode: CountryCode;
  initialNote: string;
}

export function NoteEditor({
  gameId,
  voterName,
  countryCode,
  initialNote,
}: NoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const trimmed = note.trim();
    startTransition(async () => {
      await submitNote(gameId, voterName, countryCode, trimmed);
      setSavedNote(trimmed);
      setNote(trimmed);
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setNote(savedNote);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mt-1.5 flex flex-col gap-1.5">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={MAX_NOTE_LENGTH}
          rows={2}
          placeholder="Add a note about this song…"
          className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
          autoFocus
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">
            {note.length}/{MAX_NOTE_LENGTH}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="rounded-lg px-3 py-1 text-xs text-gray-500 transition-colors hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1 flex flex-col items-end">
      {savedNote && (
        <p className="mb-0.5 w-full text-xs text-gray-500 italic">
          {savedNote}
        </p>
      )}
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="min-h-6 min-w-6 pr-2 text-xs text-gray-600 transition-colors hover:text-indigo-400"
        aria-label={savedNote ? "Edit note" : "Add note"}
      >
        {savedNote ? "✏️ edit note" : "✏️ add note"}
      </button>
    </div>
  );
}
