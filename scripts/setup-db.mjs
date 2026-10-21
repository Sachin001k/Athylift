// Creates/updates every table, policy, trigger and storage bucket the app needs.
//
//   npm run db:setup
//
// Reads Athylift/.env. Creating tables needs ONE of these (API keys alone cannot run SQL):
//   SUPABASE_DB_URL        Postgres connection string (Project Settings -> Database -> Connection string)
//   SUPABASE_ACCESS_TOKEN  Personal access token (supabase.com/dashboard/account/tokens)
// With only SUPABASE_SERVICE_ROLE_KEY, the script creates the storage buckets and reports
// which tables are still missing.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.SUPABASE_DB_URL;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const sql = readFileSync(resolve(root, 'supabase_setup.sql'), 'utf8');

const TABLES = ['profiles', 'posts', 'post_likes', 'post_comments', 'notifications', 'donations', 'contact_messages'];
const BUCKETS = [
  { id: 'post-attachments', file_size_limit: 52428800 },
  { id: 'profile-media', file_size_limit: 5242880, allowed_mime_types: ['image/*'] },
];

const fail = (message) => {
  console.error(`\n✖ ${message}`);
  process.exit(1);
};

if (!supabaseUrl) fail('VITE_SUPABASE_URL is missing from .env');
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

const applyWithConnectionString = async () => {
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
};

const applyWithAccessToken = async () => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) throw new Error(`Management API ${res.status}: ${await res.text()}`);
};

const ensureBuckets = async () => {
  const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' };
  for (const bucket of BUCKETS) {
    const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: bucket.id, public: true, ...bucket }),
    });
    const body = await res.text();
    if (res.ok) console.log(`  ✓ bucket ${bucket.id} created`);
    else if (/already exists|Duplicate/i.test(body)) console.log(`  ✓ bucket ${bucket.id} already exists`);
    else console.warn(`  ! bucket ${bucket.id}: ${res.status} ${body}`);
  }
};

const missingTables = async () => {
  const key = serviceRoleKey || process.env.VITE_SUPABASE_ANON_KEY;
  if (!key) return null;
  const missing = [];
  for (const table of TABLES) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=0`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    // 401/403 means the table exists but this key may not read it (e.g. contact_messages with the anon key).
    if (res.status === 404 || (res.status === 400 && /does not exist|schema cache/i.test(await res.text()))) {
      missing.push(table);
    }
  }
  return missing;
};

console.log(`Supabase project: ${projectRef}`);

if (dbUrl || accessToken) {
  console.log(`Applying supabase_setup.sql via ${dbUrl ? 'database connection' : 'Management API'}...`);
  try {
    await (dbUrl ? applyWithConnectionString() : applyWithAccessToken());
  } catch (err) {
    fail(`Setup failed: ${err.message}`);
  }
  console.log('  ✓ tables, policies, triggers and buckets are up to date');
} else if (serviceRoleKey) {
  console.log('No SUPABASE_DB_URL or SUPABASE_ACCESS_TOKEN set; creating storage buckets only...');
  await ensureBuckets();
} else {
  fail('Set SUPABASE_DB_URL or SUPABASE_ACCESS_TOKEN in .env (see the top of scripts/setup-db.mjs).');
}

// PostgREST caches the schema briefly; a fresh table can take a moment to appear.
await new Promise((r) => setTimeout(r, 1500));
const missing = await missingTables();
if (missing === null) {
  console.log('Skipping verification (no API key in .env).');
} else if (missing.length > 0) {
  fail(
    `Missing tables: ${missing.join(', ')}.\n` +
      '  API keys (anon / service_role) cannot create tables. Add SUPABASE_DB_URL or\n' +
      '  SUPABASE_ACCESS_TOKEN to .env and run `npm run db:setup` again.'
  );
} else {
  console.log(`  ✓ all ${TABLES.length} tables reachable through the API`);
  console.log('\nDatabase is ready.');
}
