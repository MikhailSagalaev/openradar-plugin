---
name: search-orders
description: Search live freelance orders and remote vacancies on the openradar network (openradar.fun). Use when the user asks to find work, orders, gigs, jobs, clients or projects — for example "find React orders", "what remote jobs are open today", "покажи заказы на Python". Returns compact leads (title, budget, market, remote or city, skills, score, link); full text and contacts come from a second call. Guest tier sees a delayed feed without contacts; a participant key unlocks faster access and contacts.
---

# Search openradar leads

openradar aggregates freelance orders and vacancies from boards, RSS and Telegram
channels into one normalized feed. Contacts live inside the post — the network never
sells responses.

## Preferred: MCP server `openradar` (https://openradar.fun/mcp)

### `search_leads` — find candidates

Arguments (all optional):

| Argument | Meaning |
|---|---|
| `query` | Keywords or stack, e.g. `"Golang Kafka"` |
| `type` | `job` (employment) or `gig` (freelance order) |
| `market` | `ru` (Russian-language boards and channels) or `intl` (the rest) |
| `remote` | `true` — only work that can be done remotely |
| `skills` | Array; a lead matches when it has **at least one** of them, e.g. `["Python", "Django"]` |
| `min_budget_rub` | Minimum budget or monthly pay in roubles; other currencies are converted. Prefer this |
| `min_budget` | Legacy: minimum in the lead's own currency (no conversion) |
| `since` | Only posts newer than `"24h"`, `"7d"` (any `<N>h` / `<N>d`) or an ISO date |
| `sort` | `new` (default), `score` (best described first), `budget` (highest pay first). `score` and `budget` look at the last 7 days unless `since` is given |
| `limit` | 1–50, default 10 |
| `offset` | The `next_offset` of the previous call, to read the next page |

Returns `{ "results": [...], "next_offset": N }`. Each result is compact:
`id`, `type`, `title`, `budget`, `currency`, `market`, `where` (`"remote"` or a
city), `skills` (up to 6), `score` (0–100, median ≈ 60, 80+ is a strong lead),
`url` (the original post), `published_at`. `budget`/`currency` are absent when the
post states no pay; `next_offset` is absent on the last page.

### `get_lead_details` — open the ones that fit

`get_lead_details({ "id": "<id from search_leads>" })` returns the full text,
contacts (only when the caller's tier may see them), source and budget of one lead.

### `get_market_analytics`

`get_market_analytics({ "type": "job" | "gig" })` — top requested skills and the
median budget over the latest 200 visible leads. For pay estimates use the
`market-research` skill instead.

### How to search well

1. **Narrow first, page second.** Translate the request into filters before
   fetching: `market` from the user's language or region, `remote: true` when they
   want remote work, `since: "24h"` / `"7d"` for "today" / "this week", `skills`
   for the stack, `type` for job vs gig, `min_budget_rub` for "от 50 тысяч".
2. **Keep `limit` small** (10, at most 20). Do not ask for 50 results to filter
   them yourself — the server filters better and cheaper.
3. **Page with `next_offset`.** If the first page has too few good leads, call again
   with the same arguments plus `offset: <next_offset>`. Stop when `next_offset` is
   missing or you have enough. Never re-run a search just to "see more" without it.
4. **Open details only for the shortlist** — call `get_lead_details` for the 1–5
   leads the user is likely to act on, not for every result.
5. If nothing matches, relax one filter at a time (drop `since`, then `skills`,
   then `min_budget_rub`) and say which one you relaxed.

## Fallback: plain HTTP, when MCP is not connected

```
GET https://openradar.fun/api/leads?q=<query>&type=job|gig&skill=<one skill>&budget=<min roubles>&language=ru|en&remote=1&sort=new|score|budget&limit=20
```

- Returns a JSON **array** of full leads (text, `city`, `isRemote`, `budget`,
  `currency`, `paymentPeriod`, `skills`, `contacts`, `publishedAt`, `createdAt`,
  votes). No `score`, no pagination parameters: `limit` (default 50, max 500) is
  the only page size, so keep it small and narrow with filters instead.
- `skill` takes one skill; `budget` is a minimum in roubles; `language=ru` keeps
  Cyrillic titles (the MCP `market: "ru"`), `language=en` the rest.
- `sort=score` and `sort=budget` look at the last 7 days only; `sort=new` is the default.
- To read new leads incrementally, use `GET https://openradar.fun/v2/feed` with the
  same filters (`limit` up to 200). It returns `{ tier, delayMinutes, cursor, leads }`;
  pass `cursor=<cursor>` on the next call to get only leads added after it
  (works with `sort=new` only).
- One lead: `GET https://openradar.fun/v2/leads/<id>` (JSON) or the page
  `https://openradar.fun/leads/<id>`.

## Rules

1. Do not guess fields the tools do not return. A compact result has no text and no
   contacts — fetch details before quoting them.
2. Guest tier: the feed is delayed (default 12 hours) and contacts are hidden —
   say so instead of pretending contacts exist. A participant key (`RADAR_KEY`
   environment variable, passed to a node or the SDK) unlocks shorter delays and
   contacts. Never ask the user to paste a private key into the chat.
3. Respect rate limits (about 60 MCP calls per minute per IP, 120 for the HTTP
   feed). Page and narrow instead of retrying on 429.
4. Never scrape the HTML pages when the API endpoint answers; never try to bypass
   the tier delay. Delayed leads return 404 for guests by design.
5. Present leads as a compact table: title, budget, where (remote or city), age,
   link. Link to `https://openradar.fun/leads/<id>` or to the original post `url`.
