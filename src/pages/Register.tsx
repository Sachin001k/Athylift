import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/contexts/ThemeContext';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Carries the page the user originally asked for (set by ProtectedRoute) through Login <-> Register.
  const fromState = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const redirectTo = fromState?.pathname ? `${fromState.pathname}${fromState.search ?? ''}` : '/dashboard';
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mutedTextClass = isDark ? 'text-white/80' : 'text-muted-foreground';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // ?role=athlete or ?role=donor (from the Home and About CTAs) preselects the role.
  const [role, setRole] = useState(searchParams.get('role') === 'athlete' ? 'athlete' : 'donor');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        navigate(redirectTo, { replace: true });
      }
    };
    redirectIfLoggedIn();
  }, [navigate, redirectTo]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Use at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // The database creates the profile row from this metadata (see supabase_setup.sql).
    const fullName = `${firstName} ${lastName}`.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, first_name: firstName, last_name: lastName, role },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error || !data.user) {
      toast({
        title: 'Signup failed',
        description: error?.message || 'Unable to create account',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    setLoading(false);

    // With email confirmation enabled there is no session until the user clicks the link.
    if (!data.session) {
      toast({
        title: 'Check your email',
        description: 'We sent you a confirmation link. Confirm your email, then log in.',
      });
      navigate('/login', { state: location.state });
      return;
    }

    toast({
      title: 'Account created!',
      description: 'Welcome to Athylift',
    });

    navigate(redirectTo, { replace: true });
  };

  return (
    <div
      className={`min-h-screen bg-base-200 ${isDark ? 'text-white' : 'text-base-content'}`}
      style={{
        backgroundImage: "linear-gradient(180deg, rgba(0,119,181,0.08), rgba(0,160,220,0.12)), url('/bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Navbar />
      <div className="flex items-center justify-center p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-5xl bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-base-300/70">
          <div
            className="hidden lg:block relative"
            style={{
              backgroundImage: "linear-gradient(180deg, rgba(0,119,181,0.65), rgba(0,160,220,0.55)), url('/login-runner.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className={`h-full w-full p-12 flex flex-col justify-center text-white`}>
              <h2 className="text-4xl font-brand tracking-wide mb-4">Join Athylift</h2>
              <p className={`text-lg font-serif mb-6 ${mutedTextClass}`}>
                Athletes share their journeys and funding needs. Donors discover them and help break financial barriers.
              </p>
              <ul className={`space-y-3 ${isDark ? 'text-white/90' : 'text-base-100/90'}`}>
                <li>• Athletes: showcase achievements, goals and support requests</li>
                <li>• Donors: explore athletes and back the needs you care about</li>
                <li>• Everyone: follow sporting journeys as they grow</li>
              </ul>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-brand tracking-wide mb-2 text-primary">Create your account</h2>
              <p className={`${mutedTextClass} font-serif`}>
                Tell us whether you're an athlete or a donor.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className={`label-text ${isDark ? 'text-white' : ''}`}>First name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Alex"
                    className="input input-bordered w-full"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className={`label-text ${isDark ? 'text-white' : ''}`}>Last name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Jordan"
                    className="input input-bordered w-full"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className={`label-text ${isDark ? 'text-white' : ''}`}>Email</span>
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className={`label-text ${isDark ? 'text-white' : ''}`}>I am joining as</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="athlete">An athlete looking for support</option>
                  <option value="donor">A donor who wants to support athletes</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className={`label-text ${isDark ? 'text-white' : ''}`}>Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input input-bordered w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className={`label-text ${isDark ? 'text-white' : ''}`}>Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input input-bordered w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" required />
                <span className={`label-text ${isDark ? 'text-white' : ''}`}>I agree to the terms and privacy policy</span>
              </label>

              <button
                type="submit"
                className={`btn w-full bg-primary border-none hover:bg-primary/90 shadow-lg shadow-primary/30 text-white`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            <div className="divider">OR</div>

            <div className="text-center">
              <p className={`text-sm ${isDark ? 'text-white' : 'text-base-content'}`}>
                Already have an account?{' '}
                <Link to="/login" state={location.state} className="link text-primary font-bold">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
