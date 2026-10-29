import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HandHeart, Loader2, Trophy } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { asRole, Role, SPORTS } from '@/lib/athylift';

const Onboarding = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  // ProtectedRoute sends users here with the page they were trying to open.
  const from = (routerLocation.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const { toast } = useToast();
  const { user, onboardingComplete, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  // A role that was saved during sign-up or earlier onboarding can't be changed here.
  const [roleLocked, setRoleLocked] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [sport, setSport] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [location, setLocation] = useState('');
  const [academy, setAcademy] = useState('');
  const [goals, setGoals] = useState('');
  const [isMinor, setIsMinor] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.rpc('my_profile');
      const profile = Array.isArray(data) ? data[0] : data;
      if (error) {
        toast({ title: 'Could not load your profile', description: error.message, variant: 'destructive' });
      } else if (profile) {
        const savedRole = asRole(profile.role);
        setRole(savedRole);
        setRoleLocked(Boolean(savedRole && profile.onboarding_complete));
        setFullName(profile.full_name || '');
        setBio(profile.bio || '');
        setSport(profile.sport || '');
        setDiscipline(profile.discipline || '');
        setLocation(profile.location || '');
        setAcademy(profile.academy || '');
        setGoals(profile.goals || '');
        setIsMinor(Boolean(profile.is_minor));
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !role) {
      toast({ title: 'Choose how you are joining', description: 'Pick athlete or donor to continue.', variant: 'destructive' });
      return;
    }
    if (!fullName.trim()) {
      toast({ title: 'Add your name', variant: 'destructive' });
      return;
    }
    if (role === 'athlete' && (!sport.trim() || !goals.trim())) {
      toast({ title: 'Add your sport and goals', description: 'Donors use these to find athletes to support.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const athleteFields =
      role === 'athlete'
        ? {
            sport: sport.trim(),
            discipline: discipline.trim() || null,
            location: location.trim() || null,
            academy: academy.trim() || null,
            goals: goals.trim(),
            is_minor: isMinor,
          }
        : {};
    const fields = { role, full_name: fullName.trim(), bio: bio.trim() || null, onboarding_complete: true, ...athleteFields };
    const { data: updated, error: updateError } = await supabase.from('profiles').update(fields).eq('id', user.id).select('id');
    let error = updateError;
    // Accounts created before the profile trigger existed have no row yet.
    if (!error && (!updated || updated.length === 0)) {
      ({ error } = await supabase.from('profiles').insert({ id: user.id, ...fields }));
    }
    setSaving(false);

    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    await refreshProfile();
    toast({ title: onboardingComplete ? 'Profile updated' : 'Welcome to Athylift' });
    const target = from?.pathname && from.pathname !== '/onboarding' ? `${from.pathname}${from.search ?? ''}` : '/dashboard';
    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-4xl font-brand tracking-wide text-primary mb-2">
          {onboardingComplete ? 'Edit your details' : 'Set up your Athylift profile'}
        </h1>
        <p className="font-serif text-base-content/70 mb-8">
          {role === 'athlete'
            ? 'Tell donors about your sport and goals. You can post support requests once this is done.'
            : 'A few details so athletes and the community know who you are.'}
        </p>

        {loading ? (
          <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-4">
              {!roleLocked && (
                <fieldset>
                  <legend className="font-semibold mb-3">I am joining as</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {([
                      { value: 'athlete', icon: Trophy, title: "I'm an athlete", text: 'Share my journey and ask for support' },
                      { value: 'donor', icon: HandHeart, title: 'I want to support athletes', text: 'Discover athletes and back their needs' },
                    ] as const).map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => setRole(option.value)}
                        aria-pressed={role === option.value}
                        className={`rounded-xl border-2 p-4 text-left transition-colors ${
                          role === option.value ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary/50'
                        }`}
                      >
                        <option.icon className="h-7 w-7 text-primary mb-2" />
                        <p className="font-semibold">{option.title}</p>
                        <p className="text-sm text-base-content/70">{option.text}</p>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <label className="form-control">
                <span className="label-text mb-1">Full name</span>
                <input className="input input-bordered" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} required />
              </label>

              <label className="form-control">
                <span className="label-text mb-1">{role === 'athlete' ? 'Your story' : 'About you (optional)'}</span>
                <textarea
                  className="textarea textarea-bordered min-h-24"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={2000}
                  placeholder={role === 'athlete' ? 'How you started, where you train, what drives you' : 'Why you support athletes'}
                />
              </label>

              {role === 'athlete' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="form-control">
                      <span className="label-text mb-1">Sport</span>
                      <input className="input input-bordered" list="sport-options" value={sport} onChange={(e) => setSport(e.target.value)} maxLength={60} required />
                      <datalist id="sport-options">
                        {SPORTS.map((s) => <option key={s} value={s} />)}
                      </datalist>
                    </label>
                    <label className="form-control">
                      <span className="label-text mb-1">Event / discipline (optional)</span>
                      <input className="input input-bordered" value={discipline} onChange={(e) => setDiscipline(e.target.value)} maxLength={80} placeholder="e.g. 400m, 57kg freestyle" />
                    </label>
                  </div>

                  <label className="form-control">
                    <span className="label-text mb-1">Goals</span>
                    <textarea className="textarea textarea-bordered min-h-20" value={goals} onChange={(e) => setGoals(e.target.value)} maxLength={2000} required placeholder="What you are working towards this season and beyond" />
                  </label>

                  <label className="label cursor-pointer justify-start gap-3">
                    <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={isMinor} onChange={(e) => setIsMinor(e.target.checked)} />
                    <span className="label-text">I am under 18 (your location and academy will be hidden from your public profile)</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="form-control">
                      <span className="label-text mb-1">City / state (optional)</span>
                      <input className="input input-bordered" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120} />
                    </label>
                    <label className="form-control">
                      <span className="label-text mb-1">Academy / club (optional)</span>
                      <input className="input input-bordered" value={academy} onChange={(e) => setAcademy(e.target.value)} maxLength={120} />
                    </label>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary text-white w-full" disabled={saving || !role}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : onboardingComplete ? 'Save changes' : 'Continue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
