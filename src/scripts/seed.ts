import { runSeed } from "@/app/seed";

/**
 * CLI seed script — run with: pnpm run seed
 * Uses the shared seed logic from src/app/seed.ts
 */
export default async () => {
  console.log("🌱 Seeding database…");
  const result = await runSeed();
  console.log(
    "✅ Seeding complete! Added %d songs and %d voters.",
    result.songs,
    result.voters,
  );
};
