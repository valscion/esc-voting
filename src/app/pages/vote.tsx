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

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        maxWidth: "700px",
        margin: "0 auto",
        padding: "1.5rem",
      }}
    >
      <nav style={{ marginBottom: "1.5rem" }}>
        <a href="/" style={{ color: "#666", textDecoration: "none", fontSize: "0.9rem" }}>
          ← Back to voter list
        </a>
      </nav>

      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>
        🎤 {voterName}&apos;s Votes
      </h1>
      <p style={{ color: "#666", marginBottom: "0.5rem" }}>
        Rate each competing country using the five reactions below.
      </p>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
          fontSize: "0.85rem",
          color: "#555",
        }}
      >
        {(Object.entries(RATINGS) as [RatingEmoji, string][]).map(
          ([emoji, label]) => (
            <span key={emoji}>
              {emoji} {label}
            </span>
          ),
        )}
      </div>

      <div
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          background: rated === total && total > 0 ? "#dcfce7" : "#f5f5f5",
          borderRadius: "8px",
          fontSize: "0.9rem",
          color: rated === total && total > 0 ? "#166534" : "#555",
        }}
      >
        {rated}/{total} countries rated{" "}
        {rated === total && total > 0 ? "🎉 All done!" : ""}
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {songs.map((song) => {
          const currentRating = voteMap.get(song.country);
          return (
            <li
              key={song.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 0",
                borderBottom: "1px solid #f0f0f0",
                gap: "1rem",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>
                  {song.flag} {song.country}
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: "0.85rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
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
        <p style={{ color: "#999", marginTop: "2rem" }}>
          No songs found. Add country entries to the &quot;Songs&quot; table in
          Airtable.
        </p>
      )}
    </main>
  );
};
