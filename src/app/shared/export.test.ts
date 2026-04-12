import { describe, it, expect } from "vitest";
import {
  formatVoterJSON,
  formatVoterCSV,
  formatVoterMarkdown,
  formatResultsJSON,
  formatResultsCSV,
  formatResultsMarkdown,
  voterExportFilename,
  resultsExportFilename,
  type VoterExportData,
  type ResultsExportData,
} from "./export";

const voterData: VoterExportData = {
  escYear: 2026,
  gameId: "abc12345-6789-0000-0000-000000000000",
  voter: "Alice",
  exportedAt: "2026-04-12T12:00:00.000Z",
  songs: [
    {
      countryCode: "MDA",
      country: "Moldova",
      song: "Viva, Moldova",
      artist: "Satoshi",
      flag: "🇲🇩",
      voteEmoji: "🤩",
      score: 5,
      assumed: false,
      note: "Absolute banger!",
    },
    {
      countryCode: "SWE",
      country: "Sweden",
      song: "My System",
      artist: "Felicia",
      flag: "🇸🇪",
      voteEmoji: "😐",
      score: 1,
      assumed: true,
      note: "",
    },
  ],
};

const resultsData: ResultsExportData = {
  escYear: 2026,
  gameId: "def12345-6789-0000-0000-000000000000",
  voters: ["Alice", "Bob"],
  exportedAt: "2026-04-12T12:00:00.000Z",
  songs: [
    {
      countryCode: "MDA",
      country: "Moldova",
      song: "Viva, Moldova",
      artist: "Satoshi",
      flag: "🇲🇩",
      totalScore: 8,
      votes: [
        { voter: "Alice", emoji: "🤩", score: 5, assumed: false },
        { voter: "Bob", emoji: "😁", score: 3, assumed: false },
      ],
      notes: [{ voter: "Alice", note: "Absolute banger!" }],
    },
    {
      countryCode: "SWE",
      country: "Sweden",
      song: "My System",
      artist: "Felicia",
      flag: "🇸🇪",
      totalScore: 2,
      votes: [
        { voter: "Alice", emoji: "😐", score: 1, assumed: false },
        { voter: "Bob", emoji: "😐", score: 1, assumed: true },
      ],
      notes: [],
    },
  ],
};

describe("Voter export", () => {
  it("formats JSON with all fields", () => {
    const output = formatVoterJSON(voterData);
    const parsed = JSON.parse(output);
    expect(parsed.escYear).toBe(2026);
    expect(parsed.gameId).toBe("abc12345-6789-0000-0000-000000000000");
    expect(parsed.voter).toBe("Alice");
    expect(parsed.songs).toHaveLength(2);
    expect(parsed.songs[0].countryCode).toBe("MDA");
    expect(parsed.songs[0].voteEmoji).toBe("🤩");
    expect(parsed.songs[0].score).toBe(5);
    expect(parsed.songs[0].note).toBe("Absolute banger!");
    expect(parsed.songs[1].assumed).toBe(true);
  });

  it("formats CSV with header and data rows", () => {
    const output = formatVoterCSV(voterData);
    const lines = output.split("\n");
    // First line is a comment with metadata
    expect(lines[0]).toContain("ESC 2026");
    expect(lines[0]).toContain("Alice");
    expect(lines[0]).toContain("abc12345");
    // Second line is the header
    expect(lines[1]).toContain("Country Code");
    expect(lines[1]).toContain("Vote");
    expect(lines[1]).toContain("Score");
    expect(lines[1]).toContain("Note");
    // Data rows
    expect(lines[2]).toContain("MDA");
    expect(lines[2]).toContain("Moldova");
    expect(lines[2]).toContain("🤩");
    expect(lines[3]).toContain("SWE");
  });

  it("escapes commas in CSV values", () => {
    const output = formatVoterCSV(voterData);
    // "Viva, Moldova" should be quoted
    expect(output).toContain('"Viva, Moldova"');
  });

  it("formats Markdown with table", () => {
    const output = formatVoterMarkdown(voterData);
    expect(output).toContain("# ESC 2026 – Alice's Votes");
    expect(output).toContain("**Game ID:** abc12345");
    expect(output).toContain("| 🇲🇩 | Moldova |");
    expect(output).toContain("| 🤩 |");
    // Assumed score has asterisk
    expect(output).toContain("1*");
    expect(output).toContain("assumed score");
  });
});

describe("Results export", () => {
  it("formats JSON with all fields", () => {
    const output = formatResultsJSON(resultsData);
    const parsed = JSON.parse(output);
    expect(parsed.escYear).toBe(2026);
    expect(parsed.voters).toEqual(["Alice", "Bob"]);
    expect(parsed.songs).toHaveLength(2);
    expect(parsed.songs[0].totalScore).toBe(8);
    expect(parsed.songs[0].votes).toHaveLength(2);
    expect(parsed.songs[0].notes).toHaveLength(1);
  });

  it("formats CSV with voter columns", () => {
    const output = formatResultsCSV(resultsData);
    const lines = output.split("\n");
    // Comment line
    expect(lines[0]).toContain("ESC 2026");
    expect(lines[0]).toContain("def12345");
    // Header has voter columns
    expect(lines[1]).toContain("Alice (vote)");
    expect(lines[1]).toContain("Bob (vote)");
    expect(lines[1]).toContain("Total Score");
    // Data row
    expect(lines[2]).toContain("MDA");
    // Assumed vote gets asterisk
    expect(lines[3]).toContain("😐*");
  });

  it("formats Markdown with per-voter columns", () => {
    const output = formatResultsMarkdown(resultsData);
    expect(output).toContain("# ESC 2026 – Voting Results");
    expect(output).toContain("**Voters:** Alice, Bob");
    expect(output).toContain("| Alice | Bob |");
    // Notes section
    expect(output).toContain("## Notes");
    expect(output).toContain("Absolute banger!");
  });
});

describe("Filenames", () => {
  it("generates voter export filename with year and game ID prefix", () => {
    const fn = voterExportFilename(voterData, "json");
    expect(fn).toBe("esc2026_Alice_abc12345.json");
  });

  it("generates results export filename", () => {
    const fn = resultsExportFilename(resultsData, "csv");
    expect(fn).toBe("esc2026_results_def12345.csv");
  });

  it("generates markdown filename with .md extension", () => {
    const fn = voterExportFilename(voterData, "md");
    expect(fn).toBe("esc2026_Alice_abc12345.md");
  });

  it("sanitizes special characters in voter name", () => {
    const data = { ...voterData, voter: "Jean-Claude Van Damme" };
    const fn = voterExportFilename(data, "json");
    expect(fn).toBe("esc2026_Jean-Claude_Van_Damme_abc12345.json");
  });
});
