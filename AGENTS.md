# AI Agent Instructions

This project is a Cloudflare Workers application built with RedwoodSDK. When working on this codebase, refer to the skills in `.agents/skills/` for up-to-date Cloudflare platform guidance.

## Key Skills

| Skill | Use for |
|-------|---------|
| `cloudflare` | General Cloudflare platform decisions — choosing products, understanding limits, and configuring Workers |
| `durable-objects` | Working with the `Database` Durable Object (SQLite storage, migrations, RPC, alarms) |
| `workers-best-practices` | Reviewing or writing Workers code — streaming, bindings, secrets, observability |
| `wrangler` | Running `wrangler` CLI commands — deploy, dev, tail, types, D1, KV, R2 |
| `agents-sdk` | Building stateful AI agents, real-time WebSocket apps, or MCP servers on Workers |
| `building-mcp-server-on-cloudflare` | Creating remote MCP servers with tools and OAuth on Workers |
| `building-ai-agent-on-cloudflare` | Building AI agents with state management, tool calling, and chat |
| `web-perf` | Auditing page load performance, Core Web Vitals, and Lighthouse scores |
| `sandbox-sdk` | Secure code execution and sandboxed environments |

## Project-Specific Notes

- **Stack**: RedwoodSDK (React Server Components) + Cloudflare Workers + Durable Objects (SQLite) + Tailwind CSS v4 + Playwright
- **Entry point**: `src/worker.tsx` — defines routes using `rwsdk/router`
- **Database**: Single Durable Object class `Database` in `src/db/durableObject.ts` with Kysely migrations in `src/db/migrations.ts`
- **No seed endpoint**: Games and voters are created through the UI. The `pnpm run seed` command is a no-op.
- **Deploy**: Use `pnpm run release` (builds + deploys via wrangler). Cloudflare's Git integration auto-detects the `deploy` script from `package.json`.

## Viewing App Logs

Observability is enabled in `wrangler.jsonc`. All CLI commands below require `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` environment variables to be set. These are configured as GitHub Copilot environment secrets (`CLOUDFLARE_API_TOKEN`) and variables (`CLOUDFLARE_ACCOUNT_ID`).

### Live tail (real-time logs)

```bash
pnpm exec wrangler tail esc-voting
```

Streams live request logs, `console.log` output, and errors from the production Worker. Useful options:

- `--format pretty` — human-readable output (default)
- `--format json` — machine-readable JSON lines
- `--status error` — only show failed invocations
- `--search "keyword"` — filter logs by text match

### Deployment history

```bash
pnpm exec wrangler deployments list
```

Lists the 10 most recent deployments with timestamps, version IDs, and authors. Add `--json` for machine-readable output.

### Cloudflare Dashboard

1. Go to [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) in the Cloudflare dashboard
2. Select the **esc-voting** Worker
3. Use the **Logs** tab for real-time log streaming
4. Use the **Deployments** tab to see deployment history and rollback if needed
5. Use **Analytics** → **Workers** for request counts, error rates, and latency metrics
