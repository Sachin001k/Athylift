import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, Target, Star, MessageCircle, Lock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary py-20 px-4 text-base-900 p-2">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(0,119,181,0.6),transparent),radial-gradient(circle_at_80%_0%,rgba(0,160,220,0.5),transparent)]" />
        <div className="container mx-auto relative text-center">
          <h1 className="text-5xl md:text-7xl font-brand tracking-wide mb-6">
            Athlyft: Trusted Space for Every Parent
          </h1>
          <p className="text-xl md:text-2xl font-serif max-w-3xl mx-auto mb-10">
            Welcome to Athlyft, a trusted online community created for parents navigating overwhelming situations. Share anonymously or openly, learn, and heal with the support of people who understand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-lg bg-base-100 text-primary border-none hover:bg-base-100/90 shadow-lg shadow-primary/30">
              Join Athlyft
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/explore" className="btn btn-lg bg-secondary text-base-900 p-2 border-none hover:bg-secondary/90 shadow-lg shadow-secondary/30">
              Explore Feed
            </Link>
            <Link to="/about" className="btn btn-lg btn-outline border-base-100 text-base-900 p-2 hover:bg-base-100 hover:text-primary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto grid gap-8 md:grid-cols-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-semibold">Our Mission</h2>
              </div>
              <p className="font-serif text-lg leading-relaxed">
                To build a safe, judgment-free space for parents to express challenges, seek advice, and find emotional comfort—anonymously or openly—through shared experiences and professional insights.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-secondary" />
                <h2 className="text-3xl font-semibold">How It Works</h2>
              </div>
              <ul className="space-y-2 font-serif">
                <li>Ask questions anonymously or with your profile—no judgment.</li>
                <li>Get real feedback from parents who have walked similar paths.</li>
                <li>Therapists can join conversations or offer direct support.</li>
                <li>Private help is suggested when distress signals appear.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-base-100 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-200 shadow-md">
              <div className="card-body">
                <h4 className="card-title">Our Values</h4>
                <ul className="space-y-2 font-serif">
                  <li>Empathy first—every journey is unique.</li>
                  <li>Privacy and safety at the core.</li>
                  <li>Support over judgment.</li>
                  <li>Guided help when needed.</li>
                </ul>
              </div>
            </div>
            <div className="card bg-base-200 shadow-md">
              <div className="card-body">
                <h4 className="card-title">Services</h4>
                <ul className="space-y-2 font-serif">
                  <li>Branding</li>
                  <li>Design</li>
                  <li>Marketing</li>
                  <li>Advertisement</li>
                </ul>
              </div>
            </div>
            <div className="card bg-base-200 shadow-md">
              <div className="card-body">
                <h4 className="card-title">Legal & Support</h4>
                <ul className="space-y-2 font-serif">
                  <li>Terms of use</li>
                  <li>Privacy policy</li>
                  <li>Cookie policy</li>
                  <li>Disclaimers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="feed-preview" className="py-16 px-4 bg-base-200">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-muted-foreground">Live community previews</p>
              <h3 className="text-3xl font-semibold text-primary">Explore Feed</h3>
            </div>
            <div className="flex gap-3">
              <Link to="/explore" className="btn bg-primary text-base-900 p-2 border-none hover:bg-primary/90 shadow-lg shadow-primary/30">
                Go to Feed
              </Link>
              <a href="#feed-preview" className="btn btn-secondary text-base-900 p-2 border-none">
                See previews
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Late-night parenting win',
                preview: 'Finally got 4 hours of sleep in a row—here is what helped...',
              },
              {
                title: 'Balancing work and toddlers',
                preview: 'Remote work hacks that kept my toddler happy during calls.',
              },
              {
                title: 'Anonymous question',
                preview: 'Is it normal to feel overwhelmed with two kids under 3?',
              },
            ].map((card, idx) => (
              <div key={idx} className="card bg-base-100 shadow-lg border border-base-300">
                <div className="card-body">
                  <h4 className="card-title">{card.title}</h4>
                  <p className="font-serif text-base-content/80 line-clamp-3">{card.preview}</p>
                  <div className="card-actions justify-end">
                    <Link to="/explore" className="btn btn-link text-primary p-0">Open feed</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-semibold">What Makes Us Unique?</h3>
                </div>
                <p className="font-serif leading-relaxed">
                  Freedom to ask or answer anonymously, a focus on emotional support, and the option to connect with licensed therapists when needed—without compromising your privacy.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="h-6 w-6 text-secondary" />
                  <h3 className="text-2xl font-semibold">Privacy First</h3>
                </div>
                <p className="font-serif leading-relaxed">
                  End-to-end safeguards protect sensitive content. You can update or delete posts anytime, anonymize further, and request complete removal of your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-secondary py-16 px-4 text-base-900 p-2">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-brand tracking-wide mb-4">Ready to feel supported?</h2>
          <p className="text-xl font-serif max-w-3xl mx-auto mb-8">
            Whether you're here to ask, support, or simply listen—Athlyft welcomes you.
          </p>
          <Link to="/register" className="btn btn-lg bg-base-100 text-primary border-none hover:bg-base-100/90">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-base-300 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-base-content">Services</h3>
              <ul className="space-y-2 font-serif">
                <li><Link to="/features" className="link link-hover text-base-content">Branding</Link></li>
                <li><Link to="/features" className="link link-hover text-base-content">Design</Link></li>
                <li><Link to="/pricing" className="link link-hover text-base-content">Marketing</Link></li>
                <li><Link to="/features" className="link link-hover text-base-content">Advertisement</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-base-content">Company</h3>
              <ul className="space-y-2 font-serif">
                <li><Link to="/about" className="link link-hover text-base-content">About us</Link></li>
                <li><Link to="/contact" className="link link-hover text-base-content">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-base-content">Legal</h3>
              <ul className="space-y-2 font-serif">
                <li><Link to="/terms" className="link link-hover text-base-content">Terms of use</Link></li>
                <li><Link to="/privacy" className="link link-hover text-base-content">Privacy policy</Link></li>
                <li><Link to="/disclaimer" className="link link-hover text-base-content">Cookie policy</Link></li>
                <li><Link to="/disclaimer" className="link link-hover text-base-content">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="divider" />
          <p className="text-center text-base-content font-serif">© 2025 Athlyft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
