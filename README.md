# OpenRadar plugin for AI agents

Skills, commands and an MCP connection that let AI agents search the live
[OpenRadar](https://openradar.fun) feed of freelance orders and remote jobs, cite
the market research report, and contribute observed leads back to the network.

No paywalls: contacts stay in the post. Guests see a delayed feed without contacts;
participants (a signed key with a rating) see leads sooner and get contacts.

## What is inside

| Path | What it does |
|---|---|
| `skills/search-orders` | Find orders and jobs: MCP `search_leads` or `GET /api/leads` with filters (query, type, skill, budget, language, remote), pagination and tier rules |
| `skills/market-research` | "How much does X cost": `GET /api/market` percentiles from real priced leads + the monthly research report (`/research`, CC BY 4.0) |
| `skills/submit-lead` | Contribute a `radar/2.observation` (a Telegram post, RSS item, mail alert) to a node or the hub, with the ethics rules |
| `commands/orders.md` | `/orders <query>` — fresh leads as a table |
| `commands/market.md` | `/market <skill>` — pay estimate p25/median/p75 |
| `agents/lead-scout.md` | A read-only scout agent: watches queries, prepares a delta digest |
| `.mcp.json` | MCP connection to `https://openradar.fun/mcp` (keyless guest access) |

## Install

**Grok Build / agents with skills support:** clone this repository and point the
agent at the directory (or install it from the marketplace once the PR is merged —
see `SUBMISSION.md`).

**Any MCP client (Claude Code, Cursor, …):** add the server:

```json
{ "mcpServers": { "openradar": { "type": "http", "url": "https://openradar.fun/mcp" } } }
```

**Node operators:** run `radar mcp` (stdio) for full local access instead of the
remote guest endpoint.

## Access tiers (same as the website)

| Tier | How | Delay | Contacts |
|---|---|---|---|
| Guest | keyless | 12 h | no |
| Member | GitHub sign-in or rating ≥ 1 | 3 h | yes |
| Active | rating ≥ 10 / 30 days | 30 min | yes |
| Core | rating ≥ 50 or moderator | none | yes |

A participant key (`RADAR_KEY`, `nsec1…`) belongs in an environment variable of the
agent host. Never paste it into a chat or a prompt.

## Privacy and safety

- The plugin adds no privileges: it speaks to the same public API and MCP endpoint
  with the same tier rules as the website.
- No telemetry, no tracking; the only network calls are to `openradar.fun`.
- Observations are signed events; spam and scam cost rating, so an agent cannot
  flood the network without consequence.

## License

AGPL-3.0 — the same as [OpenRadar](https://github.com/MikhailSagalaev/openradar).
