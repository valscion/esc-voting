import { env } from "cloudflare:workers";
import { render, route } from "rwsdk/router";
import {
  SyncedStateServer,
  syncedStateRoutes,
} from "rwsdk/use-synced-state/worker";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/home";
import { GamePage } from "@/app/pages/game";
import { VotePage } from "@/app/pages/vote";
import { DashboardPage } from "@/app/pages/dashboard";
import { TVDisplayPage } from "@/app/pages/tv-display";

export { Database } from "@/db/durableObject";
export { SyncedStateServer };

export default defineApp([
  setCommonHeaders(),
  ...syncedStateRoutes(() => env.SYNCED_STATE_SERVER),
  render(Document, [
    route("/", Home),
    route("/:token", GamePage),
    route("/:token/votes/:voterName", VotePage),
    route("/:token/dashboard", DashboardPage),
    route("/:token/tv", TVDisplayPage),
  ]),
]);
