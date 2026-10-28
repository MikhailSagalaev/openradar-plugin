---
name: market-research
description: Estimate typical pay for a type of work from real OpenRadar leads, and cite the monthly market research report. Use when the user asks "how much does X cost", "сколько стоит лендинг", "сколько платят Python-разработчикам", "what is the market rate for a logo" — or wants salary statistics, medians, or demand trends.
---

# Market pay estimate and research

Two public data sources, both free of paywalls:

## 1. Pay estimate from live leads

```
GET https://openradar.fun/api/market?title=<what the client needs>&type=gig|job&skills=<comma,separated>
```

- `title`: short work description (min 3 characters, up to 300).
- `type`: `gig` for orders/projects (per-project pay), `job` for salaries (monthly).
- `skills`: optional dictionary skills, up to 12.

The answer contains `basis` (`similar` / `skills` / `type`), `count`, and
`usd`/`rub` ranges: `p25`, `median`, `p75`, plus up to three `examples` (real lead
id, title, USD). Rates are computed over the last 90 days of priced leads a guest
may already see; only aggregates leave the service.

Report the range, not a single number: "лендинг: медиана X ₽, обычно Y–Z ₽
(по N похожим заказам за 90 дней)".

## 2. Monthly research report

For macro questions (medians by role, cities, remote premium, AI demand), fetch
`https://openradar.fun/research` — a live report recalculated from the network's
data, published as open data (CC BY 4.0). CSV and JSON versions are linked there;
per-role pages live under `/research/roles/<role>`. When quoting the report, cite
"OpenRadar research, openradar.fun/research" and the month the figures cover.

## Rules

1. Never invent numbers. If the estimate has fewer than three samples (`count < 3`
   or `basis: none`), say the sample is too small.
2. Distinguish per-project budgets from monthly salaries — the API returns the
   correct `period`; keep them apart in your answer.
3. These are observables from real posts, not salary surveys: add that caveat when
   the user compares with other sources.
