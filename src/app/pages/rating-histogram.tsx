import { RATINGS, type RatingEmoji, type Song } from "@/app/shared/constants";

const ALL_EMOJIS = Object.keys(RATINGS) as RatingEmoji[];

interface RatingHistogramProps {
  votes: Record<string, RatingEmoji>;
  songs: readonly Song[];
  total: number;
}

export function RatingHistogram({ votes, songs, total }: RatingHistogramProps) {
  // Build a map from country code → flag
  const flagByCode: Record<string, string> = {};
  for (const song of songs) {
    flagByCode[song.code] = song.flag;
  }

  // Group flags by emoji rating
  const flagsByEmoji: Record<RatingEmoji, string[]> = {
    "🤩": [],
    "😁": [],
    "😐": [],
    "😴": [],
    "🤮": [],
  };

  for (const [code, emoji] of Object.entries(votes)) {
    const flag = flagByCode[code];
    if (flag) {
      flagsByEmoji[emoji].push(flag);
    }
  }

  const maxCount = Math.max(
    ...ALL_EMOJIS.map((e) => flagsByEmoji[e].length),
    1,
  );

  return (
    <div className="mt-8 rounded-2xl bg-gray-900 px-5 py-4 ring-1 ring-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-400">
        Rating distribution
      </h2>
      <div className="space-y-3">
        {ALL_EMOJIS.map((emoji) => {
          const flags = flagsByEmoji[emoji];
          const count = flags.length;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const barPct = (count / maxCount) * 100;

          return (
            <div key={emoji}>
              <div className="flex items-center gap-2">
                <span
                  className="w-8 shrink-0 text-center text-lg"
                  title={RATINGS[emoji]}
                >
                  {emoji}
                </span>
                <div className="h-5 min-w-0 flex-1 overflow-hidden rounded bg-gray-800">
                  {barPct > 0 && (
                    <div
                      className="h-full rounded bg-indigo-500/60"
                      style={{ width: `${barPct}%` }}
                    />
                  )}
                </div>
                <span className="w-14 shrink-0 text-right text-xs text-gray-500">
                  {count}/{total}
                  {total > 0 && (
                    <span className="ml-0.5 text-gray-600">
                      ({Math.round(pct)}%)
                    </span>
                  )}
                </span>
              </div>
              {flags.length > 0 && (
                <div className="mt-1 ml-10 flex flex-wrap gap-0.5 text-sm leading-tight">
                  {flags.map((flag, i) => (
                    <span key={`${flag}-${i}`}>{flag}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
