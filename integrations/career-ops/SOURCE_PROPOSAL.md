# Source Proposal for `career-ops`: OpenRadar (`openradar.fun`)

## Summary
- **Source Name:** OpenRadar (`https://openradar.fun`)
- **Adapter Type:** Public JSON REST API (`/v2/feed`, `/api/insights`, `/openapi.json`) + MCP (`https://openradar.fun/mcp`)
- **License:** Apache-2.0 (`https://github.com/MikhailSagalaev/openradar`)
- **Authentication Required:** None for guest feed (optional `Bearer mcp_...` for zero-delay contributor tier)
- **Robots / ToS Compliance:** Strict RFC 9309 `robots.txt` check (`radar robots`), documented `DATA_CONTRACT.md` and `TAKEDOWN.md`.

## Why OpenRadar Adds Unique Signal to `career-ops`
1. **First-party Telegram Channel & Folder Observations:** Indexes 70+ curated technical Telegram job channels and hiring communities where direct engineering managers post roles that never appear on Greenhouse, Lever, or LinkedIn.
2. **Pre-normalized Compensation & ISCO-08 Taxonomy:** Every lead includes `workplaceType` (`remote` / `hybrid` / `onsite`), `direction`, 4-digit ILO `occupationCode` (ISCO-08), and sanity-checked USD/RUB salary ranges (`salaryLooksWrong` filter).
3. **Drop-in Provider Module:** Ready in [`openradar.mjs`](./openradar.mjs) (`hooks: ["provider"]`).
