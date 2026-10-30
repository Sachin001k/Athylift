// End-to-end test of the athlete and donor flows against the real Supabase project.
//
//   npm run test:e2e              run the flows (test data is kept so you can inspect it)
//   npm run test:e2e -- --cleanup delete every e2e test user and everything they created
//
// Creates two confirmed users (emails e2e-athlete-<time>@example.com / e2e-donor-<time>@example.com)
// with the service role key, then acts as each of them with the public anon key, exactly like the
// browser does, so row level security, column grants and triggers are all exercised.
// Reads Athylift/.env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(resolve(root, '.env'))) process.loadEnvFile(resolve(root, '.env'));

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, serviceKey, noSession);
const anon = createClient(url, anonKey, noSession);
const E2E_EMAIL = /^e2e-(athlete|donor)-\d+@example\.com$/;

const results = [];
let section = '';
const record = (name, ok, detail = '') => {
  results.push({ section, name, ok, detail });
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${detail ? `  — ${detail}` : ''}`);
};
const start = (title) => {
  section = title;
  console.log(`\n${title}`);
};
// Expect the call to succeed.
const ok = async (name, fn) => {
  try {
    const res = await fn();
    if (res?.error) return record(name, false, res.error.message), res;
    record(name, true);
    return res;
  } catch (err) {
    record(name, false, err.message);
    return { error: err };
  }
};
// Expect the call to be refused (an error, or no rows changed/returned).
const blocked = async (name, fn) => {
  try {
    const res = await fn();
    const rows = Array.isArray(res?.data) ? res.data.length : res?.data ? 1 : 0;
    if (res?.error || rows === 0) return record(name, true, res?.error ? `refused: ${res.error.message}` : 'no rows affected');
    record(name, false, `expected refusal, got ${rows} row(s)`);
  } catch (err) {
    record(name, true, `refused: ${err.message}`);
  }
};
const check = (name, condition, detail = '') => record(name, Boolean(condition), detail);

const cleanup = async () => {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const users = data.users.filter((u) => E2E_EMAIL.test(u.email || ''));
  for (const user of users) {
    // Profiles, requests, posts, achievements and notifications cascade from the auth user.
    await admin.from('donations').delete().eq('user_id', user.id);
    const { error: delError } = await admin.auth.admin.deleteUser(user.id);
    console.log(`${delError ? '✗' : '✓'} deleted ${user.email}${delError ? `: ${delError.message}` : ''}`);
  }
  if (users.length === 0) console.log('No e2e test users found.');
  // The anonymous contact message the test sends isn't tied to a user.
  const { data: messages } = await admin.from('contact_messages').delete().like('email', 'e2e-%@example.com').select('id');
  if (messages?.length) console.log(`✓ deleted ${messages.length} e2e contact message(s)`);
};

if (process.argv.includes('--cleanup')) {
  await cleanup();
  process.exit(0);
}

// --- Schema present? -------------------------------------------------------------------------
start('0. Schema');
for (const table of ['profiles', 'posts', 'donations', 'achievements', 'support_requests', 'athlete_directory', 'support_request_totals']) {
  const { error } = await admin.from(table).select('*').limit(0);
  check(`${table} reachable`, !error, error?.message);
}
if (results.some((r) => !r.ok)) {
  console.error('\nThe fundraising schema is missing. Run supabase_setup.sql (SQL Editor or `npm run db:setup`) first.');
  process.exit(1);
}

const stamp = Date.now();
const password = `E2e-${stamp}-pass!`;
const makeUser = async (role, name) => {
  const email = `e2e-${role}-${stamp}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, first_name: name.split(' ')[0], last_name: name.split(' ').slice(1).join(' '), role },
  });
  if (error) throw new Error(`create ${role}: ${error.message}`);
  const client = createClient(url, anonKey, noSession);
  const { error: loginError } = await client.auth.signInWithPassword({ email, password });
  if (loginError) throw new Error(`login ${role}: ${loginError.message}`);
  return { id: data.user.id, email, client };
};

// --- Athlete ---------------------------------------------------------------------------------
start('1. Athlete sign-up and onboarding');
const athlete = await makeUser('athlete', 'E2E Test Athlete');
const A = athlete.client;
record(`signed up and logged in as ${athlete.email}`, true);

const { data: athleteProfile } = await A.rpc('my_profile');
check('profile row created by trigger with role athlete', athleteProfile?.[0]?.role === 'athlete', JSON.stringify({ role: athleteProfile?.[0]?.role }));
check('onboarding not complete yet', athleteProfile?.[0]?.onboarding_complete === false);

await blocked('cannot post a support request before onboarding', () =>
  A.from('support_requests').insert({ athlete_id: athlete.id, title: 'Too early', description: 'x', category: 'equipment', target_amount: 100, intended_use: 'x' }).select('id'),
);

await ok('complete athlete onboarding (sport, goals, minor, location, academy)', () =>
  A.from('profiles')
    .update({
      full_name: 'E2E Test Athlete',
      bio: 'Test profile created by scripts/e2e-test.mjs',
      sport: 'Athletics',
      discipline: '400m',
      goals: 'Qualify for the state championships',
      location: 'Pune, Maharashtra',
      academy: 'Test Athletics Academy',
      is_minor: true,
      onboarding_complete: true,
    })
    .eq('id', athlete.id)
    .select('id'),
);

const { data: dirRow } = await anon.from('athlete_directory').select('*').eq('id', athlete.id).maybeSingle();
check('appears in public athlete directory', dirRow?.id === athlete.id);
check('minor: location hidden in directory', dirRow && dirRow.location === null, `location=${dirRow?.location}`);
check('minor: academy hidden in directory', dirRow && dirRow.academy === null, `academy=${dirRow?.academy}`);
await blocked('anon cannot read profiles.location directly', () => anon.from('profiles').select('location').eq('id', athlete.id));
await blocked('anon cannot read profiles.email', () => anon.from('profiles').select('email').eq('id', athlete.id));
await blocked('anon cannot read profiles.phone', () => anon.from('profiles').select('phone').eq('id', athlete.id));
await blocked('athlete cannot set own verification_status', () =>
  A.from('profiles').update({ verification_status: 'verified' }).eq('id', athlete.id).select('id'),
);
await blocked('athlete cannot mark self as sample profile', () => A.from('profiles').update({ is_sample: true }).eq('id', athlete.id).select('id'));
await blocked('role cannot be switched after onboarding', () => A.from('profiles').update({ role: 'donor' }).eq('id', athlete.id).select('id'));

start('2. Athlete achievements and posts');
await ok('add achievement', () =>
  A.from('achievements').insert({ athlete_id: athlete.id, title: 'Gold, U-18 400m (test)', event: 'District meet', level: 'state', achieved_on: '2026-08-15' }).select('id'),
);
const { data: publicAchievements } = await anon.from('achievements').select('id').eq('athlete_id', athlete.id);
check('achievement publicly visible', publicAchievements?.length === 1);
const { data: updatePost } = await ok('share a training update post', () =>
  A.from('posts').insert({ user_id: athlete.id, content: 'E2E test: training update', post_type: 'update' }).select('id').single(),
);
await blocked('cannot insert a post typed support_request directly', () =>
  A.from('posts').insert({ user_id: athlete.id, content: 'fake', post_type: 'support_request' }).select('id'),
);

start('3. Support request lifecycle');
const { data: draft } = await ok('save request as draft', () =>
  A.from('support_requests')
    .insert({
      athlete_id: athlete.id,
      title: 'E2E test: spikes and training kit',
      description: 'Test request created by scripts/e2e-test.mjs',
      category: 'equipment',
      target_amount: 10000,
      intended_use: '₹6,000 for spikes, ₹4,000 for training kit',
      status: 'draft',
    })
    .select('id, status')
    .single(),
);
const requestId = draft?.id;
await blocked('anon cannot see the draft', () => anon.from('support_requests').select('id').eq('id', requestId));
await blocked('anon cannot see the draft in totals', () => anon.from('support_request_totals').select('request_id').eq('request_id', requestId));
const { data: draftPosts } = await admin.from('posts').select('id').eq('support_request_id', requestId);
check('draft creates no feed post', draftPosts?.length === 0);

await ok('publish the draft', () => A.from('support_requests').update({ status: 'active' }).eq('id', requestId).select('id'));
const { data: feedPost } = await anon.from('posts').select('id, post_type, content').eq('support_request_id', requestId).maybeSingle();
check('publishing creates a public support_request feed post', feedPost?.post_type === 'support_request');

await ok('edit the request title', () => A.from('support_requests').update({ title: 'E2E test: spikes, kit and travel' }).eq('id', requestId).select('id'));
const { data: syncedPost } = await anon.from('posts').select('content').eq('support_request_id', requestId).maybeSingle();
check('feed post updated with the new title', syncedPost?.content?.startsWith('E2E test: spikes, kit and travel'));

await blocked('athlete cannot mark request funded', () => A.from('support_requests').update({ status: 'funded' }).eq('id', requestId).select('id'));
await blocked('published request cannot go back to draft', () => A.from('support_requests').update({ status: 'draft' }).eq('id', requestId).select('id'));

const { data: second } = await ok('publish a second request', () =>
  A.from('support_requests')
    .insert({ athlete_id: athlete.id, title: 'E2E test: coaching fees', description: 'Second test request', category: 'coaching', target_amount: 5000, intended_use: 'Three months of coaching' })
    .select('id')
    .single(),
);
await ok('close the second request', () => A.from('support_requests').update({ status: 'closed' }).eq('id', second?.id).select('id'));

// --- Donor -----------------------------------------------------------------------------------
start('4. Donor sign-up and onboarding');
const donor = await makeUser('donor', 'E2E Test Donor');
const D = donor.client;
record(`signed up and logged in as ${donor.email}`, true);
await ok('complete donor onboarding', () =>
  D.from('profiles').update({ full_name: 'E2E Test Donor', onboarding_complete: true }).eq('id', donor.id).select('id'),
);
const { data: donorDir } = await anon.from('athlete_directory').select('id').eq('id', donor.id);
check('donor does not appear in athlete directory', donorDir?.length === 0);
await blocked('donor cannot post a support request', () =>
  D.from('support_requests').insert({ athlete_id: donor.id, title: 'Donor request', description: 'x', category: 'other', target_amount: 100, intended_use: 'x' }).select('id'),
);
await blocked('donor cannot add achievements', () => D.from('achievements').insert({ athlete_id: donor.id, title: 'x' }).select('id'));
await blocked("donor cannot edit the athlete's request", () => D.from('support_requests').update({ title: 'hijacked' }).eq('id', requestId).select('id'));

start('5. Pledging (payments not live)');
const { data: pledge } = await ok('donor pledges ₹1,500 to the active request', () =>
  D.from('donations')
    .insert({ user_id: donor.id, request_id: requestId, amount: 1500, currency: 'INR', payment_method: 'pledge', cause_title: 'E2E test request', beneficiary_name: 'E2E Test Athlete', message: 'Go for it! (test)' })
    .select('id, status')
    .single(),
);
check('pledge stored with status "pledged"', pledge?.status === 'pledged', `status=${pledge?.status}`);
const { data: totals1 } = await anon.from('support_request_totals').select('*').eq('request_id', requestId).single();
check('raised stays ₹0 (pledges are not money)', Number(totals1?.amount_raised) === 0, `raised=${totals1?.amount_raised}`);
check('pledge counted separately', Number(totals1?.pledge_count) === 1 && Number(totals1?.amount_pledged) === 1500, JSON.stringify(totals1));
await blocked('donor cannot mark own pledge as paid', () => D.from('donations').update({ status: 'paid' }).eq('id', pledge?.id).select('id'));
await blocked('pledge to a closed request is refused', () =>
  D.from('donations').insert({ user_id: donor.id, request_id: second?.id, amount: 100 }).select('id'),
);
await blocked('athlete cannot pledge to own request', () =>
  A.from('donations').insert({ user_id: athlete.id, request_id: requestId, amount: 100 }).select('id'),
);
await blocked('anon cannot pledge', () => anon.from('donations').insert({ request_id: requestId, amount: 100 }).select('id'));
await blocked("athlete cannot read the donor's donation rows", () => A.from('donations').select('id').eq('id', pledge?.id));
const { data: myPledges } = await D.from('donations').select('id, request_id').eq('user_id', donor.id);
check('donor sees the pledge in "My support"', myPledges?.some((p) => p.request_id === requestId));
const { data: pledgeNote } = await A.from('notifications').select('title, body').eq('user_id', athlete.id).eq('title', 'New pledge');
check('athlete notified of the pledge', pledgeNote?.length === 1, pledgeNote?.[0]?.body);

start('6. Simulated payment webhook (service role)');
const { data: paid } = await ok('webhook records a verified ₹10,000 payment', () =>
  admin.from('donations').insert({ user_id: donor.id, request_id: requestId, amount: 10000, currency: 'INR', status: 'paid', payment_method: 'e2e-simulated' }).select('id').single(),
);
const { data: funded } = await anon.from('support_requests').select('status').eq('id', requestId).single();
check('request moves to "funded" automatically', funded?.status === 'funded', `status=${funded?.status}`);
const { data: totals2 } = await anon.from('support_request_totals').select('amount_raised').eq('request_id', requestId).single();
check('raised shows the verified ₹10,000', Number(totals2?.amount_raised) === 10000, `raised=${totals2?.amount_raised}`);
await ok('webhook refunds the payment', () => admin.from('donations').update({ status: 'refunded' }).eq('id', paid?.id).select('id'));
const { data: reopened } = await anon.from('support_requests').select('status').eq('id', requestId).single();
check('refund puts the request back to "active"', reopened?.status === 'active', `status=${reopened?.status}`);

start('7. Feed interactions');
await ok('donor likes the athlete post', () => D.from('post_likes').insert({ post_id: updatePost?.id, user_id: donor.id }).select('post_id'));
await ok('donor comments on the athlete post', () =>
  D.from('post_comments').insert({ post_id: updatePost?.id, user_id: donor.id, content: 'Keep going! (test)' }).select('id'),
);
const { data: counters } = await anon.from('posts').select('likes_count, comments_count').eq('id', updatePost?.id).single();
check('like and comment counters updated', counters?.likes_count === 1 && counters?.comments_count === 1, JSON.stringify(counters));
await blocked('donor cannot edit the athlete post', () => D.from('posts').update({ content: 'hijacked' }).eq('id', updatePost?.id).select('id'));
await blocked('donor cannot delete the athlete post', () => D.from('posts').delete().eq('id', updatePost?.id).select('id'));
await blocked('cannot write post counters directly', () => A.from('posts').update({ likes_count: 999 }).eq('id', updatePost?.id).select('id'));

start('8. Public endpoints and privacy');
for (const [table, columns] of [
  ['athlete_directory', '*'],
  ['support_requests', 'id, title, status'],
  ['support_request_totals', '*'],
  ['achievements', '*'],
  ['posts', 'id, post_type, support_request_id'],
  ['post_likes', '*'],
  ['post_comments', '*'],
  ['profiles', 'id, full_name, avatar_url, role, sport, goals'],
]) {
  const { error } = await anon.from(table).select(columns).limit(1);
  check(`anon can read ${table}`, !error, error?.message);
}
const { data: anonDonations } = await anon.from('donations').select('id').limit(5);
check('anon sees no donations', (anonDonations || []).length === 0);
const { data: anonNotes } = await anon.from('notifications').select('id').limit(5);
check('anon sees no notifications', (anonNotes || []).length === 0);
const { data: otherNotes } = await D.from('notifications').select('id').eq('user_id', athlete.id);
check("donor cannot read the athlete's notifications", (otherNotes || []).length === 0);
await blocked('anon cannot call request_amount_raised', () => anon.rpc('request_amount_raised', { p_request_id: requestId }));
await ok('anon can send a contact message', () =>
  anon.from('contact_messages').insert({ name: 'E2E Test', email: `e2e-${stamp}@example.com`, message: 'Test message from scripts/e2e-test.mjs' }),
);
const { data: anonContact } = await anon.from('contact_messages').select('id').limit(1);
check('anon cannot read contact messages', (anonContact || []).length === 0);

// --- Summary ---------------------------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  console.log('\nFailed:');
  failed.forEach((r) => console.log(`  ✗ [${r.section}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`));
}
console.log(`\nTest data kept for inspection in Supabase:
  athlete  ${athlete.email}  id ${athlete.id}
  donor    ${donor.email}  id ${donor.id}
  request  ${requestId} (active, 1 pledge)  ·  ${second?.id} (closed)
  password for both: ${password}
Remove it with: npm run test:e2e -- --cleanup`);
process.exit(failed.length ? 1 : 0);
