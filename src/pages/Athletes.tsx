import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AthleteBadges } from '@/components/fundraising/AthleteBadges';
import { supabase } from '@/lib/supabaseClient';
import { ATHLETE_COLUMNS, AthleteSummary, avatarFor, SPORTS } from '@/lib/athylift';

// PostgREST treats * as a wildcard with no escape, so it is dropped; LIKE wildcards are escaped.
const escapeLike = (value: string) => value.replace(/[*,()]/g, '').replace(/[\\%_]/g, (char) => `\\${char}`);

const Athletes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const sport = searchParams.get('sport') ?? '';
  const [draft, setDraft] = useState(q);
  const [athletes, setAthletes] = useState<AthleteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(q);
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      let query = supabase.from('athlete_directory').select(ATHLETE_COLUMNS);
      if (sport) query = query.ilike('sport', escapeLike(sport));
      const term = escapeLike(q.trim());
      if (term) query = query.or(`full_name.ilike.%${term}%,sport.ilike.%${term}%,discipline.ilike.%${term}%`);
      const { data, error } = await query.order('created_at', { ascending: false }).limit(60);
      if (cancelled) return;
      setError(error ? error.message : null);
      setAthletes((data as AthleteSummary[]) || []);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [q, sport]);

  const updateParams = (next: { q?: string; sport?: string }) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => (value ? params.set(key, value) : params.delete(key)));
    setSearchParams(params);
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    updateParams({ q: draft.trim() });
  };

  return (
    <Layout showStats={false}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">Explore athletes</h1>
        <p className="text-base-content/70 mb-6">Discover athletes, their achievements and what they are working towards.</p>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <form onSubmit={onSearch} className="relative flex-1" role="search">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50" />
            <input
              type="search"
              className="input input-bordered w-full pl-10"
              placeholder="Search by name, sport or event"
              aria-label="Search athletes"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={80}
            />
          </form>
          <select
            className="select select-bordered md:w-56"
            aria-label="Filter by sport"
            value={sport}
            onChange={(e) => updateParams({ sport: e.target.value })}
          >
            <option value="">All sports</option>
            {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && <div className="alert alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary" /></div>
        ) : athletes.length === 0 ? (
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body items-center text-center">
              <p className="font-semibold">{q || sport ? 'No athletes match these filters.' : 'No athletes have joined yet.'}</p>
              {q || sport ? (
                <button className="btn btn-outline btn-sm" onClick={() => setSearchParams({})}>Clear filters</button>
              ) : (
                <Link to="/register?role=athlete" className="btn btn-primary btn-sm text-white">Create an athlete profile</Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {athletes.map((athlete) => (
              <Link
                key={athlete.id}
                to={`/athletes/${athlete.id}`}
                className="card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl hover:border-primary/40 transition"
              >
                <div className="card-body p-5 gap-3">
                  <div className="flex items-center gap-4">
                    <img src={avatarFor(athlete.id, athlete.avatar_url)} alt="" className="h-16 w-16 rounded-full object-cover bg-base-200" />
                    <div className="min-w-0">
                      <h2 className="font-semibold text-lg truncate">{athlete.full_name || 'Athlete'}</h2>
                      <p className="text-sm text-base-content/70 truncate">
                        {[athlete.sport, athlete.discipline].filter(Boolean).join(' · ')}
                      </p>
                      {athlete.location && (
                        <p className="text-xs text-base-content/60 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {athlete.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2"><AthleteBadges athlete={athlete} /></div>
                  {athlete.goals && <p className="text-sm line-clamp-3">{athlete.goals}</p>}
                  <span className="link link-primary text-sm">View profile</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Athletes;
