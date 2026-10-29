import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RequestCard } from '@/components/fundraising/RequestCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  AthleteSummary,
  fetchAthletes,
  fetchTotals,
  REQUEST_CATEGORIES,
  REQUEST_COLUMNS,
  RequestTotals,
  SPORTS,
  SupportRequest,
} from '@/lib/athylift';

const STATUS_FILTERS = [
  { value: 'active', label: 'Active' },
  { value: 'funded', label: 'Funded' },
  { value: 'closed', label: 'Closed' },
  { value: 'all', label: 'All' },
];

const Requests = () => {
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const status = searchParams.get('status') ?? 'active';
  const sport = searchParams.get('sport') ?? '';
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [athletes, setAthletes] = useState<Record<string, AthleteSummary>>({});
  const [totals, setTotals] = useState<Record<string, RequestTotals>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      let query = supabase.from('support_requests').select(REQUEST_COLUMNS).neq('status', 'draft');
      if (status !== 'all') query = query.eq('status', status);
      if (category) query = query.eq('category', category);
      if (sport) {
        const { data: sportAthletes } = await supabase.from('athlete_directory').select('id').ilike('sport', sport);
        const ids = (sportAthletes || []).map((a) => a.id as string);
        // No athletes in that sport: match nothing rather than everything.
        query = query.in('athlete_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
      }
      const { data, error } = await query.order('created_at', { ascending: false }).limit(60);
      if (cancelled) return;
      const rows = (data as SupportRequest[]) || [];
      const [athleteMap, totalMap] = await Promise.all([
        fetchAthletes(rows.map((r) => r.athlete_id)),
        fetchTotals(rows.map((r) => r.id)),
      ]);
      if (cancelled) return;
      setError(error ? error.message : null);
      setRequests(rows);
      setAthletes(athleteMap);
      setTotals(totalMap);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [category, status, sport]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const filtered = Boolean(category || sport || status !== 'active');

  return (
    <Layout showStats={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Funding requests</h1>
            <p className="text-base-content/70">Equipment, coaching, training and academy fees athletes need help with.</p>
          </div>
          {role === 'athlete' && (
            <Link to="/requests/new" className="btn btn-primary text-white">Post a support request</Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <select className="select select-bordered" aria-label="Filter by status" value={status} onChange={(e) => setFilter('status', e.target.value)}>
            {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="select select-bordered" aria-label="Filter by category" value={category} onChange={(e) => setFilter('category', e.target.value)}>
            <option value="">All categories</option>
            {REQUEST_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select className="select select-bordered" aria-label="Filter by sport" value={sport} onChange={(e) => setFilter('sport', e.target.value)}>
            <option value="">All sports</option>
            {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && <div className="alert alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary" /></div>
        ) : requests.length === 0 ? (
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body items-center text-center">
              <p className="font-semibold">{filtered ? 'No funding requests match these filters.' : 'No funding requests yet.'}</p>
              {filtered && <button className="btn btn-outline btn-sm" onClick={() => setSearchParams({})}>Clear filters</button>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} athlete={athletes[request.athlete_id]} totals={totals[request.id]} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Requests;
