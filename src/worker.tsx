import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/home";
import { VotePage } from "@/app/pages/vote";

export { Database } from "@/db/durableObject";

export default defineApp([
  setCommonHeaders(),
  render(Document, [
    route("/", Home),
    route("/vote/:voterName", VotePage),
  ]),
]);
