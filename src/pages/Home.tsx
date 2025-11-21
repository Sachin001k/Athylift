import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Users, Target, Star, Sun, Moon, Flame } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Home = () => {
  const { theme, setTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'sport':
        return <Flame className="h-5 w-5" />;
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'sport'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Theme Toggle Button - Fixed */}
      <button
        onClick={cycleTheme}
        className="fixed top-4 right-4 z-50 btn btn-circle btn-primary shadow-lg"
        aria-label="Toggle theme"
      >
        {getThemeIcon()}
      </button>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 animate-fade-in">
            Welcome to Athlyft
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-light">
            Connect with athletes worldwide. Share your journey, inspire others, and build your sports community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none font-light">
              Join Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/explore" className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary font-light">
              Explore Feed
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-light text-center mb-12 text-base-content">Why Athletes Choose Athlyft</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="card-title font-normal text-base-content">Showcase Your Journey</h3>
                <p className="text-base-content/70 font-light">Share your training, achievements, and progress with a community that understands.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="card-title font-normal text-base-content">Connect with Athletes</h3>
                <p className="text-base-content/70 font-light">Network with fellow athletes, find training partners, and build meaningful connections.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-accent" />
                </div>
                <h3 className="card-title font-normal text-base-content">Achieve Your Goals</h3>
                <p className="text-base-content/70 font-light">Get inspired, stay motivated, and push your limits with a supportive community.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-base-100 py-20 px-4">
        <div className="container mx-auto">
          <div className="stats stats-vertical lg:stats-horizontal shadow-xl w-full">
            <div className="stat place-items-center">
              <div className="stat-title text-base-content/70 font-light">Athletes</div>
              <div className="stat-value text-primary font-light">3,891</div>
              <div className="stat-desc text-base-content/60 font-light">From 45 countries</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title text-base-content/70 font-light">Posts Shared</div>
              <div className="stat-value text-secondary font-light">1,247</div>
              <div className="stat-desc text-base-content/60 font-light">↗︎ 12% more than last month</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title text-base-content/70 font-light">Success Stories</div>
              <div className="stat-value text-accent font-light">892</div>
              <div className="stat-desc text-base-content/60 font-light">Inspiring journeys</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-light text-center mb-12 text-base-content">What Athletes Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Athlete" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-normal text-base-content">Athlete {i}</h4>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-base-content/70 font-light">"Athlyft has transformed how I connect with the athletic community. Incredible platform!"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-light">
            Join thousands of athletes already sharing their stories on Athlyft.
          </p>
          <Link to="/register" className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none font-light">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-300 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-normal text-lg mb-4 text-base-content">Services</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="link link-hover text-base-content/70 font-light">Features</Link></li>
                <li><Link to="/pricing" className="link link-hover text-base-content/70 font-light">Pricing</Link></li>
                <li><Link to="/faq" className="link link-hover text-base-content/70 font-light">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-normal text-lg mb-4 text-base-content">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="link link-hover text-base-content/70 font-light">About</Link></li>
                <li><Link to="/contact" className="link link-hover text-base-content/70 font-light">Contact</Link></li>
                <li><Link to="/disclaimer" className="link link-hover text-base-content/70 font-light">Disclaimer</Link></li>
                <li><Link to="/privacy" className="link link-hover text-base-content/70 font-light">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-normal text-lg mb-4 text-base-content">Social</h3>
              <div className="flex gap-4">
                <a className="btn btn-circle btn-ghost text-base-content" href="#" aria-label="Twitter">𝕏</a>
                <a className="btn btn-circle btn-ghost text-base-content" href="#" aria-label="Facebook">f</a>
                <a className="btn btn-circle btn-ghost text-base-content" href="#" aria-label="Instagram">📷</a>
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <p className="text-center text-base-content/70 font-light">© 2025 Athlyft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
