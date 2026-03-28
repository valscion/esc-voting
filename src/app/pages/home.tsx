import { getVoters, getSongs, getAllVotes } from "@/app/airtable";
import type { AppContext } from "@/worker";

export const Home = async ({ ctx }: { ctx: AppContext }) => {
  const [voters, songs, votes] = await Promise.all([
    getVoters(ctx.env),
    getSongs(ctx.env),
    getAllVotes(ctx.env),
  ]);

  const totalSongs = songs.length;

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>
        🎤 ESC Voting
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Rate all {totalSongs} competing songs before the semi-finals air!
        Each person picks from five reactions for every country.
      </p>

      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Choose your voter profile</h2>

      {voters.length === 0 ? (
        <p style={{ color: "#999" }}>
          No voters found. Add voter names to the &quot;Voters&quot; table in Airtable.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {voters.map((voter) => {
            const voterVotes = votes.filter((v) => v.voter === voter.name);
            const rated = voterVotes.length;
            return (
              <li key={voter.id}>
                <a
                  href={`/vote/${encodeURIComponent(voter.name)}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{voter.name}</span>
                  <span style={{ color: rated === totalSongs && totalSongs > 0 ? "#22c55e" : "#888", fontSize: "0.9rem" }}>
                    {rated}/{totalSongs} rated {rated === totalSongs && totalSongs > 0 ? "✅" : ""}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {songs.length === 0 && (
        <p style={{ color: "#999", marginTop: "2rem" }}>
          No songs found. Add country entries to the &quot;Songs&quot; table in Airtable.
        </p>
      )}
    </main>
  );
};
