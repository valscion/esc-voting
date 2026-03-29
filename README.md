# ESC Voting

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/valscion/esc-voting)

A pre-contest voting app for Eurovision Song Contest enthusiasts. When a group of friends wants to watch the entire set of ESC songs _before_ the semi-finals even air (but after all songs have already been selected), each person can rate every competing country using five emoji reactions — from 🔥 to 💀.

## How It Works

- All data (songs, voters, votes) is stored in **Cloudflare Durable Objects** — no external database needed.
- Each voter gets their own page where they rate every country using one of five reactions:
  - 🔥 Fire – absolute banger
  - ❤️ Heart – really love it
  - 😊 Smile – it's good
  - 😐 Meh – not feeling it
  - 💀 Dead – please no
- Votes are saved instantly via server actions and persist in the Durable Object SQLite store.
- Built with **RedwoodSDK** using React Server Components and Cloudflare Workers.

## Development

```bash
pnpm install
pnpm run dev
```

### Run e2e tests

```bash
# With dev server already running:
pnpm run test:e2e

# Or let Playwright start the server automatically:
pnpm run test:e2e
```

## Production Setup

This project is designed to be deployed and managed entirely from a phone — no CLI needed. Deployment is handled by Cloudflare's GitHub integration (auto-deploys on push).

The quickest way to deploy is to use the **Deploy to Cloudflare** button at the top of this README. It will clone the repo, provision the required Durable Object, and deploy the Worker for you.

### Manual deploy via Cloudflare Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up or log in
2. Go to **Workers & Pages** → **Create** → **Import a repository**
3. Connect your GitHub account and select this repository
4. Cloudflare will auto-deploy on every push to `main`

After deploying, create a game and add voters through the app's UI.

## CLI Deploy (alternative)

If you have CLI access:

```bash
pnpm run release
```

## Tech Stack

- **[RedwoodSDK](https://rwsdk.com)** — React Server Components on Cloudflare Workers
- **[Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)** — Persistent SQLite storage (via `rwsdk/db` + Kysely)
- **[Tailwind CSS v4](https://tailwindcss.com)** — CSS-only configuration with indigo/mauve color scale
- **[Playwright](https://playwright.dev)** — End-to-end testing
- **pnpm** — Package manager
