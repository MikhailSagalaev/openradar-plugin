---
name: orders
description: Show the freshest OpenRadar orders and jobs for a query
---

Use the `search-orders` skill. Query: $ARGUMENTS

Run the search (MCP `search_leads` when connected, otherwise
`GET https://openradar.fun/api/leads`), default `sort=new`, limit 10–20. Present the
results as a table: title, budget (with currency), source, age, link. Note the
viewer's tier honestly: guests see a delayed feed and no contacts. End with the two
useful links: the RSS of the same query (`https://openradar.fun/feed.rss?q=<query>`)
and, if the results look thin, a suggestion to run the node or connect a channel
(https://openradar.fun).
