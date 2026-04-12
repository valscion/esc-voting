"use client";

import { useState, useTransition, useRef } from "react";
import { importGameAction } from "@/app/actions";

export function ImportGame() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [includeRatings, setIncludeRatings] = useState(true);
  const [preview, setPreview] = useState<{
    escYear: number;
    voters: string[];
    songCount: number;
    voteCount: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPreview(null);
    setFileContent(null);
    setFileName(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setError("Please select a JSON file.");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text !== "string") {
        setError("Failed to read file.");
        return;
      }

      try {
        const data = JSON.parse(text);

        // Basic validation
        if (!data.escYear || typeof data.escYear !== "number") {
          setError("JSON must include a numeric 'escYear' field.");
          return;
        }
        if (
          !Array.isArray(data.voters) ||
          data.voters.length === 0 ||
          !data.voters.every(
            (v: unknown) => typeof v === "string" && v.trim().length > 0,
          )
        ) {
          setError(
            "JSON must include a 'voters' array with at least one non-empty name.",
          );
          return;
        }

        // Count votes and songs
        let voteCount = 0;
        const songCount = Array.isArray(data.songs) ? data.songs.length : 0;
        if (Array.isArray(data.songs)) {
          for (const song of data.songs) {
            if (Array.isArray(song.votes)) {
              voteCount += song.votes.length;
            }
          }
        }

        setFileContent(text);
        setPreview({
          escYear: data.escYear,
          voters: data.voters,
          songCount,
          voteCount,
        });
      } catch {
        setError("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!fileContent) return;
    setError(null);

    startTransition(async () => {
      try {
        await importGameAction(fileContent, includeRatings);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to import game. Please try again.",
        );
      }
    });
  };

  const handleReset = () => {
    setError(null);
    setPreview(null);
    setFileContent(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* File picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">
          Select a JSON export file
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          disabled={isPending}
          className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-950 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-300 file:cursor-pointer"
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="rounded-2xl border border-gray-700 bg-gray-900/80 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-200">
            📋 Import preview
          </h3>
          <p className="mt-1 text-xs text-gray-500">File: {fileName}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <dt className="text-gray-500">ESC Year</dt>
            <dd className="text-gray-200">{preview.escYear}</dd>
            <dt className="text-gray-500">Voters</dt>
            <dd className="text-gray-200">{preview.voters.join(", ")}</dd>
            <dt className="text-gray-500">Songs</dt>
            <dd className="text-gray-200">{preview.songCount} entries</dd>
            <dt className="text-gray-500">Votes</dt>
            <dd className="text-gray-200">{preview.voteCount} ratings</dd>
          </dl>

          {/* Import options */}
          <div className="mt-4 border-t border-gray-800 pt-4">
            <fieldset>
              <legend className="text-sm font-medium text-gray-300">
                What to import
              </legend>
              <div className="mt-2 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={!includeRatings}
                    onChange={() => setIncludeRatings(false)}
                    disabled={isPending}
                    className="accent-indigo-500"
                  />
                  Participants only (voters)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={includeRatings}
                    onChange={() => setIncludeRatings(true)}
                    disabled={isPending || preview.voteCount === 0}
                    className="accent-indigo-500"
                  />
                  Participants + ratings &amp; notes
                  {preview.voteCount === 0 && (
                    <span className="text-xs text-gray-600">
                      (no votes in file)
                    </span>
                  )}
                </label>
              </div>
            </fieldset>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={isPending}
              className={`rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-500 ${isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              {isPending ? "Importing…" : "📥 Import game"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              className="rounded-2xl border border-gray-700 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
