import { SqliteDurableObject } from "rwsdk/db";
import { migrations } from "@/db/migrations";

export class Database extends SqliteDurableObject {
  migrations = migrations;

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env, migrations);
    // Ensure migrations run before any request is processed.
    // Without this, there's a race between the lazy initialize() call
    // and the first query, which can cause "no such table" errors.
    ctx.blockConcurrencyWhile(async () => {
      await this.initialize();
    });
  }
}

