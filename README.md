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

## Deploy from Phone (GitHub Actions)

This project is designed to be deployed and managed entirely from a phone — no CLI needed. Everything is done through the GitHub and Cloudflare web dashboards.

### 1. Set up Cloudflare

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up or log in
2. Note your **Account ID** (visible in the sidebar or URL on any Workers page)
3. Create an **API Token**:
   - Go to **My Profile** → **API Tokens** → **Create Token**
   - Use the **"Edit Cloudflare Workers"** template
   - Save the generated token
4. Generate a **seed secret** — any random string (e.g. use a password generator). This protects the seed endpoint in production.

### 2. Set up GitHub secrets and variables

In your GitHub repo, go to **Settings** → **Secrets and variables** → **Actions**:

**Secrets** (tap "New repository secret" for each):

| Secret name              | Value                                     |
| ------------------------ | ----------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`  | Your Cloudflare Account ID                |
| `CLOUDFLARE_API_TOKEN`   | The API token from step 1                 |
| `SEED_SECRET`            | The random seed secret from step 1        |

**Variables** (switch to the "Variables" tab, tap "New repository variable"):

| Variable name  | Value                                             |
| -------------- | ------------------------------------------------- |
| `WORKER_URL`   | `https://esc-voting.<your-subdomain>.workers.dev` |

> **How to find your Workers subdomain**: In the Cloudflare dashboard, go to **Workers & Pages** → **Overview**. Your subdomain is shown at the top (e.g. `your-name.workers.dev`). The full URL will be `https://esc-voting.your-name.workers.dev`.

### 3. Deploy and seed

1. In your GitHub repo, go to **Actions** → **Deploy** workflow
2. Tap **Run workflow**
3. Check the **"Seed the database"** checkbox for the first deploy
4. Tap **Run workflow** to start

The workflow will:
- Deploy the worker to Cloudflare (Durable Objects are auto-configured)
- Set the `SEED_SECRET` as a Cloudflare Worker secret
- Seed the database with ESC 2025 songs and voters (if checkbox was checked)

Future pushes to `main` will auto-deploy without seeding.

### 4. Re-seeding (resets all votes!)

To re-seed the database (e.g. after changing the song list):

1. Go to **Actions** → **Deploy** → **Run workflow**
2. Check the **"Seed the database"** checkbox
3. Run — this clears all existing votes and re-inserts songs + voters

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
