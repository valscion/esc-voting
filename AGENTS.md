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
- **Deploy**: Use `pnpm run release` or Cloudflare's GitHub integration (auto-deploys on push to `main`)
