import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/home";
import { VotePage } from "@/app/pages/vote";
import { runSeed } from "@/app/seed";

export { Database } from "@/db/durableObject";

const app = defineApp([
  setCommonHeaders(),
  render(Document, [
    route("/", Home),
    route("/vote/:voterName", VotePage),
  ]),
]);

async function handleSeed(
  request: Request,
  workerEnv: Env,
): Promise<Response> {
  const secret = workerEnv.SEED_SECRET;
  if (!secret) {
    if (!import.meta.env.VITE_IS_DEV_SERVER) {
      return Response.json(
        { error: "SEED_SECRET not configured" },
        { status: 403 },
      );
    }
    // In dev mode, allow unauthenticated seeding
  } else {
    const auth = request.headers.get("Authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runSeed();
    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export default {
  async fetch(
    request: Request,
    workerEnv: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/seed" && request.method === "POST") {
      return handleSeed(request, workerEnv);
    }

    return app.fetch(request, workerEnv, ctx);
  },
};
