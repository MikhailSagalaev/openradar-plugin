# openradar plugin for AI agents

Skills, commands and an MCP connection that let AI agents search the live
[openradar](https://openradar.fun) feed of freelance orders and remote jobs, cite
the market research report, and contribute observed leads back to the network.

No paywalls: contacts stay in the post. Guests see a delayed feed without contacts;
participants (a signed key with a rating) see leads sooner and get contacts.

## What is inside

| Path | What it does |
|---|---|
| `skills/search-orders` | Find orders and jobs: MCP `search_leads` (filters, compact results, `next_offset` paging) + `get_lead_details`, or `GET /api/leads` / `GET /v2/feed` over HTTP |
| `skills/market-research` | "How much does X cost": `GET /api/market` percentiles from real priced leads + the monthly research report (`/research`, CC BY 4.0) |
| `skills/submit-lead` | Contribute a `radar/2.observation` (a Telegram post, RSS item, mail alert) to a node or the hub, with the ethics rules |
| `commands/orders.md` | `/orders <query>` — fresh leads as a table |
| `commands/market.md` | `/market <skill>` — pay estimate p25/median/p75 |
| `agents/lead-scout.md` | A read-only scout agent: watches queries, prepares a delta digest |
| `.mcp.json` | MCP connection to `https://openradar.fun/mcp` (keyless guest access) |
| `.grok-plugin/plugin.json` | Plugin manifest (Grok Build / xAI plugin marketplace) |
| `scripts/sync-skills.mjs` | Copies `skills/` into the skill folders of other agent CLIs (see below) |

## Connect the MCP server

The server is `https://openradar.fun/mcp` (Streamable HTTP, POST only, no key for
guest access). It is listed in the official MCP Registry as
**`io.github.MikhailSagalaev/openradar`**, so registry-aware clients and catalogs
can find it by that name.

- **Claude (claude.ai, Desktop):** Settings → Connectors → Add custom connector →
  URL `https://openradar.fun/mcp`.
- **Claude Code:**

  ```bash
  claude mcp add --transport http openradar https://openradar.fun/mcp
  ```

- **Any other MCP client (Cursor, Grok Build, …):**

  ```json
  { "mcpServers": { "openradar": { "type": "http", "url": "https://openradar.fun/mcp" } } }
  ```

- **Node operators:** run `radar mcp` (stdio) for full local access instead of the
  remote guest endpoint.

### Tools

| Tool | Arguments | Returns |
|---|---|---|
| `search_leads` | `query`, `type` (`job`\|`gig`), `market` (`ru`\|`intl`), `remote` (bool), `skills` (array, any of), `min_budget_rub`, `min_budget` (lead currency, legacy), `since` (`"24h"`, `"7d"` or ISO date), `sort` (`new`\|`score`\|`budget`), `limit` (1–50, default 10), `offset` | `{ results: [{ id, type, title, budget, currency, market, where, skills, score, url, published_at }], next_offset }` — `where` is `"remote"` or a city |
| `get_lead_details` | `id` | Full text, contacts (when the tier allows), source and budget of one lead |
| `get_market_analytics` | `type` | Top skills and median budget over the latest 200 visible leads |

Agents should narrow with `market`, `remote`, `since` and `skills`, keep `limit`
small, page with `next_offset`, and open `get_lead_details` only for the shortlist.

### HTTP fallback

`GET https://openradar.fun/api/leads?q=&type=&skill=&budget=&language=ru|en&remote=1&sort=new|score|budget&limit=`
returns a JSON array of full leads (`limit` default 50, max 500; no offset).
`GET https://openradar.fun/v2/feed` takes the same filters and returns a `cursor`
for incremental reads. Details are in `skills/search-orders/SKILL.md`.

## Install the plugin

**Grok Build:** install it from the xAI plugin marketplace once the PR is merged
(see `SUBMISSION.md`), or clone this repository into `./.grok/plugins/`.

**Skills in other agent CLIs:** `skills/` is the source of truth;
`node scripts/sync-skills.mjs` copies each skill into the project-level folders
these tools read, so an agent started inside this repository picks them up:

| Folder | Read by |
|---|---|
| `.claude/skills/` | Claude Code |
| `.agents/skills/` | Codex (its only repo-level skill folder), OpenCode, other agents-compatible hosts |
| `.grok/skills/` | Grok Build |
| `.qwen/skills/` | Qwen Code |
| `.opencode/skills/` | OpenCode |

To use the skills in another project, copy `skills/<name>/` into the matching
folder there (or the user-level one, e.g. `~/.claude/skills/`, `~/.agents/skills/`,
`~/.grok/skills/`, `~/.qwen/skills/`, `~/.config/opencode/skills/`).
`node scripts/sync-skills.mjs --check` fails when a copy is out of date; CI runs it.

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
- Network endpoints: only `https://openradar.fun` (`/mcp`, `/api/leads`,
  `/api/market`, `/v2/feed`, `/v2/leads/<id>`, `/research`, `/feed.rss`; `submit-lead`
  posts to a node you run or to the hub through the SDK). No credentials are
  needed for guest access.
- No telemetry, no tracking; `scripts/sync-skills.mjs` only copies local files.
- Observations are signed events; spam and scam cost rating, so an agent cannot
  flood the network without consequence.

## License

AGPL-3.0 — the same as [openradar](https://github.com/MikhailSagalaev/openradar).
