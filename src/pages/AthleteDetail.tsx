import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, MapPin, Medal, Target } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AthleteBadges } from '@/components/fundraising/AthleteBadges';
import { RequestCard } from '@/components/fundraising/RequestCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  ACHIEVEMENT_LEVELS,
  Achievement,
  ATHLETE_COLUMNS,
  AthleteSummary,
  avatarFor,
  fetchTotals,
  REQUEST_COLUMNS,
  RequestTotals,
  SupportRequest,
} from '@/lib/athylift';

type PostPreview = { id: string; content: string | null; post_type: string; created_at: string };

const AthleteDetail = () => {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const [athlete, setAthlete] = useState<AthleteSummary | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [totals, setTotals] = useState<Record<string, RequestTotals>>({});
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [athleteRes, achievementRes, requestRes, postRes] = await Promise.all([
        supabase.from('athlete_directory').select(ATHLETE_COLUMNS).eq('id', id).maybeSingle(),
        supabase
          .from('achievements')
          .select('id, athlete_id, title, event, level, achieved_on, description')
          .eq('athlete_id', id)
          .order('achieved_on', { ascending: false, nullsFirst: false }),
        supabase
          .from('support_requests')
          .select(REQUEST_COLUMNS)
          .eq('athlete_id', id)
          .in('status', ['active', 'funded'])
          .order('created_at', { ascending: false }),
        supabase
          .from('posts')
          .select('id, content, post_type, created_at')
          .eq('user_id', id)
          .order('created_at', { ascending: false })
          .limit(6),
      ]);
      if (cancelled) return;
      const requestRows = (requestRes.data as SupportRequest[]) || [];
      setAthlete((athleteRes.data as AthleteSummary) || null);
      setAchievements((achievementRes.data as Achievement[]) || []);
      setRequests(requestRows);
      setPosts((postRes.data as PostPreview[]) || []);
      setTotals(await fetchTotals(requestRows.map((r) => r.id)));
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout showStats={false}>
        <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary" /></div>
      </Layout>
    );
  }

  if (!athlete) {
    return (
      <Layout showStats={false}>
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-semibold">Athlete not found</h1>
          <Link to="/athletes" className="btn btn-primary text-white">Explore athletes</Link>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === athlete.id;
  const levelLabel = (level: string) => ACHIEVEMENT_LEVELS.find((l) => l.value === level)?.label ?? level;

  return (
    <Layout showStats={false}>
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        <section className="card bg-base-100 shadow-xl overflow-hidden">
          <div
            className="h-36 bg-gradient-to-r from-primary to-secondary"
            style={athlete.cover_url ? { backgroundImage: `url(${athlete.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          />
          <div className="card-body pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <img
                src={avatarFor(athlete.id, athlete.avatar_url)}
                alt=""
                className="h-28 w-28 rounded-full border-4 border-base-100 object-cover bg-base-200"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{athlete.full_name || 'Athlete'}</h1>
                <p className="text-base-content/70">{[athlete.sport, athlete.discipline].filter(Boolean).join(' · ')}</p>
              </div>
              {isOwner && <Link to="/onboarding" className="btn btn-outline btn-sm">Edit details</Link>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-base-content/70 mt-2">
              {athlete.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{athlete.location}</span>}
              {athlete.academy && <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{athlete.academy}</span>}
              <AthleteBadges athlete={athlete} />
            </div>
            {athlete.bio && <p className="font-serif whitespace-pre-line mt-4">{athlete.bio}</p>}
          </div>
        </section>

        {athlete.goals && (
          <section className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title"><Target className="h-5 w-5 text-primary" /> Goals</h2>
              <p className="font-serif whitespace-pre-line">{athlete.goals}</p>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold mb-4">Support requests</h2>
          {requests.length === 0 ? (
            <p className="text-base-content/70">{isOwner ? "You haven't asked for support yet." : 'No open support requests right now.'}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} totals={totals[request.id]} />
              ))}
            </div>
          )}
          {isOwner && <Link to="/requests/new" className="btn btn-primary btn-sm text-white mt-4">Post a support request</Link>}
        </section>

        <section className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title"><Medal className="h-5 w-5 text-primary" /> Achievements</h2>
            {achievements.length === 0 ? (
              <p className="text-base-content/70">No achievements added yet.</p>
            ) : (
              <ul className="divide-y divide-base-300">
                {achievements.map((a) => (
                  <li key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                    <div>
                      <p className="font-semibold">{a.title}</p>
                      <p className="text-sm text-base-content/70">
                        {[a.event, a.achieved_on && new Date(a.achieved_on).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {a.description && <p className="text-sm mt-1">{a.description}</p>}
                    </div>
                    <span className="badge badge-outline">{levelLabel(a.level)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Recent posts</h2>
          {posts.length === 0 ? (
            <p className="text-base-content/70">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Link key={post.id} to={`/feed?post=${post.id}`} className="card bg-base-100 shadow hover:shadow-lg transition">
                  <div className="card-body p-4">
                    <p className="text-xs text-base-content/60">{new Date(post.created_at).toLocaleDateString('en-IN')}</p>
                    <p className="line-clamp-3 whitespace-pre-line">{post.content || 'Media post'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default AthleteDetail;
