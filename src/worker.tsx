import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/home";
import { VotePage } from "@/app/pages/vote";
import { getEnv, runWithEnv } from "@/app/env-store";

export type AppContext = {
  env: Env;
};

const _app = defineApp([
  setCommonHeaders(),
  ({ ctx }) => {
    (ctx as AppContext).env = getEnv();
  },
  render(Document, [
    route("/", Home),
    route("/vote/:voterName", VotePage),
  ]),
]);

export default {
  fetch(request: Request, env: Env, cf: ExecutionContext): Promise<Response> {
    return runWithEnv(env, () => _app.fetch(request, env, cf));
  },
};
