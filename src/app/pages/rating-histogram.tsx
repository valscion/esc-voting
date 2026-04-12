import { RATINGS, type RatingEmoji } from "@/app/shared/constants";

const ALL_EMOJIS = Object.keys(RATINGS) as RatingEmoji[];

interface RatingHistogramProps {
  votes: Record<string, RatingEmoji>;
  total: number;
}

export function RatingHistogram({ votes, total }: RatingHistogramProps) {
  const counts: Record<RatingEmoji, number> = {
    "🤩": 0,
    "😁": 0,
    "😐": 0,
    "😴": 0,
    "🤮": 0,
  };

  for (const emoji of Object.values(votes)) {
    counts[emoji]++;
  }

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className="mt-8 rounded-2xl bg-gray-900 px-5 py-4 ring-1 ring-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-400">
        Rating distribution
      </h2>
      <div className="space-y-2">
        {ALL_EMOJIS.map((emoji) => {
          const count = counts[emoji];
          const pct = total > 0 ? (count / total) * 100 : 0;
          const barPct = (count / maxCount) * 100;

          return (
            <div key={emoji} className="flex items-center gap-2">
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
          );
        })}
      </div>
    </div>
  );
}
