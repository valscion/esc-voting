import { type Migrations } from "rwsdk/db";

export const migrations = {
  "001_initial_schema": {
    async up(db) {
      return [
        await db.schema
          .createTable("songs")
          .addColumn("id", "text", (col) => col.primaryKey())
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
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("name", "text", (col) => col.notNull().unique())
          .execute(),

        await db.schema
          .createTable("votes")
          .addColumn("id", "text", (col) => col.primaryKey())
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
    },
  },
} satisfies Migrations;
