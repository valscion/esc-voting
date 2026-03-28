import { getVoters, getSongs, getAllVotes } from "@/app/data";

export const Home = async () => {
  const [voters, songs, votes] = await Promise.all([
    getVoters(),
    getSongs(),
    getAllVotes(),
  ]);

  const totalSongs = songs.length;

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-3xl font-bold text-indigo-300">
        🎤 ESC Voting
      </h1>
      <p className="mt-2 text-gray-400">
        Rate all {totalSongs} competing songs before the semi-finals air!
        Each person picks from five reactions for every country.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-gray-200">Choose your voter profile</h2>

      {voters.length === 0 ? (
        <p className="mt-4 text-gray-500">
          No voters found. Run the seed script to add voters.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {voters.map((voter) => {
            const voterVotes = votes.filter((v) => v.voter === voter.name);
            const rated = voterVotes.length;
            const allDone = rated === totalSongs && totalSongs > 0;
            return (
              <li key={voter.id}>
                <a
                  href={`/vote/${encodeURIComponent(voter.name)}`}
                  className="flex items-center justify-between rounded-2xl border border-gray-800 bg-gray-900 px-5 py-4 no-underline transition-all hover:border-indigo-500 hover:bg-gray-800/80"
                >
                  <span className="text-lg font-semibold text-gray-100">{voter.name}</span>
                  <span className={`text-sm font-medium ${allDone ? "text-emerald-400" : "text-gray-500"}`}>
                    {rated}/{totalSongs} rated {allDone ? "✅" : ""}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {songs.length === 0 && (
        <p className="mt-8 text-gray-500">
          No songs found. Run the seed script to add songs.
        </p>
      )}
    </main>
  );
};
