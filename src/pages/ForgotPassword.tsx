import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      // ?recovery=1 survives Supabase clearing the URL hash, so ResetPassword knows the user came from the email.
      redirectTo: `${window.location.origin}/reset-password?recovery=1`,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Could not send reset email', description: error.message, variant: 'destructive' });
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <div className="flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md bg-base-100 rounded-3xl shadow-2xl border border-base-300/70 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-brand tracking-wide text-primary">Reset your password</h1>
            <p className="text-muted-foreground font-serif">
              {sent
                ? 'If an account exists for that email, a reset link is on its way. Check your inbox.'
                : "Enter your account email and we'll send you a link to choose a new password."}
            </p>
          </div>

          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="forgot-email">
                  <span className="label-text">Email</span>
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="text-center text-sm">
            <Link to="/login" className="link text-primary font-bold">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
