import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Medal, Plus, Trash2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { FundingProgress } from '@/components/fundraising/FundingProgress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  ACHIEVEMENT_LEVELS,
  Achievement,
  AchievementLevel,
  categoryLabel,
  fetchTotals,
  formatMoney,
  REQUEST_COLUMNS,
  RequestTotals,
  STATUS_BADGE,
  STATUS_LABELS,
  SupportRequest,
} from '@/lib/athylift';

const AthleteDashboard = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [totals, setTotals] = useState<Record<string, RequestTotals>>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [event, setEvent] = useState('');
  const [level, setLevel] = useState<AchievementLevel>('local');
  const [achievedOn, setAchievedOn] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const [requestRes, achievementRes] = await Promise.all([
      supabase.from('support_requests').select(REQUEST_COLUMNS).eq('athlete_id', userId).order('created_at', { ascending: false }),
      supabase
        .from('achievements')
        .select('id, athlete_id, title, event, level, achieved_on, description')
        .eq('athlete_id', userId)
        .order('achieved_on', { ascending: false, nullsFirst: false }),
    ]);
    const rows = (requestRes.data as SupportRequest[]) || [];
    setRequests(rows);
    setAchievements((achievementRes.data as Achievement[]) || []);
    setTotals(await fetchTotals(rows.map((r) => r.id)));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const addAchievement = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    const { error } = await supabase.from('achievements').insert({
      athlete_id: userId,
      title: title.trim(),
      event: event.trim() || null,
      level,
      achieved_on: achievedOn || null,
    });
    setAdding(false);
    if (error) {
      toast({ title: 'Could not add achievement', description: error.message, variant: 'destructive' });
      return;
    }
    setTitle('');
    setEvent('');
    setAchievedOn('');
    load();
  };

  const deleteAchievement = async (achievementId: string) => {
    const { error } = await supabase.from('achievements').delete().eq('id', achievementId);
    if (error) {
      toast({ title: 'Could not delete', description: error.message, variant: 'destructive' });
      return;
    }
    setAchievements((prev) => prev.filter((a) => a.id !== achievementId));
  };

  if (loading) return <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Link to="/requests/new" className="btn btn-primary text-white"><Plus className="h-4 w-4" /> Post a support request</Link>
        <Link to="/add-post" className="btn btn-outline">Share an update</Link>
        <Link to={`/athletes/${userId}`} className="btn btn-ghost">View public profile</Link>
        <Link to="/onboarding" className="btn btn-ghost">Edit athlete details</Link>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Your support requests</h2>
        {requests.length === 0 ? (
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body items-center text-center">
              <p>You haven't asked for support yet. Describe what you need and how it will help.</p>
              <Link to="/requests/new" className="btn btn-primary btn-sm text-white">Post a support request</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {requests.map((r) => (
              <div key={r.id} className="card bg-base-100 shadow">
                <div className="card-body p-5 gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">{categoryLabel(r.category)}</span>
                    <span className={`badge ${STATUS_BADGE[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                  </div>
                  <Link to={`/requests/${r.id}`} className="font-semibold text-lg hover:text-primary">{r.title}</Link>
                  <FundingProgress target={Number(r.target_amount)} currency={r.currency} totals={totals[r.id]} compact />
                  <div className="card-actions justify-end">
                    <Link to={`/requests/${r.id}/edit`} className="btn btn-sm btn-outline">Edit</Link>
                    <Link to={`/requests/${r.id}`} className="btn btn-sm btn-primary text-white">Open</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title"><Medal className="h-5 w-5 text-primary" /> Achievements</h2>
          <form onSubmit={addAchievement} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <input className="input input-bordered md:col-span-2" placeholder="e.g. Gold, U-17 state athletics" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required aria-label="Achievement" />
            <input className="input input-bordered" placeholder="Event" value={event} onChange={(e) => setEvent(e.target.value)} maxLength={120} aria-label="Event" />
            <select className="select select-bordered" value={level} onChange={(e) => setLevel(e.target.value as AchievementLevel)} aria-label="Level">
              {ACHIEVEMENT_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="date" className="input input-bordered flex-1 min-w-0" value={achievedOn} onChange={(e) => setAchievedOn(e.target.value)} aria-label="Date" />
              <button className="btn btn-primary text-white" disabled={adding} aria-label="Add achievement"><Plus className="h-4 w-4" /></button>
            </div>
          </form>
          {achievements.length === 0 ? (
            <p className="text-base-content/70 mt-2">Add medals, selections and results so donors can see your progress.</p>
          ) : (
            <ul className="divide-y divide-base-300 mt-2">
              {achievements.map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-base-content/70">
                      {[a.event, ACHIEVEMENT_LEVELS.find((l) => l.value === a.level)?.label, a.achieved_on].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteAchievement(a.id)} aria-label={`Delete ${a.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

type Pledge = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  request_id: string | null;
  cause_title: string | null;
  beneficiary_name: string | null;
};

const DonorDashboard = ({ userId }: { userId: string }) => {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('donations')
      .select('id, amount, currency, status, created_at, request_id, cause_title, beneficiary_name')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPledges((data as Pledge[]) || []);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Link to="/requests" className="btn btn-primary text-white">Browse funding requests</Link>
        <Link to="/athletes" className="btn btn-outline">Explore athletes</Link>
      </div>
      <section>
        <h2 className="text-2xl font-semibold mb-4">My support</h2>
        {pledges.length === 0 ? (
          <div className="card bg-base-100 border border-dashed border-base-300">
            <div className="card-body items-center text-center">
              <p>You haven't supported an athlete yet.</p>
              <Link to="/requests" className="btn btn-primary btn-sm text-white">Browse funding requests</Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-base-100 rounded-xl shadow">
            <table className="table">
              <thead>
                <tr><th>Request</th><th>Athlete</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {pledges.map((p) => (
                  <tr key={p.id}>
                    <td>{p.request_id ? <Link className="link" to={`/requests/${p.request_id}`}>{p.cause_title || 'Request'}</Link> : p.cause_title || '—'}</td>
                    <td>{p.beneficiary_name || '—'}</td>
                    <td>{formatMoney(Number(p.amount), p.currency)}</td>
                    <td><span className="badge badge-ghost">{p.status === 'pledged' ? 'Pledged (not paid)' : p.status}</span></td>
                    <td>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-base-content/60 mt-3">Payments aren't live yet. Pledges record your intent to support; no money has been taken.</p>
      </section>
    </div>
  );
};

const Dashboard = () => {
  const { user, role } = useAuth();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;

  return (
    <Layout showStats={false}>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-base-content/70 mb-6">
          {role === 'athlete' ? 'Manage your support requests and achievements.' : 'Track the athletes you support.'}
        </p>
        {notice && <div className="alert alert-warning mb-6">{notice}</div>}
        {user && (role === 'athlete' ? <AthleteDashboard userId={user.id} /> : <DonorDashboard userId={user.id} />)}
      </div>
    </Layout>
  );
};

export default Dashboard;
