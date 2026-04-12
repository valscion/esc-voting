/**
 * Pure formatting functions for exporting voting data as JSON, CSV, and Markdown.
 * Safe to import from both server and client code.
 */

// ── Export data shapes ─────────────────────────────────────────

export interface VoterExportRow {
  countryCode: string;
  country: string;
  song: string;
  artist: string;
  flag: string;
  voteEmoji: string;
  score: number;
  assumed: boolean;
  note: string;
}

export interface VoterExportData {
  escYear: number;
  gameId: string;
  voter: string;
  exportedAt: string;
  songs: VoterExportRow[];
}

export interface ResultsExportVote {
  voter: string;
  emoji: string;
  score: number;
  assumed: boolean;
}

export interface ResultsExportNote {
  voter: string;
  note: string;
}

export interface ResultsExportRow {
  countryCode: string;
  country: string;
  song: string;
  artist: string;
  flag: string;
  totalScore: number;
  votes: ResultsExportVote[];
  notes: ResultsExportNote[];
}

export interface ResultsExportData {
  escYear: number;
  gameId: string;
  voters: string[];
  exportedAt: string;
  songs: ResultsExportRow[];
}

export type ExportFormat = "json" | "csv" | "md";

// ── CSV helpers ────────────────────────────────────────────────

function csvEscape(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function csvRow(values: (string | number)[]): string {
  return values.map((v) => csvEscape(String(v))).join(",");
}

// ── Voter export formatters ────────────────────────────────────

export function formatVoterJSON(data: VoterExportData): string {
  return JSON.stringify(data, null, 2);
}

export function formatVoterCSV(data: VoterExportData): string {
  const header = csvRow([
    "Country Code",
    "Country",
    "Artist",
    "Song",
    "Flag",
    "Vote",
    "Score",
    "Assumed",
    "Note",
  ]);
  const rows = data.songs.map((s) =>
    csvRow([
      s.countryCode,
      s.country,
      s.artist,
      s.song,
      s.flag,
      s.voteEmoji,
      s.score,
      s.assumed ? "Yes" : "No",
      s.note,
    ]),
  );
  return [
    `# ESC ${data.escYear} – ${data.voter} – Game ${data.gameId}`,
    header,
    ...rows,
  ].join("\n");
}

export function formatVoterMarkdown(data: VoterExportData): string {
  const lines: string[] = [
    `# ESC ${data.escYear} – ${data.voter}'s Votes`,
    "",
    `**Game ID:** ${data.gameId}  `,
    `**Exported:** ${data.exportedAt}`,
    "",
    "| Flag | Country | Artist | Song | Vote | Score | Note |",
    "| :--: | ------- | ------ | ---- | :--: | ----: | ---- |",
  ];

  for (const s of data.songs) {
    const scoreStr = s.assumed ? `${s.score}*` : String(s.score);
    const noteStr = s.note ? s.note.replace(/\|/g, "\\|") : "";
    lines.push(
      `| ${s.flag} | ${s.country} | ${s.artist} | ${s.song} | ${s.voteEmoji} | ${scoreStr} | ${noteStr} |`,
    );
  }

  lines.push("");
  lines.push("_* = assumed score (median of other voters)_");
  return lines.join("\n");
}

// ── Results export formatters ──────────────────────────────────

export function formatResultsJSON(data: ResultsExportData): string {
  return JSON.stringify(data, null, 2);
}

export function formatResultsCSV(data: ResultsExportData): string {
  // Dynamic columns: one pair (vote, score) per voter
  const voterHeaders = data.voters.flatMap((v) => [
    `${v} (vote)`,
    `${v} (score)`,
  ]);
  const header = csvRow([
    "Country Code",
    "Country",
    "Artist",
    "Song",
    "Flag",
    "Total Score",
    ...voterHeaders,
    "Notes",
  ]);

  const rows = data.songs.map((s) => {
    const voterCols = data.voters.flatMap((voter) => {
      const v = s.votes.find((vote) => vote.voter === voter);
      if (!v) return ["", ""];
      const emoji = v.assumed ? `${v.emoji}*` : v.emoji;
      return [emoji, v.score];
    });
    const notesStr = s.notes.map((n) => `${n.voter}: ${n.note}`).join("; ");
    return csvRow([
      s.countryCode,
      s.country,
      s.artist,
      s.song,
      s.flag,
      s.totalScore,
      ...voterCols,
      notesStr,
    ]);
  });

  return [
    `# ESC ${data.escYear} – All Results – Game ${data.gameId}`,
    header,
    ...rows,
  ].join("\n");
}

export function formatResultsMarkdown(data: ResultsExportData): string {
  const lines: string[] = [
    `# ESC ${data.escYear} – Voting Results`,
    "",
    `**Game ID:** ${data.gameId}  `,
    `**Voters:** ${data.voters.join(", ")}  `,
    `**Exported:** ${data.exportedAt}`,
    "",
  ];

  // Sort songs by total score descending for the markdown view
  const sorted = [...data.songs].sort((a, b) => b.totalScore - a.totalScore);

  // Build a table with voter columns
  const voterCols = data.voters.map((v) => v);
  const headerRow = `| Flag | Country | Artist | Song | ${voterCols.join(" | ")} | Total |`;
  const sepRow = `| :--: | ------- | ------ | ---- | ${voterCols.map(() => ":--:").join(" | ")} | ----: |`;

  lines.push(headerRow, sepRow);

  for (const s of sorted) {
    const voterVals = data.voters.map((voter) => {
      const v = s.votes.find((vote) => vote.voter === voter);
      if (!v) return "";
      return v.assumed ? `${v.emoji}*` : v.emoji;
    });
    lines.push(
      `| ${s.flag} | ${s.country} | ${s.artist} | ${s.song} | ${voterVals.join(" | ")} | ${s.totalScore} |`,
    );
  }

  lines.push("");

  // Notes section
  const allNotes = sorted.flatMap((s) =>
    s.notes.map((n) => ({ country: s.country, flag: s.flag, ...n })),
  );
  if (allNotes.length > 0) {
    lines.push("## Notes", "");
    for (const n of allNotes) {
      lines.push(
        `- ${n.flag} **${n.country}** – _${n.voter}_: "${n.note}"`,
      );
    }
    lines.push("");
  }

  lines.push("_* = assumed score (median of other voters)_");
  return lines.join("\n");
}

// ── File name helpers ──────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function voterExportFilename(
  data: VoterExportData,
  format: ExportFormat,
): string {
  const ext = format === "md" ? "md" : format;
  return `esc${data.escYear}_${sanitizeFilename(data.voter)}_${data.gameId.slice(0, 8)}.${ext}`;
}

export function resultsExportFilename(
  data: ResultsExportData,
  format: ExportFormat,
): string {
  const ext = format === "md" ? "md" : format;
  return `esc${data.escYear}_results_${data.gameId.slice(0, 8)}.${ext}`;
}

// ── Unified format dispatch ────────────────────────────────────

export function formatVoterExport(
  data: VoterExportData,
  format: ExportFormat,
): string {
  switch (format) {
    case "json":
      return formatVoterJSON(data);
    case "csv":
      return formatVoterCSV(data);
    case "md":
      return formatVoterMarkdown(data);
  }
}

export function formatResultsExport(
  data: ResultsExportData,
  format: ExportFormat,
): string {
  switch (format) {
    case "json":
      return formatResultsJSON(data);
    case "csv":
      return formatResultsCSV(data);
    case "md":
      return formatResultsMarkdown(data);
  }
}

export function mimeTypeForFormat(format: ExportFormat): string {
  switch (format) {
    case "json":
      return "application/json";
    case "csv":
      return "text/csv";
    case "md":
      return "text/markdown";
  }
}
