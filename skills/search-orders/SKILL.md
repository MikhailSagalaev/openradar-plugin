---
name: search-orders
description: Search live freelance orders and remote vacancies on the OpenRadar network (openradar.fun). Use when the user asks to find work, orders, gigs, jobs, clients or projects — for example "find React orders", "what remote jobs are open today", "покажи заказы на Python". Returns leads with source, budget, skills and links. Guest tier sees a delayed feed without contacts; a participant key unlocks faster access and contacts.
---

# Search OpenRadar leads

OpenRadar aggregates freelance orders and vacancies from boards, RSS and Telegram
channels into one normalized feed. Contacts live inside the post — the network never
sells responses.

## How to query

Prefer the MCP tools of the `openradar` server when available:

- `search_leads` — arguments: `query` (keywords or stack), `type` (`job` | `gig`),
  `skills` (array), `min_budget`, `limit` (1–100).

Fallback over plain HTTP, when MCP is not connected:

```
GET https://openradar.fun/api/leads?q=<query>&type=job|gig&skill=<skill>&budget=<rubles>&language=ru|en&remote=1&sort=new|score|budget&limit=50&page=1
```

- `sort=score` and `sort=budget` look at the last 7 days only; `sort=new` is the default.
- `budget` is a minimum in roubles; results are USD-normalized internally.
- `limit` caps at 500. Paginate with `page`, or walk the cursor of
  `GET /v2/feed?cursor=...` for `sort=new` streams.
- `language=ru` filters Cyrillic titles, `language=en` — non-Cyrillic.

## Rules

1. One lead card: `GET https://openradar.fun/leads/<id>` (HTML) or MCP
   `get_lead_details`. Do not guess fields the API does not return.
2. Guest tier: the feed is delayed (default 12 hours) and contacts are hidden —
   say so instead of pretending contacts exist. A participant key (`RADAR_KEY`
   environment variable, passed to a node or the SDK) unlocks shorter delays and
   contacts. Never ask the user to paste a private key into the chat.
3. Respect rate limits (about 60 requests per minute per IP). Page through results
   instead of retrying on 429.
4. Never scrape the HTML pages when the API endpoint answers; never try to bypass
   the tier delay. Delayed leads return 404 for guests by design.
5. Present leads as a compact table: title, budget, source, age, link. Link to
   `https://openradar.fun/leads/<id>` or to the original post when visible.
