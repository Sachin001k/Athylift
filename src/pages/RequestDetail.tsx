import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CalendarDays, Info, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AthleteBadges } from '@/components/fundraising/AthleteBadges';
import { FundingProgress } from '@/components/fundraising/FundingProgress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  ATHLETE_COLUMNS,
  AthleteSummary,
  categoryLabel,
  fetchTotals,
  formatMoney,
  REQUEST_COLUMNS,
  RequestTotals,
  STATUS_BADGE,
  STATUS_LABELS,
  SupportRequest,
} from '@/lib/athylift';
import { UserAvatar } from '@/components/UserAvatar';

const MAX_PLEDGE = 1000000;

const RequestDetail = () => {
  const { id = '' } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [athlete, setAthlete] = useState<AthleteSummary | null>(null);
  const [totals, setTotals] = useState<RequestTotals | undefined>();
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [pledging, setPledging] = useState(false);
  const [pledged, setPledged] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('support_requests').select(REQUEST_COLUMNS).eq('id', id).maybeSingle();
    const row = (data as SupportRequest) || null;
    setRequest(row);
    if (row) {
      const [athleteRes, totalMap] = await Promise.all([
        supabase.from('athlete_directory').select(ATHLETE_COLUMNS).eq('id', row.athlete_id).maybeSingle(),
        fetchTotals([row.id]),
      ]);
      setAthlete((athleteRes.data as AthleteSummary) || null);
      setTotals(totalMap[row.id]);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const isOwner = Boolean(user && request && user.id === request.athlete_id);

  const setStatus = async (status: 'active' | 'closed') => {
    if (!request) return;
    setUpdatingStatus(true);
    const { error } = await supabase.from('support_requests').update({ status }).eq('id', request.id);
    setUpdatingStatus(false);
    if (error) {
      toast({ title: 'Could not update request', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: status === 'closed' ? 'Request closed' : 'Request published' });
    load();
  };

  const submitPledge = async (e: FormEvent) => {
    e.preventDefault();
    if (!request || !user) return;
    const value = Math.round(parseFloat(amount) * 100) / 100;
    if (Number.isNaN(value) || value < 1 || value > MAX_PLEDGE) {
      toast({ title: 'Enter an amount', description: `Between ₹1 and ₹${MAX_PLEDGE.toLocaleString('en-IN')}.`, variant: 'destructive' });
      return;
    }
    setPledging(true);
    const { error } = await supabase.from('donations').insert({
      user_id: user.id,
      request_id: request.id,
      beneficiary_name: athlete?.full_name ?? null,
      cause_title: request.title,
      cause_image: request.image_url,
      amount: value,
      currency: request.currency,
      frequency: 'one-time',
      payment_method: 'pledge',
      message: message.trim().slice(0, 1000) || null,
    });
    setPledging(false);
    if (error) {
      toast({ title: 'Could not record pledge', description: error.message, variant: 'destructive' });
      return;
    }
    setPledged(value);
    setAmount('');
    setMessage('');
    const totalMap = await fetchTotals([request.id]);
    setTotals(totalMap[request.id]);
  };

  if (loading) {
    return (
      <Layout showStats={false}>
        <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary" /></div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout showStats={false}>
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-semibold">Request not found</h1>
          <Link to="/requests" className="btn btn-primary text-white">Browse funding requests</Link>
        </div>
      </Layout>
    );
  }

  const supportPanel = () => {
    if (isOwner) {
      return (
        <div className="space-y-2">
          <Link to={`/requests/${request.id}/edit`} className="btn btn-outline w-full">Edit request</Link>
          {request.status === 'draft' && (
            <button className="btn btn-primary text-white w-full" disabled={updatingStatus} onClick={() => setStatus('active')}>Publish</button>
          )}
          {request.status === 'active' && (
            <button className="btn btn-ghost w-full" disabled={updatingStatus} onClick={() => setStatus('closed')}>Close request</button>
          )}
        </div>
      );
    }
    if (request.status !== 'active') {
      return <button className="btn w-full" disabled>Not accepting support</button>;
    }
    if (!user) {
      return (
        <Link to="/login" state={{ from: location }} className="btn btn-secondary text-white w-full">
          Log in to support this athlete
        </Link>
      );
    }
    if (!role) {
      return (
        <Link to="/onboarding" state={{ from: location }} className="btn btn-secondary text-white w-full">
          Finish your profile to support
        </Link>
      );
    }
    if (role !== 'donor') {
      return <p className="text-sm text-base-content/70">Support requests can be backed from a donor account.</p>;
    }
    return (
      <form onSubmit={submitPledge} className="space-y-3">
        <div className="alert alert-info text-sm">
          <Info className="h-4 w-4" />
          <span>Payments aren't live on Athylift yet. This is a preview of how support will work — no money will be taken.</span>
        </div>
        {pledged !== null && (
          <div className="alert text-sm">
            Your pledge of {formatMoney(pledged, request.currency)} is recorded. No money was taken; we'll let you know when payments open.
          </div>
        )}
        <label className="form-control">
          <span className="label-text mb-1">Amount ({request.currency})</span>
          <input type="number" min={1} max={MAX_PLEDGE} step="1" className="input input-bordered" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label className="form-control">
          <span className="label-text mb-1">Message (optional)</span>
          <textarea className="textarea textarea-bordered" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} placeholder="A note of encouragement" />
        </label>
        <button type="submit" className="btn btn-secondary text-white w-full" disabled={pledging}>
          {pledging ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Pledge support'}
        </button>
      </form>
    );
  };

  return (
    <Layout showStats={false}>
      <div className="container mx-auto max-w-5xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-outline">{categoryLabel(request.category)}</span>
            <span className={`badge ${STATUS_BADGE[request.status]}`}>{STATUS_LABELS[request.status]}</span>
          </div>
          <h1 className="text-3xl font-bold">{request.title}</h1>
          {athlete && (
            <Link to={`/athletes/${athlete.id}`} className="flex items-center gap-3 group">
              <UserAvatar id={athlete.id} name={athlete.full_name} url={athlete.avatar_url} className="h-12 w-12" />
              <div>
                <p className="font-semibold group-hover:text-primary">{athlete.full_name || 'Athlete'}</p>
                <p className="text-sm text-base-content/70">{[athlete.sport, athlete.discipline].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex gap-2"><AthleteBadges athlete={athlete} /></div>
            </Link>
          )}
          {request.image_url && <img src={request.image_url} alt="" className="w-full rounded-xl object-cover max-h-96" />}
          <section>
            <h2 className="text-xl font-semibold mb-2">About this request</h2>
            <p className="font-serif whitespace-pre-line">{request.description}</p>
          </section>
          <section className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">How the support will be used</h2>
              <p className="font-serif whitespace-pre-line">{request.intended_use}</p>
            </div>
          </section>
        </article>

        <aside className="space-y-4">
          <div className="card bg-base-100 shadow-xl lg:sticky lg:top-20">
            <div className="card-body gap-4">
              <FundingProgress target={Number(request.target_amount)} currency={request.currency} totals={totals} />
              {request.deadline && (
                <p className="text-sm text-base-content/70 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Needed by {new Date(`${request.deadline}T00:00:00`).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </p>
              )}
              {supportPanel()}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default RequestDetail;
