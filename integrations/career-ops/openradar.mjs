/**
 * OpenRadar provider for career-ops (`providers/openradar.mjs`).
 *
 * Fetches verified job vacancies and freelance leads from the public OpenRadar
 * network (`https://openradar.fun/v2/feed`), prioritizing direct Telegram channel
 * observations and remote engineering roles with normalized ISCO-08 occupation codes.
 *
 * License: Apache-2.0
 */

const DEFAULT_BASE_URL = process.env.OPENRADAR_URL || 'https://openradar.fun';

export const meta = {
  id: 'openradar',
  name: 'openradar (Telegram & Remote Boards)',
  homepage: 'https://openradar.fun',
  hooks: ['provider'],
  rateLimitPerMinute: 60,
};

/**
 * Fetches normalized job postings from OpenRadar's `/v2/feed` endpoint.
 *
 * @param {object} [options]
 * @param {string} [options.query] - Keyword or stack query (e.g. "Golang", "Senior Python")
 * @param {string} [options.type='job'] - 'job' (employment) or 'gig' (freelance order)
 * @param {boolean} [options.remote=true] - Filter to remote-capable positions
 * @param {string} [options.direction] - Role direction (backend, frontend, devops, ai, qa, design, product)
 * @param {string} [options.occupationCode] - Comma-separated ILO ISCO-08 occupation code(s), e.g. "2512,2513"
 * @param {string} [options.language] - 'ru', 'en', or 'all'
 * @param {number} [options.limit=50] - Max items (1..200)
 * @param {string} [options.token] - Optional OpenRadar participant token (`mcp_...`)
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function fetchJobs(options = {}) {
  const {
    query,
    type = 'job',
    remote = true,
    direction,
    occupationCode,
    language = 'all',
    limit = 50,
    token = process.env.OPENRADAR_TOKEN,
  } = options;

  const url = new URL('/v2/feed', DEFAULT_BASE_URL);
  url.searchParams.set('type', type);
  url.searchParams.set('limit', String(Math.min(Math.max(Number(limit) || 50, 1), 200)));
  url.searchParams.set('language', language);
  if (remote) url.searchParams.set('remote', '1');
  if (query) url.searchParams.set('q', String(query));
  if (direction) url.searchParams.set('direction', String(direction));
  if (occupationCode) url.searchParams.set('occupation_code_or', String(occupationCode));

  const headers = {
    Accept: 'application/json',
    'User-Agent': 'career-ops-openradar-provider/1.0 (+https://openradar.fun)',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`OpenRadar API returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const leads = Array.isArray(data.leads) ? data.leads : [];

  return leads.map((lead) => ({
    id: `openradar:${lead.id}`,
    title: lead.title,
    company: lead.company || lead.author || (lead.sourceRef?.channelTitle ?? 'Direct Client / Channel'),
    location: lead.workplaceType === 'remote' || lead.isRemote ? 'Remote' : (lead.city || 'Onsite'),
    workplace_type: lead.workplaceType || (lead.isRemote ? 'remote' : 'onsite'),
    direction: lead.direction || null,
    occupation_code: lead.occupationCode || null,
    occupation_label: lead.occupationLabel || null,
    salary_min: lead.normalizedUsdMin ?? lead.budget ?? null,
    salary_max: lead.normalizedUsdMax ?? lead.budget ?? null,
    currency: lead.normalizedUsdMin ? 'USD' : (lead.currency || null),
    skills: Array.isArray(lead.skills) ? lead.skills : [],
    url: lead.canonicalUrl || lead.url,
    source_platform: lead.sourceRef?.platform || 'openradar',
    source_channel: lead.sourceRef?.channel || null,
    published_at: lead.publishedAt || lead.createdAt,
    description: lead.text || '',
  }));
}

export default { meta, fetchJobs };
