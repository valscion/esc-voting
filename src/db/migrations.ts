import { type Migrations } from "rwsdk/db";

export const migrations = {
  "001_initial_schema": {
    async up(db) {
      return [
        await db.schema
          .createTable("games")
          .ifNotExists()
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("token", "text", (col) => col.notNull().unique())
          .addColumn("closed", "integer", (col) => col.notNull().defaultTo(0))
          .addColumn("created_at", "text", (col) => col.notNull())
          .execute(),

        await db.schema
          .createTable("songs")
          .ifNotExists()
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("game_id", "text", (col) => col.notNull())
          .addColumn("country", "text", (col) => col.notNull())
          .addColumn("artist", "text", (col) => col.notNull())
          .addColumn("song", "text", (col) => col.notNull())
          .addColumn("flag", "text", (col) => col.notNull().defaultTo("🏳️"))
          .addColumn("runningOrder", "integer", (col) =>
            col.notNull().defaultTo(0),
          )
          .execute(),

        await db.schema
          .createTable("voters")
          .ifNotExists()
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("game_id", "text", (col) => col.notNull())
          .addColumn("name", "text", (col) => col.notNull())
          .addUniqueConstraint("voters_game_id_name_unique", [
            "game_id",
            "name",
          ])
          .execute(),

        await db.schema
          .createTable("votes")
          .ifNotExists()
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("game_id", "text", (col) => col.notNull())
          .addColumn("voterName", "text", (col) => col.notNull())
          .addColumn("country", "text", (col) => col.notNull())
          .addColumn("rating", "text", (col) => col.notNull())
          .execute(),
      ];
    },

    async down(db) {
      await db.schema.dropTable("votes").ifExists().execute();
      await db.schema.dropTable("voters").ifExists().execute();
      await db.schema.dropTable("songs").ifExists().execute();
      await db.schema.dropTable("games").ifExists().execute();
    },
  },

  "002_ensure_games_table": {
    async up(db) {
      // The games table may be missing if 001_initial_schema was recorded
      // as applied by a previous deployment that didn't include it.
      return [
        await db.schema
          .createTable("games")
          .ifNotExists()
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("token", "text", (col) => col.notNull().unique())
          .addColumn("closed", "integer", (col) => col.notNull().defaultTo(0))
          .addColumn("created_at", "text", (col) => col.notNull())
          .execute(),
      ];
    },

    async down(db) {
      // Don't drop games in down — 001 already handles that
    },
  },
  "003_add_youtube_and_duration": {
    async up(db) {
      return [
        await db.schema
          .alterTable("songs")
          .addColumn("youtubeId", "text", (col) => col.notNull().defaultTo(""))
          .execute(),

        await db.schema
          .alterTable("songs")
          .addColumn("durationSec", "integer", (col) =>
            col.notNull().defaultTo(0),
          )
          .execute(),
      ];
    },

    async down(db) {
      await db.schema.alterTable("songs").dropColumn("youtubeId").execute();
      await db.schema.alterTable("songs").dropColumn("durationSec").execute();
    },
  },
  "004_add_montage_youtube_id": {
    async up(db) {
      return [
        await db.schema
          .alterTable("games")
          .addColumn("montageYoutubeId", "text", (col) =>
            col.notNull().defaultTo(""),
          )
          .execute(),
      ];
    },

    async down(db) {
      await db.schema
        .alterTable("games")
        .dropColumn("montageYoutubeId")
        .execute();
    },
  },
} satisfies Migrations;
