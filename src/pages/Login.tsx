import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/contexts/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mutedTextClass = isDark ? 'text-white/80' : 'text-muted-foreground';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fromState = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const redirectTo = fromState?.pathname ? `${fromState.pathname}${fromState.search ?? ''}` : '/explore';

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        navigate(redirectTo, { replace: true });
      }
    };
    redirectIfLoggedIn();
  }, [navigate, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Welcome back!',
      description: 'You have successfully logged in',
    });

    setLoading(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 max-w-5xl w-full bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-base-300/70">
          {/* Left Side - Hero with image */}
          <div
            className="hidden lg:block relative p-0"
            style={{
              backgroundImage: "linear-gradient(180deg, rgba(0,119,181,0.65), rgba(0,160,220,0.55)), url('/login-runner.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className={`h-full w-full backdrop-brightness-95 bg-gradient-to-b from-black/20 via-transparent to-black/40 p-12 flex flex-col justify-center p-2 text-white`}>
              <h1 className="text-5xl font-brand tracking-wide mb-6">Welcome Back!</h1>
              <p className={`text-xl mb-8 font-serif ${mutedTextClass}`}>
                Rejoin the Athlyft community to ask freely, support others, and stay connected in a safe space.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-base-100/20 flex items-center justify-center p-2 text-white`}>
                    ✓
                  </div>
                  <p>Ask openly or anonymously without judgment</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-base-100/20 flex items-center justify-center p-2 text-white`}>
                    ✓
                  </div>
                  <p>Connect with parents and trusted experts</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-base-100/20 flex items-center justify-center p-2 text-white`}>
                    ✓
                  </div>
                  <p>Stay informed with private updates and guidance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8 lg:p-12 flex items-center bg-base-100">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-brand tracking-wide mb-2 text-primary">Login to Athlyft</h2>
                <p className={`${mutedTextClass} font-serif`}>
                  Enter your credentials to access your account
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
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
                  <label className="label">
                    <Link to="/forgot-password" className="label-text-alt link link-primary">
                      Forgot password?
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  className={`btn w-full bg-primary border-none hover:bg-primary/90 shadow-lg shadow-primary/30 text-white`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              <div className="divider">OR</div>

              <div className="text-center">
                <p className={`text-sm ${isDark ? 'text-white' : 'text-base-content'}`}>
                  Don't have an account?{' '}
                  <Link to="/register" state={location.state} className="link text-primary font-bold">
                    Sign up now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
