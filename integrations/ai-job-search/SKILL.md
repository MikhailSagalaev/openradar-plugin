---
name: openradar-portal
description: Search live remote tech jobs, direct Telegram hiring posts, and freelance orders via the free OpenRadar API and MCP endpoint (openradar.fun). Use when looking for roles not listed on standard ATS boards, checking ISCO-08 occupation classifications, or benchmarking real salary percentiles.
---

# OpenRadar Portal Skill for `ai-job-search`

OpenRadar (`https://openradar.fun`) is an open, Apache-2.0 job & freelance intelligence hub indexing 164+ sources, including 70+ direct Telegram hiring channels, ATS career pages, and remote boards.

## Quick API Usage (No Key Required)

### 1. Search Vacancies & Orders (`GET /v2/feed`)
```bash
curl -s "https://openradar.fun/v2/feed?type=job&remote=1&direction=backend&occupation_code_or=2512,2513&limit=20"
```

Query parameters:
- `q` — keywords or stack (`Golang`, `React`, `LLM`)
- `type` — `job` (employment) or `gig` (freelance project)
- `remote=1` — remote-friendly work only
- `direction` — `backend`, `frontend`, `fullstack`, `devops`, `ai`, `data`, `qa`, `security`, `design`, `product`, `hr`, `marketing`, `sales`
- `occupation_code_or` — comma-separated ILO ISCO-08 occupation codes (`2512` Software developers, `2513` Web developers, `2514` Applications programmers, `2522` Systems administrators / DevOps, `2120` Data Science & AI, `2166` Designers)
- `sort` — `new` (default), `relevance`, `score`, `budget`
- `language` — `ru`, `en`, or `all`

### 2. Market Salary & Demand Insights (`GET /api/insights`)
```bash
curl -s "https://openradar.fun/api/insights?days=30&type=job"
```
Returns `trending_skills`, `directions`, `occupations` (ISCO-08 breakdown), `workplace` (`remote`, `hybrid`, `onsite`), `salary_percentiles` (`p25`, `median`, `p75` in USD and RUB), and `ai_exposure`.

### 3. Employer Autocomplete (`GET /api/companies/suggest`)
```bash
curl -s "https://openradar.fun/api/companies/suggest?q=Yandex&limit=10"
```

### 4. MCP Server (`https://openradar.fun/mcp`)
Connect any MCP-compatible client directly to `https://openradar.fun/mcp` (Streamable HTTP JSON-RPC 2.0) for `search_leads`, `get_lead_details`, `estimate_compensation`, `get_market_analytics`, and `xray_generate_dorks`.
