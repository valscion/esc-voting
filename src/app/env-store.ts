import { AsyncLocalStorage } from "node:async_hooks";

const store = new AsyncLocalStorage<Env>();

export const getEnv = (): Env => store.getStore()!;

export const runWithEnv = <T>(env: Env, fn: () => T): T =>
  store.run(env, fn);
