import { env } from "cloudflare:workers";
import { type Database, createDb } from "rwsdk/db";
import { type migrations } from "@/db/migrations";

export type AppDatabase = Database<typeof migrations>;
export type GameRow = AppDatabase["games"];
export type SongRow = AppDatabase["songs"];
export type VoterRow = AppDatabase["voters"];
export type VoteRow = AppDatabase["votes"];

export const db = createDb<AppDatabase>(env.DATABASE, "esc-voting-db");
