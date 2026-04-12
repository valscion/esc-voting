import {
  getGameByToken,
  getVotesForVoter,
  getAssumedVotesForVoter,
  RATINGS,
  type RatingEmoji,
} from "@/app/data";
import { getSongsForYear } from "@/app/shared/constants";
import { VoteSongList } from "./vote-song-list";

export const VotePage = async ({
  params,
}: {
  params: { token: string; voterName: string };
}) => {
  const { token } = params;
  const voterName = decodeURIComponent(params.voterName);
  const game = await getGameByToken(token);

  if (!game) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-red-400">Game not found</h1>
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

  const isClosed = !!game.closed;

  const songs = getSongsForYear(game.escYear);
  const votes = await getVotesForVoter(game.id, voterName);

  const voteRecord: Record<string, RatingEmoji> = {};
  for (const v of votes) {
    voteRecord[v.country] = v.rating;
  }

  // When the game is closed, compute assumed votes for unrated songs
  const assumedVotes: Record<string, RatingEmoji> = isClosed
    ? await getAssumedVotesForVoter(game.id, voterName, game.escYear)
    : {};

  const rated = votes.length;
  const total = songs.length;
  const allDone = rated === total && total > 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-8">
        <a
          href={`/${token}`}
          className="text-sm text-gray-400 no-underline transition-colors hover:text-indigo-400"
        >
          ← Back to voter list
        </a>
      </nav>

      <h1 className="text-2xl font-bold text-indigo-300">
        🎤 {voterName}&apos;s Votes
      </h1>
      <p className="mt-2 text-gray-400">
        {isClosed
          ? "Voting is closed. Results are shown below."
          : "Rate each competing country using the five reactions below."}
      </p>

      {!isClosed && (
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
          {(Object.entries(RATINGS) as [RatingEmoji, string][]).map(
            ([emoji, label]) => (
              <span key={emoji}>
                {emoji} {label}
              </span>
            ),
          )}
        </div>
      )}

      <div
        className={`mt-5 rounded-2xl px-5 py-3 text-sm font-medium ${
          allDone
            ? "bg-emerald-950/50 text-emerald-300 ring-1 ring-emerald-800"
            : "bg-gray-900 text-gray-400 ring-1 ring-gray-800"
        }`}
      >
        {rated}/{total} countries rated {allDone ? "🎉 All done!" : ""}
      </div>

      {isClosed && (
        <div className="mt-3 rounded-2xl bg-amber-950/50 px-5 py-3 text-sm font-medium text-amber-300 ring-1 ring-amber-800">
          🔒 Voting is closed – results are read-only.
        </div>
      )}

      <VoteSongList
        gameId={game.id}
        songs={songs}
        voterName={voterName}
        votes={voteRecord}
        assumedVotes={assumedVotes}
        isClosed={isClosed}
      />

      {songs.length === 0 && (
        <p className="mt-8 text-gray-500">No songs found.</p>
      )}
    </main>
  );
};
