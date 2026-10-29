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
