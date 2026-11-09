# Плагин openradar для ИИ-агентов

[English](README.md) · [Русский](README.ru.md)

Набор скиллов, slash-команд и MCP-подключение, которые позволяют ИИ-агентам искать живые фриланс-заказы и удалённые вакансии в сети [openradar](https://openradar.fun), оценивать рыночную оплату по реальным постам, цитировать ежемесячные отчёты исследования рынка и отправлять найденные заказы обратно в сеть.

Без платного доступа: контакты заказчиков остаются внутри поста. Гости видят ленту с задержкой и без контактов; участники (с подписанным ключом и рейтингом или личным токеном `mcp_…`) видят посты раньше и получают контакты.

## Что внутри

| Путь | Назначение |
|---|---|
| `skills/search-orders` | Поиск заказов и вакансий: MCP `search_leads` (фильтры по стеку, направлению, грейду, формату работы, компании и бюджету + пагинация `next_offset`) + `get_lead_details` + `vote_lead`, либо HTTP-фолбэк `GET /api/leads` и `GET /v2/feed` |
| `skills/market-research` | «Сколько стоит X»: MCP-инструмент `estimate_compensation` и `GET /api/market` (квартили p25 / медиана / p75 по реальным оценённым лидам за 90 дней) + ежемесячный отчёт `/research` (CC BY 4.0) |
| `skills/submit-lead` | Отправка найденной вакансии или заказа через MCP `submit_lead` (с токеном `Bearer mcp_…`), на свой узел (`POST /api/v2/ingest/<id>`) или напрямую в хаб по протоколу `radar/2.observation` |
| `commands/orders.md` | `/orders <запрос>` — свежие подходящие заказы и вакансии компактной таблицей |
| `commands/market.md` | `/market <навык или роль>` — оценка рыночной оплаты (p25, медиана, p75) |
| `agents/lead-scout.md` | Read-only агент-скаут: следит за заданными запросами и собирает дельта-дайджест |
| `.mcp.json` | Конфигурация MCP-сервера `https://openradar.fun/mcp` (гостевой доступ без ключа) |
| `.grok-plugin/plugin.json` | Манифест плагина для Grok Build / xAI Plugin Marketplace |
| `scripts/sync-skills.mjs` | Синхронизирует `skills/` во все папки скиллов популярных агентских CLI |
| `scripts/test-mcp-harness.mjs` | Автоматический тест-харнесс JSON-RPC для проверки живого MCP-эндпоинта |

## Подключение MCP-сервера

Публичный сервер: `https://openradar.fun/mcp` (Streamable HTTP, POST, без ключа для гостевого уровня). Опубликован в официальном реестре MCP как **`io.github.MikhailSagalaev/openradar`**.

- **Claude (claude.ai, Claude Desktop):** Settings → Connectors → Add custom connector → URL `https://openradar.fun/mcp`.
- **Claude Code:**
  ```bash
  claude mcp add --transport http openradar https://openradar.fun/mcp
  ```
- **Cursor, Grok Build, VS Code и другие MCP-клиенты:**
  ```json
  { "mcpServers": { "openradar": { "type": "http", "url": "https://openradar.fun/mcp" } } }
  ```
- **Gemini CLI (`~/.gemini/settings.json`):**
  ```json
  { "mcpServers": { "openradar": { "httpUrl": "https://openradar.fun/mcp" } } }
  ```
- **Codex (`~/.codex/config.toml`):**
  ```toml
  [mcp_servers.openradar]
  url = "https://openradar.fun/mcp"
  ```
- **Операторы собственного узла:** запустите `radar mcp` (stdio) для прямого локального доступа без задержек.

### Инструменты MCP

| Инструмент | Аргументы | Что возвращает |
|---|---|---|
| `search_leads` | `query`, `type` (`job`\|`gig`), `market` (`ru`\|`intl`), `remote` (bool), `workplace` (`remote`\|`hybrid`\|`onsite`), `direction`, `skills` (массив, любой из), `grade` (`intern`..`lead`), `company`, `has_budget` (bool), `min_budget_rub`, `min_budget`, `since` (`"24h"`, `"7d"` или ISO-дата), `sort` (`new`\|`score`\|`budget`\|`relevance`), `limit` (1–50, по умолчанию 10), `offset` | `{ results: [{ id, type, title, budget, currency, market, where, workplace_type, direction, grade, company, skills, score, url, published_at }], next_offset }` |
| `get_lead_details` | `id` | Полный текст, контакты (если позволяет уровень доступа), источник, голоса и бюджет |
| `estimate_compensation` | `type` (`job`\|`gig`, обязателен), `title`, `skills`, `grade`, `currency` | Рыночная вилка оплаты (p25, медиана, p75), размер выборки и типичные навыки |
| `submit_lead` | `title`, `text`, `type` (`job`\|`gig`), `url`, `budget`, `currency`, `skills`, `remote`, `author`, `city` | Отправка новой вакансии или заказа в сеть (нужен личный токен) |
| `vote_lead` | `id`, `verdict` (`useful`\|`junk`\|`scam`\|`closed`), `reason` | Голос за качество или актуальность поста (нужен личный токен) |
| `get_market_analytics` | `type` | Топ востребованных навыков и медианный бюджет по последним 200 видимым лидам |
| `save_search` | `query`, `type`, `skill`, `it`, `remote`, `min_budget_rub`, `market` | Подписка на поиск: новые подходящие лиды приходят в Telegram или на вебхук не чаще раза в 15 минут (нужен личный токен) |
| `list_saved_searches` | — | Список активных подписок пользователя и статус привязки Telegram (нужен личный токен) |
| `xray_generate_dorks` | `company` (обязателен), `role`, `skills` | Поисковые запросы (Google и Яндекс) для прямого выхода на тимлидов и нанимающих менеджеров компании в LinkedIn, Telegram, Хабре и GitHub + шаблон первого письма |

**Личный токен.** Инструменты `submit_lead`, `vote_lead`, `save_search` и `list_saved_searches`, а также просмотр контактов без гостевой задержки работают с заголовком `Authorization: Bearer mcp_…`. Выпустить токен можно в профиле на сайте (`https://openradar.fun/me`, раздел «Токен для ИИ-агента») и передать в настройки MCP-сервера:
`"headers": { "Authorization": "Bearer mcp_…" }`.

## Установка скиллов в агентские CLI

Папка `skills/` — единый источник правды; скрипт `node scripts/sync-skills.mjs` копирует скиллы во все проектные директории, которые читают современные агентские CLI:

| Папка | Кто читает |
|---|---|
| `.claude/skills/` | Claude Code |
| `.agents/skills/` | Codex, OpenCode и другие совместимые агенты |
| `.grok/skills/` | Grok Build |
| `.qwen/skills/` | Qwen Code |
| `.opencode/skills/` | OpenCode |

Команда `node scripts/sync-skills.mjs --check` проверяет синхронность копий в CI.

## Уровни доступа (совпадают с сайтом)

| Уровень | Как получить | Задержка | Контакты |
|---|---|---|---|
| Гость (Guest) | без ключа | 12 ч | скрыты |
| Участник (Member) | вход через GitHub или рейтинг ≥ 1 | 3 ч | видны |
| Активный (Active) | рейтинг ≥ 10 за 30 дней | 30 мин | видны |
| Ядро (Core) | рейтинг ≥ 50 или модератор | нет | видны |

## Лицензия

Apache-2.0. См. [LICENSE](LICENSE). Код хаба openradar распространяется под AGPL-3.0: [MikhailSagalaev/openradar](https://github.com/MikhailSagalaev/openradar).
