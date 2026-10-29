# Athylift rework log

Branch: `rework/athylift-identity`

## Phase 0 — Discovery (2026-10-29)

### Stack (differs from the spec's Next.js assumptions)

| Area | Actual |
| --- | --- |
| Framework | Vite 5 + React 18 + TypeScript (SPA, Lovable template `vite_react_shadcn_ts`) |
| Router | react-router-dom v6, client-side; `vercel.json` rewrites all paths to `index.html` |
| Auth | Supabase Auth (`src/contexts/AuthContext.tsx`), `ProtectedRoute` guard |
| DB | Supabase Postgres, schema + RLS in `supabase_setup.sql`, applied by `npm run db:setup` |
| Storage | Supabase Storage buckets (`src/lib/storage.ts`) |
| Styling | Tailwind 3 + DaisyUI themes (light/dark/sport) + shadcn/ui primitives; fonts Montserrat + "Avenir" brand stack |
| Server | None. No API routes — all reads/writes go from browser to Supabase under RLS |

Consequences for the spec:
- `NEXT_PUBLIC_SITE_URL` → `VITE_SITE_URL`.
- Spec's `/api/*` endpoints → Supabase queries + RLS policies + Postgres functions/triggers.
- The donation webhook (the only place a donation may become SUCCEEDED) needs a server: a Supabase Edge Function or a Vercel serverless function. Not needed while payments are prototype-only.
- `next/image` → plain `<img>` with an `ImageWithFallback` component.

### Current routes (`src/App.tsx`)

| Route | Access | Page |
| --- | --- | --- |
| `/` | public | Home (parent-community copy) |
| `/explore` | protected | Feed (posts, likes, comments, donate modal) |
| `/add-post` | protected | AddPost |
| `/my-posts` | protected | MyPosts |
| `/profile` | protected | Profile |
| `/donations` | protected | Donations (user's own pledges) |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | guest | Auth |
| `/about`, `/terms`, `/disclaimer`, `/privacy`, `/features`, `/pricing`, `/faq`, `/contact` | public | Static pages |
| `*` | all | NotFound |

Missing vs spec: `/athletes`, `/athletes/:id`, `/feed` (public), `/requests*`, `/how-it-works`, `/signup`, `/onboarding`, `/dashboard`, `/posts/new`, `/profile/edit`, `/notifications`, `/settings`, `/help`.

### Leftover parent/wellbeing content

Introduced in commit `e91402c init` (author shivam-chaturvedi, 2025-11-21), which rewrote Home, About, FAQ, Privacy, Login, Register and others.

| File | What |
| --- | --- |
| `src/pages/Home.tsx` | Hero "Trusted Space for Every Parent", parent mission, therapist copy, sample posts "Late-night parenting win", "Balancing work and toddlers" |
| `src/pages/About.tsx` | Whole page is parent/therapist copy |
| `src/pages/FAQ.tsx` | Parenting Q&A |
| `src/pages/Privacy.tsx` | "parenting topics followed", "therapist connections" |
| `src/pages/Login.tsx:95` | "Connect with parents and trusted experts" |
| `src/pages/Register.tsx` | Default role `Parent`; role options Parent / Therapist / Expert; "trusted parenting community" |
| `src/pages/Disclaimer.tsx:52` | "well-being during athletic activities" — fine, keep |
| `src/pages/Features.tsx`, `Pricing.tsx` | Athletes / Fans / Brands + pricing tiers — not in spec, needs a decision |

### Brand spelling

UI text already says `Athylift`. Only wrong spelling: localStorage key `athlyft-theme` (`index.html:22`, `src/contexts/ThemeContext.tsx:14,34`). Renaming it resets saved themes once; plan is to read the old key as a fallback.

`package.json` name is `vite_react_shadcn_ts` (not user-facing).

### Hard-coded URLs

None found (`*.vercel.app` / lovable) in `src`, `index.html`, `scripts`, `.github`.

### Metadata

`index.html`: title "Athylift - Social Platform for Athletes", generic description, OG tags. No manifest, favicon is template default.

### Env var names

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, (`SUPABASE_DB_URL` / `SUPABASE_ACCESS_TOKEN` for setup). Vercel project not linked locally (no `.vercel/`); CLI logged in as `sachin001k`.

### Database (from `supabase_setup.sql`; live rows not inspected)

Tables: `profiles` (free-text `role`), `posts`, `post_likes`, `post_comments`, `notifications`, `donations`, `contact_messages`. Storage buckets with `athylift:` policies.

- `profiles.role` is free text from signup metadata. Existing users likely hold `Parent` / `Therapist / Expert` / others.
- `donations.status` = `pledged | paid | failed | refunded`; the app inserts `pledged` and the thank-you modal already says no money is charged. No totals are derived from donations anywhere yet.
- No athlete-profile, achievement, support-request, or report tables.

### Fake data check

`StatsRail` shows a live post count (real). No fabricated totals or testimonials found outside Home's sample posts.

### Open questions

1. Canonical domain (`athylift-…vercel.app` vs `athlyft.vercel.app`)?
2. Default role for existing users whose role is Parent/Therapist/other?
3. Keep, rewrite, or remove `/features` and `/pricing`?
4. May I query the live DB (read-only) to count users by role and check for parent-app rows?

## Phase 1a — UI copy (2026-10-29)

Scope: rewrite every user-facing text for underprivileged athletes and donors. No payment, schema or route changes.

| File | Change |
| --- | --- |
| `src/pages/Home.tsx` | New hero, mission, 3-step How It Works, 6 values, athlete/donor CTA cards, footer (Explore / Learn / Account & legal). Removed parent sample posts and "Services: Branding/Design/Marketing" |
| `src/pages/About.tsx` | Mission, approach, how it works, values from spec |
| `src/pages/FAQ.tsx` | 8 athlete/donor FAQs (incl. payments not live, minors' privacy) |
| `src/pages/Features.tsx` | Now "How Athylift Works": For Athletes / For Donors (removed Fans/Brands) |
| `src/pages/Pricing.tsx` | Now "Free for athletes and donors"; removed $9.99/$4.99 plans and invented trial/payment-method claims |
| `src/pages/Privacy.tsx` | Athlete/donor data; removed parenting/therapist lines and the unbacked "end-to-end encryption" claim |
| `src/pages/Terms.tsx`, `Disclaimer.tsx` | Added athlete/support-request and donor/contribution terms; fundraising disclaimer |
| `src/pages/Register.tsx` | Role picker is Athlete / Donor; `?role=athlete|donor` preselects; athlete/donor copy |
| `src/pages/Login.tsx` | Athlete/donor copy |
| `src/pages/Explore.tsx` | "Athlete Feed"; donation modal "Support this athlete" (pledge flow unchanged); empty state |
| `src/pages/AddPost.tsx`, `Profile.tsx`, `Donations.tsx`, `Contact.tsx`, `NotFound.tsx` | Copy tweaks |
| `src/components/Navbar.tsx` | Nav: Home · About · How it works · FAQ · Contact; search placeholder |
| `index.html` | Title, description, OG tags |

Notes:
- CTAs point at existing routes until Phase 2 adds `/athletes`, `/requests`, `/how-it-works`: "Explore athletes" / "Browse funding requests" → `/explore`, "How it works" → `/features`, "Post a support request" → `/add-post`.
- Pre-existing lint error `Explore.tsx:412` (`no-explicit-any`) left as is.

## Phase 2–3 — Working model (2026-10-29)

Scope: athlete profiles, funding requests, role-based signup/onboarding/dashboard, public feed. Payments stay prototype (pledges only). Verification workflow, reports/moderation, sample data and real gateway are not built yet.

### Database (`supabase_setup.sql`, new section at the end; safe to re-run)

Live DB before this change (read-only check): 2 profiles (roles `Parent`, `Supporter`), 0 posts, 0 donations, 1 contact message.

| Change | Detail |
| --- | --- |
| `profiles` | + `sport`, `discipline`, `location`, `academy`, `goals`, `is_minor`, `verification_status` (not client-writable), `is_sample` (not client-writable), `onboarding_complete`. `role` limited to `athlete`/`donor`; old roles: `Supporter` → `donor`, others → null (user picks in onboarding) |
| `athlete_directory` view | Public athlete list; hides `location`/`academy` when `is_minor` (those columns are not in the public grant) |
| `achievements` (new) | Owner-managed, public read |
| `support_requests` (new) | Draft/active/funded/closed; drafts visible to owner only; only athletes can create (trigger); `funded` set only by DB when paid total ≥ target; publishing creates a `support_request` feed post |
| `posts` | + `post_type` (`update`/`achievement` from users, `support_request` only via trigger), + `support_request_id` (cascade) |
| `donations` | + `request_id`; inserts only to active requests, not your own; pledge notifies the athlete |
| `support_request_totals` view | `amount_raised` = paid only; pledges counted separately |

No tables dropped.

### App

New: `src/lib/athylift.ts`, `src/components/fundraising/*`, pages `Athletes`, `AthleteDetail`, `Requests`, `RequestDetail`, `RequestForm`, `Onboarding`, `Dashboard`.

Routes: `/athletes`, `/athletes/:id`, `/feed` (public; `/explore` redirects), `/requests`, `/requests/:id`, `/requests/new` + `/requests/:id/edit` (athletes), `/onboarding`, `/dashboard`, `/how-it-works` (`/features` redirects), `/signup` → `/register`.

- `ProtectedRoute`: sends users without a role / finished onboarding to `/onboarding`; `role` prop restricts athlete-only pages.
- `AuthContext`: exposes `role`, `onboardingComplete`, `profileReady`.
- Navbar/Sidebar: Athletes · Feed · Funding requests · How it works · About; Dashboard and role-specific items when logged in.
- Feed: post type badges, author links to athlete profile, "Support" on request posts → request page. Removed the per-post donate modal (pledges now go through requests).
- Login/Register/Reset default destination: `/dashboard`.

### Not verified

SQL is syntax-checked (pglast) but not yet applied: `.env` has no `SUPABASE_DB_URL` / `SUPABASE_ACCESS_TOKEN`. Pages using new tables will error until it is applied.

## Review fixes, UI pass and e2e test (2026-10-29)

### Bug review (independent read-only reviewer) — fixed
| # | Issue | Fix |
| --- | --- | --- |
| 1 | Role could be switched via API after onboarding, breaking requests and the future webhook's funded update | `profiles_role_guard` trigger; request guard only checks role when the athlete is acting |
| 2 | Editing a request left the feed post stale; replacing the photo broke its image | `support_requests_sync_post` trigger |
| 3 | Users with no profile row looped on onboarding | Onboarding updates, then inserts if 0 rows |
| 4 | Past deadline blocked "Save changes" | `min` date only for new requests |
| 5 | Athlete role alone (before onboarding) could publish; active→draft left a public post | Guard requires `onboarding_complete`; unpublishing refused |
| 6 | Totals view / RPC exposed other athletes' drafts | View filters drafts; RPC not callable by clients |
| 7 | Logged-in users without a role hit a dead end on requests | Link to onboarding |
| 8 | Onboarding ignored the page the user was heading to | Honours `state.from` |
| 9 | Stale profile response after switching users; transient error bounced users to onboarding | Ref guard; errors keep previous state |
| 10 | Donors could add achievements; refunds never un-funded; deadline shown a day early in some timezones | Athlete-only policy; refund reopens; local date parsing |

Not fixed: unlimited pledges can spam athlete notifications (rate limiting needs a server).

### UI
- Avatars: cartoon dicebear avatars replaced by `UserAvatar` (photo, else initials on a colour badge; no external service).
- Light theme rebuilt on spec tokens (navy/white/orange; previous light theme used #86888A page background and #313335 footer with black text). Dark theme retuned. Fonts: Barlow / Barlow Condensed; body weight 300 → 400.
- Home redesigned: animated hero (track lanes, running streaks, floating request preview), clickable sports ticker, scroll-reveal sections, hover motion, live funding requests (real data only), navy values and footer. `prefers-reduced-motion` disables animation.
- Navbar fits 360px screens. Checked via Chrome DevTools emulation at 390px (no horizontal scroll) and 1280/1440px, light and dark.

### E2E
`scripts/e2e-test.mjs` (`npm run test:e2e`, `-- --cleanup`). Not yet run: schema not applied.
