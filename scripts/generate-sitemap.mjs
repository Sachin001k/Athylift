// Writes public/sitemap.xml before each build: the public pages plus every public athlete
// profile and published funding request. Runs from `npm run build`, so Vercel refreshes it on
// every deploy. If Supabase can't be reached, the sitemap still lists the fixed pages.
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(resolve(root, '.env'))) process.loadEnvFile(resolve(root, '.env'));

const site = (process.env.VITE_SITE_URL || 'https://athylift.com').replace(/\/$/, '');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const STATIC = [
  ['/', 'daily', '1.0'],
  ['/athletes', 'daily', '0.9'],
  ['/requests', 'daily', '0.9'],
  ['/feed', 'daily', '0.7'],
  ['/how-it-works', 'monthly', '0.8'],
  ['/about', 'monthly', '0.7'],
  ['/faq', 'monthly', '0.6'],
  ['/register', 'monthly', '0.6'],
  ['/contact', 'yearly', '0.4'],
  ['/pricing', 'yearly', '0.4'],
  ['/terms', 'yearly', '0.2'],
  ['/privacy', 'yearly', '0.2'],
  ['/disclaimer', 'yearly', '0.2'],
];

// Reads with the public anon key, so only what any visitor can see ends up in the sitemap.
const fetchRows = async (path) => {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
};

const entries = STATIC.map(([path, changefreq, priority]) => ({ loc: `${site}${path}`, changefreq, priority }));
let dynamicCount = 0;
if (supabaseUrl && anonKey) {
  try {
    const [athletes, requests] = await Promise.all([
      fetchRows('athlete_directory?select=id,created_at&is_sample=eq.false&limit=5000'),
      fetchRows('support_requests?select=id,updated_at&status=in.(active,funded)&limit=5000'),
    ]);
    athletes.forEach((a) => entries.push({ loc: `${site}/athletes/${a.id}`, lastmod: a.created_at, changefreq: 'weekly', priority: '0.7' }));
    requests.forEach((r) => entries.push({ loc: `${site}/requests/${r.id}`, lastmod: r.updated_at, changefreq: 'daily', priority: '0.8' }));
    dynamicCount = athletes.length + requests.length;
  } catch (err) {
    console.warn(`sitemap: could not load athletes/requests (${err.message}); writing fixed pages only.`);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod.slice(0, 10)}</lastmod>` : ''}<changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>
`;
writeFileSync(resolve(root, 'public/sitemap.xml'), xml);
console.log(`sitemap: ${entries.length} URLs (${dynamicCount} athletes/requests) → public/sitemap.xml`);
