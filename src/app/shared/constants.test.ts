import { describe, it, expect } from "vitest";
import {
  getSongsForYear,
  ESC_SONGS_BY_YEAR,
  DEFAULT_ESC_YEAR,
  type CountryCode,
  type Song,
} from "./constants";

describe("getSongsForYear", () => {
  it("returns songs for a known year", () => {
    const songs = getSongsForYear(2026);
    expect(songs.length).toBe(35);
  });

  it("returns an empty array for an unknown year", () => {
    expect(getSongsForYear(1999)).toEqual([]);
  });

  it("returns the same data for DEFAULT_ESC_YEAR", () => {
    const songs = getSongsForYear(DEFAULT_ESC_YEAR);
    expect(songs.length).toBeGreaterThan(0);
  });
});

describe("ESC_SONGS_BY_YEAR", () => {
  it("has at least one year of data", () => {
    const years = Object.keys(ESC_SONGS_BY_YEAR).map(Number);
    expect(years.length).toBeGreaterThanOrEqual(1);
  });

  for (const [yearStr, songs] of Object.entries(ESC_SONGS_BY_YEAR)) {
    const year = Number(yearStr);

    describe(`year ${year}`, () => {
      it("has unique country codes", () => {
        const codes = songs.map((s) => s.code);
        expect(new Set(codes).size).toBe(codes.length);
      });

      it("has unique country names", () => {
        const names = songs.map((s) => s.country);
        expect(new Set(names).size).toBe(names.length);
      });

      it("every song has all required fields", () => {
        for (const song of songs) {
          expect(song.code).toBeTruthy();
          expect(song.country).toBeTruthy();
          expect(song.artist).toBeTruthy();
          expect(song.song).toBeTruthy();
          expect(song.flag).toBeTruthy();
          expect(song.youtubeId).toBeTruthy();
          expect(song.durationSec).toBeGreaterThan(0);
          expect([1, 2]).toContain(song.semifinal);
          expect([1, 2]).toContain(song.semifinalHalf);
        }
      });

      it("every country code is a 3-letter uppercase string", () => {
        for (const song of songs) {
          expect(song.code).toMatch(/^[A-Z]{3}$/);
        }
      });
    });
  }
});

describe("CountryCode type", () => {
  it("is assignable from song codes returned by getSongsForYear", () => {
    const songs = getSongsForYear(2026);
    // Ensure each code is assignable to CountryCode at runtime
    const codes: CountryCode[] = songs.map((s) => s.code);
    expect(codes.length).toBe(35);
  });

  it("Song type has code typed as CountryCode", () => {
    const song: Song = getSongsForYear(2026)[0];
    const code: CountryCode = song.code;
    expect(code).toBe("MDA");
  });
});
