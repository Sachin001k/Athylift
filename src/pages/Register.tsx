import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Account created!',
      description: 'Welcome to Athlyft community',
    });
    
    setLoading(false);
    navigate('/explore');
  };

  return (
    <div
      className="min-h-screen bg-base-200"
      style={{
        backgroundImage: "linear-gradient(180deg, rgba(0,119,181,0.08), rgba(0,160,220,0.12)), url('/login-runner.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Navbar onMenuClick={() => {}} />
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
            <div className="h-full w-full p-12 text-base-100 flex flex-col justify-center">
              <h2 className="text-4xl font-brand tracking-wide mb-4">Join Athlyt</h2>
              <p className="text-lg font-serif mb-6">
                Build your profile, share your journey, and connect with a trusted parenting community.
              </p>
              <ul className="space-y-3 text-base-100/90">
                <li>• Set your audience and privacy preferences</li>
                <li>• Add topics and hashtags you care about</li>
                <li>• Manage notifications curated for you</li>
              </ul>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-brand tracking-wide mb-2 text-primary">Create your account</h2>
              <p className="text-muted-foreground font-serif">
                A few details to personalize your experience.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">First name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Alex"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Last name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Jordan"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
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
                  <span className="label-text">Role</span>
                </label>
                <select className="select select-bordered w-full">
                  <option>Parent</option>
                  <option>Caregiver</option>
                  <option>Therapist / Expert</option>
                  <option>Supporter</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
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
                    <span className="label-text">Confirm Password</span>
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
                <span className="label-text">I agree to terms and privacy policy</span>
              </label>

              <button
                type="submit"
                className="btn w-full bg-primary text-base-100 border-none hover:bg-primary/90 shadow-lg shadow-primary/30"
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
              <p className="text-sm text-base-content">
                Already have an account?{' '}
                <Link to="/login" className="link text-primary font-bold">
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
