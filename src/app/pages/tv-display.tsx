import { getGameByToken } from "@/app/data";
import { ESC_MONTAGE_DATA, getSongsForYear } from "@/app/shared/constants";
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

  const songs = getSongsForYear(game.escYear);
  const montageData = ESC_MONTAGE_DATA[game.escYear];

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
      montageYoutubeId={montageData?.youtubeId ?? ""}
      montageTimestamps={montageData?.timestamps ?? []}
    />
  );
};
