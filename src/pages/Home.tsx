import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accessibility,
  ArrowRight,
  Dumbbell,
  Eye,
  GraduationCap,
  HandHeart,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Reveal } from '@/components/Reveal';
import { RequestCard } from '@/components/fundraising/RequestCard';
import { supabase } from '@/lib/supabaseClient';
import {
  AthleteSummary,
  fetchAthletes,
  fetchTotals,
  REQUEST_COLUMNS,
  RequestTotals,
  SPORTS,
  SupportRequest,
} from '@/lib/athylift';

const steps = [
  {
    icon: Trophy,
    title: 'Athletes share their stories',
    text: 'Athletes create profiles, showcase their achievements, explain their goals, and publish posts detailing the equipment, training, coaching, or academy fees they need help funding.',
  },
  {
    icon: Search,
    title: 'Donors discover and connect',
    text: 'Donors explore athlete profiles and support requests, learn about individual goals, and identify athletes whose journeys they would like to support.',
  },
  {
    icon: HandHeart,
    title: 'Support sporting dreams',
    text: 'Donors contribute towards eligible funding needs, helping athletes access resources and opportunities that may otherwise be out of reach.',
  },
];

const values = [
  { icon: Accessibility, title: 'Accessibility', text: 'Making sporting opportunities more accessible to athletes facing financial barriers.' },
  { icon: Users, title: 'Inclusivity', text: 'Supporting athletes across different sports, backgrounds, and communities.' },
  { icon: Eye, title: 'Transparency', text: "Clearly communicating athletes' needs, fundraising goals, and intended use of support." },
  { icon: HandHeart, title: 'Community', text: 'Building meaningful connections between athletes, donors, and supporters.' },
  { icon: Sparkles, title: 'Empowerment', text: 'Helping athletes take ownership of their journeys and pursue their sporting ambitions.' },
  { icon: ShieldCheck, title: 'Integrity', text: 'Encouraging responsible fundraising, appropriate verification, and accountable use of contributions.' },
];

const needs = [
  { icon: Dumbbell, label: 'Equipment', top: '6%', left: '6%' },
  { icon: Medal, label: 'Coaching', top: '16%', left: '66%' },
  { icon: Trophy, label: 'Training', top: '80%', left: '2%' },
  { icon: GraduationCap, label: 'Academy fees', top: '86%', left: '56%' },
];

// Decorative running track: lanes slowly circling, a floating request preview and the needs athletes fund.
const TrackGraphic = () => (
  <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
    <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="lane" x1="0" x2="1">
          <stop offset="0" stopColor="#FF6B1A" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FF6B1A" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((lane) => (
        <ellipse
          key={lane}
          cx="200"
          cy="200"
          rx={175 - lane * 26}
          ry={125 - lane * 18}
          fill="none"
          stroke={lane === 0 ? 'url(#lane)' : 'rgba(255,255,255,0.22)'}
          strokeWidth={lane === 0 ? 10 : 2}
          strokeLinecap="round"
          strokeDasharray={lane === 0 ? '420 260' : '6 10'}
          className="animate-[spin_40s_linear_infinite]"
          style={{
            transformOrigin: '200px 200px',
            animationDirection: lane % 2 ? 'reverse' : 'normal',
            animationDuration: `${24 + lane * 8}s`,
          }}
        />
      ))}
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-64 animate-float rounded-2xl bg-white p-5 text-left text-[#16202E] shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#B8430A]">Support request</p>
        <p className="mt-1 font-brand text-2xl font-bold leading-tight">Every need, shown in the open</p>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#EEF2F7]">
          <div className="h-full w-2/3 origin-left animate-grow rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#C2410C]" />
        </div>
        <p className="mt-2 text-xs text-[#16202E]/80">Target, amount raised and intended use on every request.</p>
      </div>
    </div>
    {needs.map((need, idx) => (
      <div
        key={need.label}
        className="absolute flex animate-float items-center gap-1.5 rounded-full bg-[#1C3366] px-3 py-1.5 text-xs font-semibold text-white shadow-lg ring-1 ring-white/25"
        style={{ top: need.top, left: need.left, animationDelay: `${idx * 0.8}s` }}
      >
        <need.icon className="h-3.5 w-3.5 text-[#FF8A4C]" />
        {need.label}
      </div>
    ))}
  </div>
);

const Home = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [athletes, setAthletes] = useState<Record<string, AthleteSummary>>({});
  const [totals, setTotals] = useState<Record<string, RequestTotals>>({});
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Real, live requests only; nothing on this page is made up.
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('support_requests')
        .select(REQUEST_COLUMNS)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);
      const rows = (data as SupportRequest[]) || [];
      const [athleteMap, totalMap] = await Promise.all([
        fetchAthletes(rows.map((r) => r.athlete_id)),
        fetchTotals(rows.map((r) => r.id)),
      ]);
      setRequests(rows);
      setAthletes(athleteMap);
      setTotals(totalMap);
      setLoadingRequests(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0F1E3D] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 90px)' }}
        />
        {[18, 46, 74].map((top, idx) => (
          <div
            key={top}
            className="pointer-events-none absolute h-0.5 w-1/3 animate-lane-run bg-gradient-to-r from-transparent via-[#FF6B1A] to-transparent"
            style={{ top: `${top}%`, animationDelay: `${idx * 0.8}s` }}
          />
        ))}
        <div className="container relative mx-auto grid items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="inline-flex animate-rise-in items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF6B1A]" />
              For athletes facing financial barriers
            </p>
            <h1 className="mt-6 font-brand text-[2.6rem] font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block animate-rise-in" style={{ animationDelay: '0.1s' }}>Empowering Athletes.</span>
              <span className="block animate-rise-in text-[#FF8A4C]" style={{ animationDelay: '0.25s' }}>
                Breaking Financial Barriers.
              </span>
            </h1>
            <p className="mt-6 max-w-xl animate-rise-in text-lg text-white/90" style={{ animationDelay: '0.4s' }}>
              Athylift connects underprivileged athletes with people who believe in their potential. Discover inspiring sporting journeys, support essential equipment and training needs, and help athletes take the next step towards their dreams.
            </p>
            <div className="mt-8 flex animate-rise-in flex-col gap-3 sm:flex-row" style={{ animationDelay: '0.55s' }}>
              <Link
                to="/athletes"
                className="group btn btn-lg border-none bg-[#FF6B1A] text-[#0F1E3D] shadow-lg shadow-[#FF6B1A]/30 hover:bg-[#FF8A4C]"
              >
                Explore athletes
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/register?role=donor" className="btn btn-lg btn-outline border-white text-white hover:border-white hover:bg-white hover:text-[#0F1E3D]">
                Become a donor
              </Link>
            </div>
            <p className="mt-5 animate-rise-in" style={{ animationDelay: '0.7s' }}>
              <Link to="/register?role=athlete" className="link font-medium text-white/90 hover:text-[#FF8A4C]">
                Get support as an athlete →
              </Link>
            </p>
          </div>
          <div className="animate-rise-in" style={{ animationDelay: '0.3s' }}>
            <TrackGraphic />
          </div>
        </div>
      </section>

      {/* Sports ticker: hover pauses it, each sport opens the filtered directory */}
      <section className="overflow-hidden bg-[#FF6B1A] py-3 text-[#0F1E3D]" aria-label="Sports on Athylift">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...SPORTS, ...SPORTS].map((sport, idx) => (
            <Link
              key={`${sport}-${idx}`}
              to={`/athletes?sport=${encodeURIComponent(sport)}`}
              className="mx-5 whitespace-nowrap font-brand text-xl font-bold uppercase tracking-wide hover:underline"
              tabIndex={idx < SPORTS.length ? 0 : -1}
              aria-hidden={idx >= SPORTS.length}
            >
              {sport} <span className="ml-5 opacity-60">•</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 py-20">
        <div className="container mx-auto grid items-center gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our mission</p>
            <h2 className="mt-3 font-brand text-4xl font-bold uppercase leading-tight sm:text-5xl">
              Talent shouldn't depend on money
            </h2>
          </Reveal>
          <Reveal className="space-y-4 text-lg leading-relaxed text-base-content/90 lg:col-span-3" delay={120}>
            <p>
              Athylift exists to make sporting opportunities more accessible to athletes facing financial barriers. We believe that talent, determination, and passion deserve an opportunity to grow, regardless of an athlete's financial circumstances.
            </p>
            <p>
              By connecting athletes in need with supportive donors, we aim to bridge the gap between sporting ambition and the resources required to pursue it. From essential equipment to coaching and academy fees, Athylift provides a platform where athletes can share their journeys and seek meaningful support.
            </p>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-base-200 px-4 py-20">
        <div className="container mx-auto">
          <Reveal className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="mt-3 font-brand text-4xl font-bold uppercase sm:text-5xl">Three steps from need to support</h2>
          </Reveal>
          <ol className="grid gap-8 md:grid-cols-3">
            {steps.map((step, idx) => (
              <Reveal as="li" key={step.title} delay={idx * 150}>
                <div className="group h-full rounded-2xl bg-base-100 p-6 shadow-md ring-1 ring-base-300 hover-lift">
                  <div className="flex items-center gap-4">
                    <span className="font-brand text-6xl font-bold leading-none text-primary">0{idx + 1}</span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-white transition-transform group-hover:-rotate-6 group-hover:scale-110">
                      <step.icon className="h-6 w-6" />
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-base-content/85">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Live requests */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Funding requests</p>
              <h2 className="mt-3 font-brand text-4xl font-bold uppercase sm:text-5xl">Athletes asking for support now</h2>
            </div>
            <Link to="/requests" className="group btn btn-outline btn-primary">
              Browse funding requests
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          {loadingRequests ? (
            <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary" /></div>
          ) : requests.length === 0 ? (
            <Reveal className="rounded-2xl border-2 border-dashed border-base-300 p-10 text-center">
              <p className="text-lg font-semibold">No open requests yet.</p>
              <p className="mt-1 text-base-content/80">Athletes' support requests will appear here as soon as they're posted.</p>
              <Link to="/register?role=athlete" className="btn btn-primary mt-5">Create an athlete profile</Link>
            </Reveal>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {requests.map((request, idx) => (
                <Reveal key={request.id} delay={idx * 120} className="rounded-2xl hover-lift">
                  <RequestCard request={request} athlete={athletes[request.athlete_id]} totals={totals[request.id]} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#0F1E3D] px-4 py-20 text-white">
        <div className="container mx-auto">
          <Reveal className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#FF8A4C]">Our values</p>
            <h2 className="mt-3 font-brand text-4xl font-bold uppercase sm:text-5xl">What we stand for</h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, idx) => (
              <Reveal key={value.title} delay={(idx % 3) * 120}>
                <div className="group h-full rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:ring-[#FF6B1A]/60">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B1A] text-[#0F1E3D] transition-transform group-hover:rotate-6 group-hover:scale-110">
                    <value.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold">{value.title}</h3>
                  <p className="mt-2 text-white/85">{value.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Audience paths */}
      <section className="px-4 py-20">
        <div className="container mx-auto grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="group relative h-full overflow-hidden rounded-3xl bg-secondary p-8 text-white hover-lift">
              <Trophy className="absolute -bottom-6 -right-6 h-40 w-40 text-white/10 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
              <p className="text-sm font-semibold uppercase tracking-widest text-[#FF8A4C]">For athletes</p>
              <h3 className="mt-2 font-brand text-4xl font-bold uppercase">Share your journey</h3>
              <p className="mt-3 max-w-md text-white/90">
                Build a profile, share your achievements and goals, and post what you need help funding: equipment, coaching, training or academy fees.
              </p>
              <div className="relative mt-6 flex flex-wrap gap-3">
                <Link to="/register?role=athlete" className="btn border-none bg-[#FF6B1A] text-[#0F1E3D] hover:bg-[#FF8A4C]">Create an athlete profile</Link>
                <Link to="/requests/new" className="btn btn-outline border-white text-white hover:border-white hover:bg-white hover:text-secondary">Post a support request</Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="group relative h-full overflow-hidden rounded-3xl bg-primary p-8 text-white hover-lift">
              <HandHeart className="absolute -bottom-6 -right-6 h-40 w-40 text-white/10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
              <p className="text-sm font-semibold uppercase tracking-widest text-white">For donors</p>
              <h3 className="mt-2 font-brand text-4xl font-bold uppercase">Back real potential</h3>
              <p className="mt-3 max-w-md text-white">
                Explore athletes and their support requests, see exactly what each contribution is for, and help them take the next step in their sport.
              </p>
              <div className="relative mt-6 flex flex-wrap gap-3">
                <Link to="/requests" className="btn border-none bg-white text-primary hover:bg-white/90">Browse funding requests</Link>
                <Link to="/register?role=donor" className="btn btn-outline border-white text-white hover:border-white hover:bg-white hover:text-primary">Become a donor</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-base-200 px-4 py-20">
        <Reveal className="container mx-auto text-center">
          <h2 className="font-brand text-4xl font-bold uppercase sm:text-6xl">
            Be part of the <span className="text-primary">next podium</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-base-content/85">
            Join Athylift as an athlete looking for support, or as a donor ready to help one take the next step.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="group btn btn-lg btn-primary">
              Sign up
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/login" className="btn btn-lg btn-outline">Log in</Link>
          </div>
        </Reveal>
      </section>

      <footer className="bg-[#0F1E3D] px-4 py-16 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <p className="font-brand text-3xl font-bold uppercase">Athylift</p>
              <p className="mt-3 text-white/80">
                Connecting underprivileged athletes with donors who help fund equipment, coaching, training and academy fees.
              </p>
            </div>
            {[
              {
                title: 'Explore',
                links: [
                  { to: '/athletes', label: 'Athletes' },
                  { to: '/feed', label: 'Feed' },
                  { to: '/requests', label: 'Funding requests' },
                ],
              },
              {
                title: 'Learn',
                links: [
                  { to: '/how-it-works', label: 'How it works' },
                  { to: '/about', label: 'About' },
                  { to: '/faq', label: 'Help & FAQ' },
                  { to: '/contact', label: 'Contact' },
                ],
              },
              {
                title: 'Account & legal',
                links: [
                  { to: '/login', label: 'Log in' },
                  { to: '/register', label: 'Sign up' },
                  { to: '/terms', label: 'Terms of use' },
                  { to: '/privacy', label: 'Privacy policy' },
                  { to: '/disclaimer', label: 'Disclaimer' },
                ],
              },
            ].map((column) => (
              <div key={column.title}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#FF8A4C]">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="text-white/90 transition-colors hover:text-white hover:underline">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-white/15 pt-6 text-center text-sm text-white/75">
            © {new Date().getFullYear()} Athylift. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
