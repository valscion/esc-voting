import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

// Several react-player backends crash at module-evaluation time in the
// Cloudflare Workers runtime because they (or their transitive deps)
// unconditionally access browser globals like `window` or `document`.
// Vite inlines the React.lazy dynamic imports into a single SSR chunk,
// so the module-level code runs at Worker startup even though the
// components are never rendered.  Since this app only plays YouTube
// videos, we alias every non-YouTube backend to a tiny no-op component.
const noopPlayerStub = new URL(
  "./src/stubs/noop-player.ts",
  import.meta.url,
).pathname;

export default defineConfig({
  resolve: {
    alias: [
      "dash-video-element/react",
      "hls-video-element/react",
      "vimeo-video-element/react",
      "wistia-video-element/react",
      "spotify-audio-element/react",
      "twitch-video-element/react",
      "tiktok-video-element/react",
      "@mux/mux-player-react",
    ].map((pkg) => ({
      find: new RegExp(`^${pkg.replace("/", "\\/")}$`),
      replacement: noopPlayerStub,
    })),
  },
  environments: {
    ssr: {},
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
    tailwindcss(),
  ],
});
