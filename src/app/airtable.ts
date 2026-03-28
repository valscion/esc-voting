/**
 * Airtable integration for ESC Voting app.
 *
 * Expected Airtable base structure:
 *
 * Table: "Songs"
 *   - Country (Single line text) - e.g. "Finland"
 *   - Artist (Single line text) - e.g. "Windows95man"
 *   - Song (Single line text) - e.g. "No Rules!"
 *   - Flag (Single line text) - e.g. "🇫🇮"
 *   - RunningOrder (Number) - running order within the contest
 *
 * Table: "Voters"
 *   - Name (Single line text) - e.g. "Alice"
 *
 * Table: "Votes"
 *   - Voter (Single line text) - voter name
 *   - Country (Single line text) - country name
 *   - Rating (Single line text) - one of the RATINGS emoji keys
 */

export const RATINGS = {
  "🔥": "Fire – absolute banger",
  "❤️": "Heart – really love it",
  "😊": "Smile – it's good",
  "😐": "Meh – not feeling it",
  "💀": "Dead – please no",
} as const;

export type RatingEmoji = keyof typeof RATINGS;

export interface Song {
  id: string;
  country: string;
  artist: string;
  song: string;
  flag: string;
  runningOrder: number;
}

export interface Voter {
  id: string;
  name: string;
}

export interface Vote {
  id: string;
  voter: string;
  country: string;
  rating: RatingEmoji;
}

function getAirtableConfig(env: { AIRTABLE_API_KEY: string; AIRTABLE_BASE_ID: string }) {
  return {
    apiKey: env.AIRTABLE_API_KEY,
    baseId: env.AIRTABLE_BASE_ID,
    baseUrl: `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}`,
  };
}

async function airtableFetch(
  env: { AIRTABLE_API_KEY: string; AIRTABLE_BASE_ID: string },
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const config = getAirtableConfig(env);
  const url = `${config.baseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Airtable error ${response.status}: ${text}`);
  }
  return response;
}

export async function getSongs(
  env: { AIRTABLE_API_KEY: string; AIRTABLE_BASE_ID: string },
): Promise<Song[]> {
  const response = await airtableFetch(env, "/Songs?sort%5B0%5D%5Bfield%5D=RunningOrder&sort%5B0%5D%5Bdirection%5D=asc");
  const data = (await response.json()) as {
    records: Array<{
      id: string;
      fields: {
        Country?: string;
        Artist?: string;
        Song?: string;
        Flag?: string;
        RunningOrder?: number;
      };
    }>;
  };
  return data.records.map((r) => ({
    id: r.id,
    country: r.fields.Country ?? "",
    artist: r.fields.Artist ?? "",
    song: r.fields.Song ?? "",
    flag: r.fields.Flag ?? "🏳️",
    runningOrder: r.fields.RunningOrder ?? 0,
  }));
}

export async function getVoters(
  env: { AIRTABLE_API_KEY: string; AIRTABLE_BASE_ID: string },
): Promise<Voter[]> {
  const response = await airtableFetch(env, "/Voters?sort%5B0%5D%5Bfield%5D=Name&sort%5B0%5D%5Bdirection%5D=asc");
  const data = (await response.json()) as {
    records: Array<{ id: string; fields: { Name?: string } }>;
  };
  return data.records.map((r) => ({
    id: r.id,
    name: r.fields.Name ?? "",
  }));
}

export async function getVotesForVoter(
  env: { AIRTABLE_API_KEY: string; AIRTABLE_BASE_ID: string },
  voterName: string,
): Promise<Vote[]> {
  const filter = encodeURIComponent(`{Voter}="${voterName}"`);
  const response = await airtableFetch(env, `/Votes?filterByFormula=${filter}`);
  const data = (await response.json()) as {
    records: Array<{
      id: string;
      fields: { Voter?: string; Country?: string; Rating?: string };
    }>;
  };
  return data.records.map((r) => ({
    id: r.id,
    voter: r.fields.Voter ?? "",
    country: r.fields.Country ?? "",
    rating: (r.fields.Rating ?? "😐") as RatingEmoji,
  }));
}

export async function upsertVote(
  env: { AIRTABLE_API_KEY: string; AIRTABLE_BASE_ID: string },
  voter: string,
  country: string,
  rating: RatingEmoji,
): Promise<void> {
  // Check if a vote already exists for this voter+country pair
  const filter = encodeURIComponent(`AND({Voter}="${voter}",{Country}="${country}")`);
  const response = await airtableFetch(env, `/Votes?filterByFormula=${filter}`);
  const data = (await response.json()) as {
    records: Array<{ id: string }>;
  };

  if (data.records.length > 0) {
    // Update existing vote
    const recordId = data.records[0].id;
    await airtableFetch(env, `/Votes/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify({
        fields: { Rating: rating },
      }),
    });
  } else {
    // Create new vote
    await airtableFetch(env, "/Votes", {
      method: "POST",
      body: JSON.stringify({
        fields: { Voter: voter, Country: country, Rating: rating },
      }),
    });
  }
}

export async function getAllVotes(
  env: { AIRTABLE_API_KEY: string; AIRTABLE_BASE_ID: string },
): Promise<Vote[]> {
  const response = await airtableFetch(env, "/Votes");
  const data = (await response.json()) as {
    records: Array<{
      id: string;
      fields: { Voter?: string; Country?: string; Rating?: string };
    }>;
  };
  return data.records.map((r) => ({
    id: r.id,
    voter: r.fields.Voter ?? "",
    country: r.fields.Country ?? "",
    rating: (r.fields.Rating ?? "😐") as RatingEmoji,
  }));
}
