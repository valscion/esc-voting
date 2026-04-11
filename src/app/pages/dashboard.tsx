import { getGameByToken, getSongs } from "@/app/data";
import { DashboardControls } from "./dashboard-controls";

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

  const songs = await getSongs(game.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
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

      <DashboardControls
        gameId={game.id}
        songs={songs.map((s) => ({
          country: s.country,
          artist: s.artist,
          song: s.song,
          flag: s.flag,
        }))}
      />
    </main>
  );
};
