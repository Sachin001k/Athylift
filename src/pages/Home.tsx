import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Users, Target, Star } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Welcome to Athlyft
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with athletes worldwide. Share your journey, inspire others, and build your sports community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none">
              Join Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/explore" className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary">
              Explore Feed
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why Athletes Choose Athlyft</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="card-title">Showcase Your Journey</h3>
                <p>Share your training, achievements, and progress with a community that understands.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="card-title">Connect with Athletes</h3>
                <p>Network with fellow athletes, find training partners, and build meaningful connections.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-accent" />
                </div>
                <h3 className="card-title">Achieve Your Goals</h3>
                <p>Get inspired, stay motivated, and push your limits with a supportive community.</p>
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
              <div className="stat-title">Athletes</div>
              <div className="stat-value text-primary">3,891</div>
              <div className="stat-desc">From 45 countries</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Posts Shared</div>
              <div className="stat-value text-secondary">1,247</div>
              <div className="stat-desc">↗︎ 12% more than last month</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Success Stories</div>
              <div className="stat-value text-accent">892</div>
              <div className="stat-desc">Inspiring journeys</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">What Athletes Say</h2>
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
                      <h4 className="font-bold">Athlete {i}</h4>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p>"Athlyft has transformed how I connect with the athletic community. Incredible platform!"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of athletes already sharing their stories on Athlyft.
          </p>
          <Link to="/register" className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none">
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
              <h3 className="font-bold text-lg mb-4">Services</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="link link-hover">Features</Link></li>
                <li><Link to="/pricing" className="link link-hover">Pricing</Link></li>
                <li><Link to="/faq" className="link link-hover">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="link link-hover">About</Link></li>
                <li><Link to="/contact" className="link link-hover">Contact</Link></li>
                <li><Link to="/disclaimer" className="link link-hover">Disclaimer</Link></li>
                <li><Link to="/privacy" className="link link-hover">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Social</h3>
              <div className="flex gap-4">
                <a className="btn btn-circle btn-ghost" href="#" aria-label="Twitter">𝕏</a>
                <a className="btn btn-circle btn-ghost" href="#" aria-label="Facebook">f</a>
                <a className="btn btn-circle btn-ghost" href="#" aria-label="Instagram">📷</a>
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <p className="text-center">© 2025 Athlyft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
