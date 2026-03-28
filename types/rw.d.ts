// Make this file a module so the declare block augments rather than replaces
export {};

declare module "rwsdk/worker" {
  // App is the type of your defineApp export in src/worker.tsx
  export type App = typeof import("../src/worker").default;
}
