import { describe, it, expect } from "vitest";
import {
  getSongsForYear,
  ESC_SONGS_BY_YEAR,
  ESC_MONTAGE_DATA,
  DEFAULT_ESC_YEAR,
  sortSongsByMontageOrder,
  hasMontageData,
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

describe("sortSongsByMontageOrder", () => {
  it("sorts songs to match the montage timestamp order for a known year", () => {
    const songs = getSongsForYear(2026);
    const sorted = sortSongsByMontageOrder(songs, 2026);
    const montageCountries = ESC_MONTAGE_DATA[2026].timestamps.map(
      (t) => t.country,
    );

    const sortedCountries = sorted.map((s) => s.country);
    expect(sortedCountries).toEqual(montageCountries);
  });

  it("returns the original array unchanged for an unknown year", () => {
    const songs = getSongsForYear(2026);
    const sorted = sortSongsByMontageOrder(songs, 1999);
    expect(sorted).toBe(songs);
  });

  it("does not mutate the original array", () => {
    const songs = getSongsForYear(2026);
    const originalOrder = songs.map((s) => s.country);
    sortSongsByMontageOrder(songs, 2026);
    expect(songs.map((s) => s.country)).toEqual(originalOrder);
  });

  it("places songs not in montage data at the end", () => {
    const fakeSongs = [
      { country: "Atlantis" },
      { country: "Albania" },
      { country: "Armenia" },
    ] as const;
    const sorted = sortSongsByMontageOrder(fakeSongs, 2026);
    expect(sorted.map((s) => s.country)).toEqual([
      "Albania",
      "Armenia",
      "Atlantis",
    ]);
  });

  it("works with an empty array", () => {
    const sorted = sortSongsByMontageOrder([], 2026);
    expect(sorted).toEqual([]);
  });
});

describe("hasMontageData", () => {
  it("returns true for a year with montage data", () => {
    expect(hasMontageData(2026)).toBe(true);
  });

  it("returns false for a year without montage data", () => {
    expect(hasMontageData(1999)).toBe(false);
  });
});
