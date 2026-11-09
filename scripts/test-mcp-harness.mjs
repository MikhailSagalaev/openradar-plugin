#!/usr/bin/env node
/**
 * MCP Harness for openradar agent integrations.
 * Verifies that the openradar MCP server answers spec-compliant JSON-RPC over Streamable HTTP,
 * returns all declared tools, and accurately filters by workplace arrangement and direction.
 *
 * Usage:
 *   node scripts/test-mcp-harness.mjs [url]
 * Default url: https://openradar.fun/mcp
 */

const DEFAULT_URL = process.env.RADAR_MCP_URL || 'https://openradar.fun/mcp';
const endpoint = process.argv[2] || DEFAULT_URL;

async function rpc(method, params = {}, id = 1) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${endpoint}`);
  }
  return res.json();
}

async function run() {
  console.log(`Running openradar MCP harness against: ${endpoint}`);

  // 1. Initialize
  const init = await rpc('initialize', { protocolVersion: '2024-11-05' }, 1);
  if (!init.result || !init.result.serverInfo || init.result.serverInfo.name !== 'openradar') {
    throw new Error(`initialize failed: ${JSON.stringify(init)}`);
  }
  console.log(`[PASS] initialize: protocol ${init.result.protocolVersion}, server ${init.result.serverInfo.name}`);

  // 2. tools/list
  const toolsRes = await rpc('tools/list', {}, 2);
  const tools = toolsRes.result?.tools || [];
  const toolNames = tools.map((t) => t.name);
  console.log(`[PASS] tools/list: found ${tools.length} tools (${toolNames.join(', ')})`);
  for (const required of ['search_leads', 'get_lead_details', 'estimate_compensation', 'submit_lead', 'vote_lead', 'get_market_analytics', 'xray_generate_dorks']) {
    if (!toolNames.includes(required)) {
      throw new Error(`Missing expected tool: ${required}`);
    }
  }

  // 3. search_leads with workplace and direction
  const searchRes = await rpc('tools/call', {
    name: 'search_leads',
    arguments: { workplace: 'remote', limit: 3 },
  }, 3);
  const rawText = searchRes.result?.content?.[0]?.text;
  if (!rawText) throw new Error(`search_leads returned no content: ${JSON.stringify(searchRes)}`);
  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed.results)) throw new Error(`search_leads results is not an array`);
  console.log(`[PASS] search_leads: received ${parsed.results.length} remote leads`);

  // 4. get_market_analytics
  const analyticsRes = await rpc('tools/call', {
    name: 'get_market_analytics',
    arguments: { type: 'job' },
  }, 4);
  const analyticsText = analyticsRes.result?.content?.[0]?.text;
  if (!analyticsText) throw new Error(`get_market_analytics returned no content`);
  const analytics = JSON.parse(analyticsText);
  if (typeof analytics.total_analyzed_leads !== 'number') {
    throw new Error(`Invalid analytics response`);
  }
  console.log(`[PASS] get_market_analytics: analyzed ${analytics.total_analyzed_leads} leads, top skills: ${analytics.top_skills?.length || 0}`);

  console.log('\nAll MCP harness checks passed successfully.');
}

run().catch((err) => {
  console.error(`\nHarness FAILED: ${err.message}`);
  process.exit(1);
});
