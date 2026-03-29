import {
  getGameByToken,
  getSongs,
  getVotesForVoter,
  RATINGS,
  type RatingEmoji,
} from "@/app/data";
import { RatingButtons } from "./rating-buttons";

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

  const [songs, votes] = await Promise.all([
    getSongs(game.id),
    getVotesForVoter(game.id, voterName),
  ]);

  const voteMap = new Map<string, RatingEmoji>(
    votes.map((v) => [v.country, v.rating]),
  );

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

      <ul className="mt-6">
        {songs.map((song) => {
          const currentRating = voteMap.get(song.country);
          return (
            <li
              key={song.id}
              className="flex items-center justify-between gap-4 border-b border-gray-800/60 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-100">
                  {song.flag} {song.country}
                </div>
                <div className="truncate text-sm text-gray-500">
                  {song.artist} – {song.song}
                </div>
              </div>
              <RatingButtons
                gameId={game.id}
                voterName={voterName}
                country={song.country}
                currentRating={currentRating}
                readOnly={isClosed}
              />
            </li>
          );
        })}
      </ul>

      {songs.length === 0 && (
        <p className="mt-8 text-gray-500">No songs found.</p>
      )}
    </main>
  );
};
