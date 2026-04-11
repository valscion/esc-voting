import { getGameByToken, getSongs } from "@/app/data";
import { TVPlayer } from "./tv-player";

export const TVDisplayPage = async ({
  params,
}: {
  params: { token: string };
}) => {
  const { token } = params;
  const game = await getGameByToken(token);

  if (!game) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-950 text-gray-400">
        <p className="text-xl">Game not found.</p>
      </div>
    );
  }

  const songs = await getSongs(game.id);

  return (
    <TVPlayer
      gameId={game.id}
      songs={songs.map((s) => ({
        country: s.country,
        youtubeId: s.youtubeId,
        flag: s.flag,
        artist: s.artist,
        song: s.song,
      }))}
      montageYoutubeId={game.montageYoutubeId ?? ""}
    />
  );
};
