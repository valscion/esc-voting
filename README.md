# ESC Voting

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

### Seed the database

After starting the dev server once (so the Durable Object is created), seed it with ESC 2025 songs and sample voters:

```bash
pnpm run seed
```

### Run e2e tests

```bash
# With dev server already running:
pnpm run test:e2e

# Or let Playwright start the server automatically:
pnpm run test:e2e
```

## Production Setup

This project is designed to be deployed and managed entirely from a phone — no CLI needed. Deployment is handled by Cloudflare's GitHub integration (auto-deploys on push), and database seeding is done via a GitHub Actions workflow.

### 1. Deploy via Cloudflare

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up or log in
2. Go to **Workers & Pages** → **Create** → **Import a repository**
3. Connect your GitHub account and select this repository
4. Cloudflare will auto-deploy on every push to `main`
5. Add the `SEED_SECRET` environment variable to your Worker:
   - Go to your Worker's **Settings** → **Variables and Secrets**
   - Add a secret named `SEED_SECRET` with a random string value (e.g. use a password generator). This protects the seed endpoint in production.

### 2. Set up GitHub for seeding

In your GitHub repo, go to **Settings** → **Secrets and variables** → **Actions**:

**Secrets** (tap "New repository secret"):

| Secret name   | Value                              |
| ------------- | ---------------------------------- |
| `SEED_SECRET` | Same seed secret as in Cloudflare  |

**Variables** (switch to the "Variables" tab, tap "New repository variable"):

| Variable name | Value                                             |
| ------------- | ------------------------------------------------- |
| `WORKER_URL`  | `https://esc-voting.<your-subdomain>.workers.dev` |

> **How to find your Workers subdomain**: In the Cloudflare dashboard, go to **Workers & Pages** → **Overview**. Your subdomain is shown at the top (e.g. `your-name.workers.dev`). The full URL will be `https://esc-voting.your-name.workers.dev`.

### 3. Seed the database

After deploying, seed the production database with ESC 2025 songs and voters:

1. In your GitHub repo, go to **Actions** → **Seed Database** workflow
2. Tap **Run workflow**
3. Tap **Run workflow** again to start

### 4. Re-seeding (resets all votes!)

To re-seed the database (e.g. after changing the song list):

1. Go to **Actions** → **Seed Database** → **Run workflow**
2. Run — this clears all existing votes and re-inserts songs + voters

## CLI Deploy (alternative)

If you have CLI access:

```bash
pnpm run release
```

After deploying, seed production:

```bash
curl -X POST -H "Authorization: Bearer YOUR_SEED_SECRET" \
  https://esc-voting.your-subdomain.workers.dev/api/seed
```

## Tech Stack

- **[RedwoodSDK](https://rwsdk.com)** — React Server Components on Cloudflare Workers
- **[Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)** — Persistent SQLite storage (via `rwsdk/db` + Kysely)
- **[Tailwind CSS v4](https://tailwindcss.com)** — CSS-only configuration with indigo/mauve color scale
- **[Playwright](https://playwright.dev)** — End-to-end testing
- **pnpm** — Package manager
