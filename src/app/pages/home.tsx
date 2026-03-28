import { getVoters, getSongs, getAllVotes } from "@/app/data";

export const Home = async () => {
  const [voters, songs, votes] = await Promise.all([
    getVoters(),
    getSongs(),
    getAllVotes(),
  ]);

  const totalSongs = songs.length;

  return (
    <main className="mx-auto max-w-xl px-6 py-8">
      <h1 className="text-3xl font-bold text-indigo-900">
        🎤 ESC Voting
      </h1>
      <p className="mt-1 text-mauve-600">
        Rate all {totalSongs} competing songs before the semi-finals air!
        Each person picks from five reactions for every country.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-mauve-900">Choose your voter profile</h2>

      {voters.length === 0 ? (
        <p className="mt-4 text-mauve-400">
          No voters found. Add voter names to the &quot;Voters&quot; table in Airtable.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {voters.map((voter) => {
            const voterVotes = votes.filter((v) => v.voter === voter.name);
            const rated = voterVotes.length;
            const allDone = rated === totalSongs && totalSongs > 0;
            return (
              <li key={voter.id}>
                <a
                  href={`/vote/${encodeURIComponent(voter.name)}`}
                  className="flex items-center justify-between rounded-xl border-2 border-mauve-200 px-5 py-4 no-underline transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <span className="text-lg font-semibold text-mauve-900">{voter.name}</span>
                  <span className={`text-sm ${allDone ? "text-green-600" : "text-mauve-500"}`}>
                    {rated}/{totalSongs} rated {allDone ? "✅" : ""}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {songs.length === 0 && (
        <p className="mt-8 text-mauve-400">
          No songs found. Add country entries to the &quot;Songs&quot; table in Airtable.
        </p>
      )}
    </main>
  );
};
