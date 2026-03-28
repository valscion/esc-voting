# ESC Voting

A pre-contest voting app for Eurovision Song Contest enthusiasts. When a group of friends wants to watch the entire set of ESC songs _before_ the semi-finals even air (but after all songs have already been selected), each person can rate every competing country using five emoji reactions — from 🔥 to 💀.

## How It Works

- Songs and voter names are managed in an **Airtable** base.
- Each voter gets their own page where they rate every country using one of five reactions:
  - 🔥 Fire – absolute banger
  - ❤️ Heart – really love it
  - 😊 Smile – it's good
  - 😐 Meh – not feeling it
  - 💀 Dead – please no
- Votes are saved back to Airtable in real time via server actions.
- Built with **RedwoodSDK** using React Server Components and Cloudflare Workers.

## Airtable Base Setup

Create an Airtable base with three tables:

### Songs

| Field        | Type             | Notes                     |
| ------------ | ---------------- | ------------------------- |
| Country      | Single line text | e.g. `Finland`            |
| Artist       | Single line text | e.g. `Windows95man`       |
| Song         | Single line text | e.g. `No Rules!`          |
| Flag         | Single line text | e.g. `🇫🇮`                |
| RunningOrder | Number           | Running order in the show |

### Voters

| Field | Type             | Notes        |
| ----- | ---------------- | ------------ |
| Name  | Single line text | e.g. `Alice` |

### Votes

| Field   | Type             | Notes                  |
| ------- | ---------------- | ---------------------- |
| Voter   | Single line text | Voter name             |
| Country | Single line text | Country name           |
| Rating  | Single line text | One of the five emojis |

## Environment Variables

Copy `.dev.vars.example` to `.dev.vars` for local development:

```
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=your_base_id_here
```

For production, set these as secrets with Wrangler:

```bash
wrangler secret put AIRTABLE_API_KEY
wrangler secret put AIRTABLE_BASE_ID
```

## Development

```bash
pnpm install
pnpm run dev
```

## Deploy

```bash
pnpm run release
```
