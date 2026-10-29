---
name: submit-lead
description: Contribute a job vacancy or freelance order the user has legitimately seen (a Telegram post, an RSS item, an email alert) to openradar as a radar/2 observation. Use when the user says "добавь этот заказ в openradar", "submit this lead", or asks to share watched channels with the hub. Private keys stay in environment variables and are never typed in chat.
---

# Submit a lead to openradar

openradar accepts `radar/2.observation` JSON: posts from any source the user can
legitimately read. The network merges duplicates from different participants and
credits whoever saw a lead first — contribution drives early access.

## Observation format

```json
{
  "schema": "radar/2.observation",
  "source": { "platform": "telegram", "channel": "-1001234567890",
              "channel_title": "Frontend jobs", "visibility": "public",
              "message_id": "48213", "url": null },
  "posted_at": "2026-10-26T11:02:00Z",
  "author": { "name": "Ирина", "handle": "@irina_hr",
              "contacts": [{ "type": "telegram", "value": "@irina_hr" }] },
  "title": null,
  "text": "Ищем React-разработчика…",
  "type": "job",
  "budget": { "min": 200000, "max": 300000, "currency": "RUB", "period": "month" },
  "skills": ["react"],
  "location": { "city": "Москва", "remote": true }
}
```

Required: `source.platform`, `source.channel` (stable id; numeric `chat_id` for
Telegram), `text` (≤ 20 000 chars). `visibility`: `public`, `private` or `invite` —
set `private` for closed channels. Contacts are normalized and extracted from the
text automatically. Do not include the `raw` payload.

## Where to send

1. **A node you control**: create a webhook source
   (`radar source add --kind webhook --title "My parser"`) and POST up to 500
   observations to `POST /api/v2/ingest/<sourceId>` with header
   `x-radar-token: <source token>` — JSON array, `{"observations": [...]}` or NDJSON.
   `radar push --source <id>` reads the same NDJSON from stdin.
2. **Straight to the hub** with the Python or TypeScript SDK, signed by a
   participant key: `hub.observe([observation])`. The key comes from the
   `RADAR_KEY` environment variable (`nsec1…`). Never echo it, never write it to
   files, never accept it as chat input.

## Rules

1. Only submit posts the user can legitimately read — their own account, public
   pages, official feeds or mail they received. No login bypasses, no CAPTCHA
   circumvention, no scraping of gated content.
2. One observation per post; include the real `message_id` so cross-posts merge
   instead of duplicating.
3. Observations older than 48 hours are archived: stored, but they earn no rating.
4. Junk or scam submissions cost rating points when hidden by moderators. When in
   doubt, mark the lead and let the network's signals decide.
5. Say plainly which source each observation came from and which endpoint received
   it; report the endpoint's per-item `outcomes` back to the user.
