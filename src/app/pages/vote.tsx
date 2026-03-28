import { getSongs, getVotesForVoter, RATINGS, type RatingEmoji } from "@/app/airtable";
import type { AppContext } from "@/worker";
import { RatingButtons } from "./rating-buttons";

export const VotePage = async ({
  ctx,
  params,
}: {
  ctx: AppContext;
  params: { voterName: string };
}) => {
  const voterName = decodeURIComponent(params.voterName);
  const [songs, votes] = await Promise.all([
    getSongs(ctx.env),
    getVotesForVoter(ctx.env, voterName),
  ]);

  const voteMap = new Map<string, RatingEmoji>(
    votes.map((v) => [v.country, v.rating]),
  );

  const rated = votes.length;
  const total = songs.length;
  const allDone = rated === total && total > 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <nav className="mb-6">
        <a href="/" className="text-sm text-mauve-500 no-underline hover:text-indigo-600">
          ← Back to voter list
        </a>
      </nav>

      <h1 className="text-2xl font-bold text-indigo-900">
        🎤 {voterName}&apos;s Votes
      </h1>
      <p className="mt-1 text-mauve-600">
        Rate each competing country using the five reactions below.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-mauve-500">
        {(Object.entries(RATINGS) as [RatingEmoji, string][]).map(
          ([emoji, label]) => (
            <span key={emoji}>
              {emoji} {label}
            </span>
          ),
        )}
      </div>

      <div
        className={`mt-4 rounded-lg px-4 py-2 text-sm ${
          allDone
            ? "bg-green-100 text-green-800"
            : "bg-mauve-100 text-mauve-600"
        }`}
      >
        {rated}/{total} countries rated{" "}
        {allDone ? "🎉 All done!" : ""}
      </div>

      <ul className="mt-4">
        {songs.map((song) => {
          const currentRating = voteMap.get(song.country);
          return (
            <li
              key={song.id}
              className="flex items-center justify-between gap-4 border-b border-mauve-100 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-mauve-900">
                  {song.flag} {song.country}
                </div>
                <div className="truncate text-sm text-mauve-500">
                  {song.artist} – {song.song}
                </div>
              </div>
              <RatingButtons
                voterName={voterName}
                country={song.country}
                currentRating={currentRating}
              />
            </li>
          );
        })}
      </ul>

      {songs.length === 0 && (
        <p className="mt-8 text-mauve-400">
          No songs found. Add country entries to the &quot;Songs&quot; table in
          Airtable.
        </p>
      )}
    </main>
  );
};
