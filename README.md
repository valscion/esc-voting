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

## Deploy

```bash
pnpm run release
```

After deploying, seed the production database:

```bash
pnpm run seed
```

## Cloudflare Dashboard Setup (Mobile-Friendly)

If you only have a phone (no CLI), follow these steps to deploy:

### 1. Create a Cloudflare account

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) in your mobile browser
2. Sign up or log in

### 2. Connect your GitHub repo

1. In the Cloudflare dashboard, navigate to **Workers & Pages** in the left sidebar
2. Tap **Create** → **Pages** tab (or use Workers if preferred)
3. Tap **Connect to Git** and authorize Cloudflare to access your GitHub repo
4. Select the `valscion/esc-voting` repo

### 3. Configure build settings

When prompted for build configuration:
- **Framework preset**: None
- **Build command**: `pnpm run build`
- **Build output directory**: `dist`
- **Node.js version**: Set environment variable `NODE_VERSION` = `22`

### 4. Deploy via Workers (recommended)

Since this app uses Durable Objects, deploy via **Workers** instead of Pages:

1. Go to **Workers & Pages** → **Overview**
2. Tap **Create** → **Create Worker**
3. Name it `esc-voting`
4. After creation, go to the Worker's **Settings** → **Build** section:
   - **Build command**: `pnpm install && pnpm run build`
   - **Deploy command**: `wrangler deploy`

### 5. Durable Objects are auto-configured

The `wrangler.jsonc` already declares the Durable Object bindings and migrations. When you deploy with `wrangler deploy`, Cloudflare automatically:
- Creates the Durable Object namespace for the `Database` class
- Runs the SQLite migration to create tables

No manual Durable Object setup is needed in the dashboard.

### 6. Seed production data

After the first deploy, you'll need to seed the database. This requires CLI access (ask a friend with a laptop, or use a GitHub Action):

```bash
pnpm run seed
```

### Alternative: Deploy via GitHub Actions

You can also set up automatic deploys:

1. In your Cloudflare dashboard, go to **Workers & Pages** → your Worker → **Settings** → **API**
2. Note your **Account ID** (visible in the URL or the sidebar)
3. Create an **API Token**: Go to **My Profile** → **API Tokens** → **Create Token** → use the "Edit Cloudflare Workers" template
4. In your GitHub repo, go to **Settings** → **Secrets and variables** → **Actions**
5. Add secrets: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
6. Add a deploy job to your CI workflow

## Tech Stack

- **[RedwoodSDK](https://rwsdk.com)** — React Server Components on Cloudflare Workers
- **[Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)** — Persistent SQLite storage (via `rwsdk/db` + Kysely)
- **[Tailwind CSS v4](https://tailwindcss.com)** — CSS-only configuration with indigo/mauve color scale
- **[Playwright](https://playwright.dev)** — End-to-end testing
- **pnpm** — Package manager
