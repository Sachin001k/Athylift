// Keeps the free-tier Supabase project from being paused for inactivity
// (free projects pause after ~7 days without requests).
//
//   npm run db:keep-alive
//
// Runs on a schedule from .github/workflows/supabase-keep-alive.yml.
// Exits non-zero if the project does not answer, so a failed run (e.g. already paused) is visible.
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('✖ Set SUPABASE_URL and SUPABASE_ANON_KEY (or the VITE_ versions in .env).');
  process.exit(1);
}

const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };

const ping = async (label, path) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${supabaseUrl}${path}`, { headers, signal: AbortSignal.timeout(20000) });
      if (res.ok) {
        console.log(`✓ ${label}: ${res.status}`);
        return true;
      }
      console.warn(`! ${label}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    } catch (err) {
      console.warn(`! ${label}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, attempt * 5000));
  }
  return false;
};

// A real database query (not just a health check) so the project registers activity.
const results = [
  await ping('database query', '/rest/v1/posts?select=id&limit=1'),
  await ping('auth service', '/auth/v1/health'),
];

if (results.includes(false)) {
  console.error('✖ Supabase did not respond. If the project is paused, restore it from the dashboard.');
  process.exit(1);
}
console.log(`Supabase project is awake (${new Date().toISOString()}).`);
