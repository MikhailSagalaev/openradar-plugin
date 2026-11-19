# openradar 插件（中文说明）

[English](README.md) · [Русский](README.ru.md) · **简体中文**

面向 AI 智能体（Agent）的 openradar 插件：搜索实时招聘与自由职业订单、用真实挂牌薪资估算行情、引用每日市场研究报告，并把观察到的线索回馈到开放网络。

- **MCP 端点**：`https://openradar.fun/mcp`（Streamable HTTP，免登录即可读取；访客看到延迟 12 小时的数据流且不含联系方式，每条线索均指向原始帖子）
- **个人令牌**：仅在需要写入操作时使用（`submit_lead`、`vote_lead`、`save_search`），在 [openradar.fun/me](https://openradar.fun/me) 用 GitHub 登录后签发，请求头 `Authorization: Bearer mcp_…`
- **许可证**：Apache-2.0（插件）/ 数据集 CC BY 4.0

## 一条命令安装

**Claude Code：**

```
/plugin marketplace add MikhailSagalaev/openradar-plugin
/plugin install openradar@openradar
```

**其他智能体 CLI（skills.sh 兼容）：**

```
npx skills add MikhailSagalaev/openradar-plugin
```

**Grok Build：** 见 `SUBMISSION.md`（已向 [xai-org/plugin-marketplace](https://github.com/xai-org/plugin-marketplace) 提交 PR）。

## 在中国生态的 CLI 中连接（Qwen Code / iFlow / Kimi CLI / Trae / CodeBuddy）

所有支持 MCP 的客户端都连接同一个端点。以 **Qwen Code**（与 Gemini CLI 同格式）为例，在 `~/.qwen/settings.json` 中：

```json
{
  "mcpServers": {
    "openradar": {
      "httpUrl": "https://openradar.fun/mcp",
      "timeout": 30000
    }
  }
}
```

- **iFlow CLI**：`~/.iflow/settings.json`，同样使用 `mcpServers` + `httpUrl` 结构。
- **Trae**：设置 → MCP → 添加远程服务器，URL 填 `https://openradar.fun/mcp`（Streamable HTTP）。
- **Kimi CLI / CodeBuddy**：在各自 MCP 设置中添加远程 HTTP 服务器，端点相同。

配置好后，智能体即可使用 `search_leads`（搜索）、`get_lead_details`（详情）、`estimate_compensation`（薪资估算）等工具；无需任何 API Key。

## 插件内容

| 路径 | 功能 |
|---|---|
| `skills/search-orders` | 搜索订单与职位：MCP `search_leads`（过滤、紧凑结果、分页）+ `get_lead_details` |
| `skills/market-research` | "这个活多少钱"：基于真实挂牌薪资的百分位估算 + 每月研究报告（CC BY 4.0） |
| `skills/submit-lead` | 把观察到的线索（Telegram 帖子、RSS、邮件提醒）回馈到网络 |
| `commands/orders.md` | `/orders <query>` — 最新线索表格 |
| `commands/market.md` | `/market <skill>` — p25/中位数/p75 行情估算 |
| `agents/lead-scout.md` | 只读侦察智能体：盯查询、准备增量摘要 |
| `.mcp.json` | MCP 连接（免登录访客访问） |

## 使用礼仪

- 引导用户到原始帖子链接；不存储、不转载联系方式。
- 用 `/api/delta` 做增量同步，不要反复拉全量数据；遵守 `Cache-Control`。
- 线索 ID 返回 404 可能只是"访客尚未可见"，稍后重试即可。
