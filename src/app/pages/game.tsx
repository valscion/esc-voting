import {
  getGameByToken,
  getVoters,
  getAllVotes,
} from "@/app/data";
import { getSongsForYear } from "@/app/shared/constants";

export const GamePage = async ({
  params,
}: {
  params: { token: string };
}) => {
  const { token } = params;
  const game = await getGameByToken(token);

  if (!game) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10">
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

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-3xl font-bold text-indigo-300">🎤 ESC Voting</h1>
      <p className="mt-2 text-gray-400">
        Rate all {totalSongs} competing songs before the semi-finals air! Each
        person picks from five reactions for every country.
      </p>

      {game.closed ? (
        <div className="mt-4 rounded-2xl bg-amber-950/50 px-5 py-3 text-sm font-medium text-amber-300 ring-1 ring-amber-800">
          🔒 Voting is closed for this game.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-gray-900 px-5 py-3 text-sm text-gray-400 ring-1 ring-gray-800">
          Share this link with your friends:{" "}
          <span className="font-mono text-indigo-300">/{token}</span>
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold text-gray-200">
        Choose your voter profile
      </h2>

      <ul className="mt-5 flex flex-col gap-3">
        {voters.map((voter) => {
          const voterVotes = votes.filter((v) => v.voter === voter.name);
          const rated = voterVotes.length;
          const allDone = rated === totalSongs && totalSongs > 0;
          return (
            <li key={voter.id}>
              <a
                href={`/${token}/votes/${encodeURIComponent(voter.name)}`}
                className="flex items-center justify-between rounded-2xl border border-gray-800 bg-gray-900 px-5 py-4 no-underline transition-all hover:border-indigo-500 hover:bg-gray-800/80"
              >
                <span className="text-lg font-semibold text-gray-100">
                  {voter.name}
                </span>
                <span
                  className={`text-sm font-medium ${allDone ? "text-emerald-400" : "text-gray-500"}`}
                >
                  {rated}/{totalSongs} rated {allDone ? "✅" : ""}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 border-t border-gray-800 pt-6">
        <a
          href={`/${token}/dashboard`}
          className="inline-flex items-center gap-2 rounded-2xl border border-indigo-700 bg-indigo-950/40 px-5 py-2.5 text-sm font-medium text-indigo-300 no-underline transition-all hover:bg-indigo-950/70"
        >
          📺 Open dashboard
        </a>
      </div>
    </main>
  );
};
