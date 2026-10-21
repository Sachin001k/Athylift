import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

// Landing page for the link in the password reset email.
// Supabase signs the user in from the link, then we let them set a new password.
const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const fromResetEmail = searchParams.get('recovery') === '1';
  // An expired or already-used link comes back with the error in the URL hash.
  const [linkError] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('error_description'));
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setHasSession(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Only show the form to someone who arrived from a valid reset email.
  const canReset = hasSession === true && fromResetEmail && !linkError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Use at least 8 characters', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Could not update password', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Password updated', description: 'You are now logged in.' });
    navigate('/explore', { replace: true });
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <div className="flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md bg-base-100 rounded-3xl shadow-2xl border border-base-300/70 p-8 space-y-6">
          <h1 className="text-3xl font-brand tracking-wide text-primary text-center">Choose a new password</h1>

          {hasSession === null && !linkError && (
            <div className="flex justify-center">
              <span className="loading loading-spinner text-primary" />
            </div>
          )}

          {(linkError || (hasSession === false && fromResetEmail)) && (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground font-serif">
                {linkError || 'This reset link is invalid or has expired.'} Request a new one.
              </p>
              <Link to="/forgot-password" className="btn btn-primary w-full">
                Send a new link
              </Link>
            </div>
          )}

          {hasSession !== null && !fromResetEmail && !linkError && (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground font-serif">
                Open the link in your password reset email to choose a new password.
              </p>
              <Link to="/forgot-password" className="btn btn-primary w-full">
                Send a reset email
              </Link>
            </div>
          )}

          {canReset && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="new-password">
                  <span className="label-text">New password</span>
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  className="input input-bordered w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label" htmlFor="confirm-password">
                  <span className="label-text">Confirm new password</span>
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  className="input input-bordered w-full"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
