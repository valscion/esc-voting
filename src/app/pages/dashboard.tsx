import { getGameByToken, getResultsByScore, getVoters, getAllVotes } from "@/app/data";
import { getSongsForYear } from "@/app/shared/constants";
import { DashboardControls } from "./dashboard-controls";
import { GameControls } from "./game-controls";
import { ResultsReveal } from "./results-reveal";

export const DashboardPage = async ({
  params,
}: {
  params: { token: string };
}) => {
  const { token } = params;
  const game = await getGameByToken(token);

  if (!game) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold text-red-400">Game not found</h1>
        <p className="mt-2 text-gray-400">
          This game doesn&apos;t exist or has been deleted.
        </p>
        <a
          href="/"
          className="mt-6 inline-block text-sm text-indigo-400 no-underline hover:text-indigo-300"
        >
          ← Create a new game
        </a>
      </main>
    );
  }

  const songs = getSongsForYear(game.escYear);
  const [voters, votes] = await Promise.all([
    getVoters(game.id),
    getAllVotes(game.id),
  ]);
  const totalSongs = songs.length;

  // Build a map of voter name → vote count for efficient lookup
  const voteCountByVoter = new Map<string, number>();
  for (const v of votes) {
    voteCountByVoter.set(v.voter, (voteCountByVoter.get(v.voter) ?? 0) + 1);
  }
  const hideDeleteButton =
    voters.length >= 4 &&
    totalSongs > 0 &&
    voters.every(
      (voter) => (voteCountByVoter.get(voter.name) ?? 0) >= totalSongs,
    );

  if (game.closed) {
    const results = await getResultsByScore(game.id, game.escYear);
    return (
      <main>
        <ResultsReveal token={token} results={results} />
        <div className="mx-auto max-w-4xl px-6 pb-10">
          <GameControls token={token} closed={true} hideDeleteButton={hideDeleteButton} />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <nav className="mb-8">
        <a
          href={`/${token}`}
          className="text-sm text-gray-400 no-underline transition-colors hover:text-indigo-400"
        >
          ← Back to game
        </a>
      </nav>

      <h1 className="text-3xl font-bold text-indigo-300">📺 Song Dashboard</h1>
      <p className="mt-2 text-gray-400">
        Select the song currently being played. All connected voters will see
        the active song highlighted in real time.
      </p>
      <p className="mt-2">
        <a
          href={`/${token}/tv`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-400 no-underline transition-colors hover:text-indigo-300"
        >
          📺 Open TV Display
        </a>
        <span className="ml-2 text-xs text-gray-600">
          — Open this on your TV screen
        </span>
      </p>

      <DashboardControls
        gameId={game.id}
        songs={songs.map((s) => ({
          code: s.code,
          country: s.country,
          artist: s.artist,
          song: s.song,
          flag: s.flag,
          youtubeId: s.youtubeId,
          durationSec: s.durationSec,
          semifinal: s.semifinal,
          semifinalHalf: s.semifinalHalf,
        }))}
        escYear={game.escYear}
      />

      <GameControls token={token} closed={false} hideDeleteButton={hideDeleteButton} />
    </main>
  );
};
