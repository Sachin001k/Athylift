# Athylift

**Live site: [athylift.com](https://athylift.com)**

Athylift is a fundraising and community platform that connects underprivileged athletes with donors who help fund equipment, coaching, training and academy fees.

- **Athletes** create a profile, share achievements and training updates, and post support requests that state a target amount and exactly how the money will be used.
- **Donors** explore athletes and funding requests, pledge support, and follow the journeys they back.

> **Payments are not live yet.** Donors record *pledges*; no money is collected. "Raised" totals count verified payments only, so they stay at ₹0 until a payment gateway is connected.

## Features

| Area | What it does |
| --- | --- |
| Sign-up and roles | Join as an athlete or a donor; onboarding collects the role-specific details. A role is fixed once onboarding is complete. |
| Athlete profiles | Public directory with search and sport filter; profile page with story, goals, achievements, open requests and recent posts. For athletes under 18, location and academy are hidden by the database. |
| Funding requests | Create, save as draft, publish, edit and close. Each shows category, target, amount raised, amount remaining and intended use. Publishing posts it to the feed. |
| Pledges | Donors pledge to active requests (not their own). The athlete is notified. A request is marked *funded* automatically when verified payments reach the target, and reopens if a payment is refunded. |
| Feed | Public feed of training updates, achievements and funding requests, with likes, comments, shares and search. |
| Dashboards | Athletes manage requests and achievements; donors see the support they've pledged. |
| SEO | Per-page titles and descriptions, canonical URLs, share images, structured data, `robots.txt` and an auto-generated `sitemap.xml`. |

## Tech stack

- **Front end:** React 18, TypeScript, Vite, React Router, Tailwind CSS with daisyUI and shadcn/ui.
- **Back end:** [Supabase](https://supabase.com) (Postgres, Auth, Storage). There is no custom server: the browser talks to Supabase directly, and access is enforced by row-level security policies, column grants and triggers in [`supabase_setup.sql`](supabase_setup.sql).
- **Hosting:** Vercel. The domain is registered at Hostinger and points to Vercel.

## Getting started

Requires Node.js 20.12 or later.

```bash
git clone https://github.com/Sachin001k/Athylift.git
cd Athylift
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:8080 (Vite prints the exact port)
```

### Environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | App | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | App | Public anon key; safe in the browser because access is controlled by RLS. |
| `VITE_SITE_URL` | App, sitemap | Public address for canonical links and the sitemap. Defaults to `https://athylift.com`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts only | **Never** prefix with `VITE_` or expose it to the browser. |
| `SUPABASE_DB_URL` or `SUPABASE_ACCESS_TOKEN` | `db:setup` only | Needed to create tables (API keys can't run SQL). |

### Database setup

The whole schema, including tables, policies, triggers, views and storage buckets, lives in [`supabase_setup.sql`](supabase_setup.sql). It is safe to run more than once.

- **Option 1:** paste the file into the Supabase **SQL Editor** and run it.
- **Option 2:** set `SUPABASE_DB_URL` (or `SUPABASE_ACCESS_TOKEN`) in `.env` and run `npm run db:setup`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` | Generate `public/sitemap.xml` from Supabase, then build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run db:setup` | Apply `supabase_setup.sql` to the Supabase project. |
| `npm run test:e2e` | End-to-end test against the real Supabase project (see below). |
| `npm run test:e2e -- --cleanup` | Delete all e2e test users and the data they created. |
| `npm run sitemap` | Regenerate `public/sitemap.xml` on its own. |

### End-to-end test

`scripts/e2e-test.mjs` creates a test athlete and a test donor (`e2e-…@example.com`), then signs in as each of them using the public anon key, exactly as the browser does. It checks:

- the full athlete and donor flows;
- permissions: what each role can and can't read or change;
- privacy, such as minors' locations and private columns;
- the pledge, funding and refund logic.

It needs `SUPABASE_SERVICE_ROLE_KEY` in `.env`. Test data is kept so you can inspect it. **Run `--cleanup` afterwards**, so test profiles don't appear on the live site or in the sitemap.

## Project structure

```
src/
  pages/                 one file per route (Home, Athletes, RequestDetail, Dashboard, …)
  components/            layout (Navbar, Sidebar), fundraising cards, avatars, scroll/meta helpers
  components/ui/         shadcn/ui primitives
  contexts/              AuthContext (session, role, onboarding), ThemeContext
  lib/                   Supabase client, shared types/constants (athylift.ts), storage, SEO helpers
scripts/                 db setup, sitemap generator, e2e test, keep-alive ping
public/                  icons, share image, robots.txt, web manifest
supabase_setup.sql       complete database schema and security rules
docs/REWORK_LOG.md       detailed log of the rework and its decisions
```

## Deployment

- **Production:** pushing or merging to `main` deploys to [athylift.com](https://athylift.com) automatically. Other branches get a Vercel preview URL.
- **Vercel environment variables:** set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for both Production and Preview.
- **Domain:** `athylift.com` serves the site, and `www.athylift.com` redirects to it (308).
  - At Hostinger, the DNS has an **A** record for `@` and a **CNAME** for `www`, pointing to Vercel.
- **Supabase Auth:** under **Authentication → URL Configuration**:
  - set **Site URL** to `https://athylift.com`;
  - add `https://athylift.com/**` to **Redirect URLs**.
  Without these, confirmation and password-reset emails won't return users to the site.
- **Sitemap:** rebuilt on every deploy. If profiles or requests change and you want search engines to see them sooner, redeploy.
- **Keep-alive:** a GitHub Action (`.github/workflows/supabase-keep-alive.yml`) pings Supabase so a free-tier project isn't paused for inactivity.

## Search engines

The site is registered with **Google Search Console** and **Bing Webmaster Tools**. Bing also covers Yahoo and DuckDuckGo. In both, `https://athylift.com/sitemap.xml` is submitted.

To check indexing:
- **Google:** Search Console → **Pages**.
- **Bing:** Webmaster Tools → **Site Explorer**.

## Not built yet

- Real payment gateway (e.g. Razorpay or Stripe) and the webhook that marks donations as paid.
- Athlete verification workflow, plus reporting and moderation of posts.
- Labelled sample athlete profiles for demos.
- Rate limiting on pledges.

See [`docs/REWORK_LOG.md`](docs/REWORK_LOG.md) for the full history and open questions.
