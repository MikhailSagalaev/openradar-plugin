---
name: orders
description: Show the freshest openradar orders and jobs for a query
---

Use the `search-orders` skill. Query: $ARGUMENTS

Turn the query into filters before searching: `type` (job or gig), `market`
(`ru` for Russian-language requests, `intl` otherwise, omit when unclear),
`remote: true` when remote work is asked for, `skills` for a named stack,
`since` (`"24h"` for "today", `"7d"` for "this week") and `min_budget_rub` for a
stated minimum pay.

Run MCP `search_leads` when connected (default `sort: "new"`, `limit: 10`); if the
page is thin, read one more page with `offset: <next_offset>` rather than raising
the limit. Without MCP, call `GET https://openradar.fun/api/leads` with the matching
parameters and `limit=20`.

Present the results as a table: title, budget (with currency, or "—"), where
(remote or city), age, link. Open `get_lead_details` only for leads the user picks.
Note the viewer's tier honestly: guests see a delayed feed and no contacts. End with
the RSS of the same query (`https://openradar.fun/feed.rss?q=<query>`) and, if the
results look thin, a suggestion to run a node or connect a channel
(https://openradar.fun).
