import { Link } from 'react-router-dom';
import { ArrowRight, Target, Trophy, Search, HandHeart, Users, Eye, Sparkles, ShieldCheck, Accessibility } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const steps = [
  {
    icon: Trophy,
    title: 'Athletes share their stories',
    text: 'Athletes create profiles, showcase their achievements, explain their goals, and publish posts detailing the equipment, training, coaching, or academy fees they need help funding.',
  },
  {
    icon: Search,
    title: 'Donors discover and connect',
    text: 'Donors explore athlete profiles and support requests, learn about individual goals, and identify athletes whose journeys they would like to support.',
  },
  {
    icon: HandHeart,
    title: 'Support sporting dreams',
    text: 'Donors contribute towards eligible funding needs, helping athletes access resources and opportunities that may otherwise be out of reach.',
  },
];

const values = [
  { icon: Accessibility, title: 'Accessibility', text: 'Making sporting opportunities more accessible to athletes facing financial barriers.' },
  { icon: Users, title: 'Inclusivity', text: 'Supporting athletes across different sports, backgrounds, and communities.' },
  { icon: Eye, title: 'Transparency', text: "Clearly communicating athletes' needs, fundraising goals, and intended use of support." },
  { icon: HandHeart, title: 'Community', text: 'Building meaningful connections between athletes, donors, and supporters.' },
  { icon: Sparkles, title: 'Empowerment', text: 'Helping athletes take ownership of their journeys and pursue their sporting ambitions.' },
  { icon: ShieldCheck, title: 'Integrity', text: 'Encouraging responsible fundraising, appropriate verification, and accountable use of contributions.' },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary py-20 px-4 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(0,119,181,0.6),transparent),radial-gradient(circle_at_80%_0%,rgba(0,160,220,0.5),transparent)]" />
        <div className="container mx-auto relative text-center">
          <h1 className="text-5xl md:text-7xl font-brand tracking-wide mb-6">
            Empowering Athletes. Breaking Financial Barriers.
          </h1>
          <p className="text-xl md:text-2xl font-serif max-w-3xl mx-auto mb-10">
            Athylift connects underprivileged athletes with people who believe in their potential. Discover inspiring sporting journeys, support essential equipment and training needs, and help athletes take the next step towards their dreams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/explore" className="btn btn-lg bg-base-100 text-primary border-none hover:bg-base-100/90 shadow-lg shadow-primary/30">
              Explore athletes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/register?role=donor" className="btn btn-lg bg-secondary text-white border-none hover:bg-secondary/90 shadow-lg shadow-secondary/30">
              Become a donor
            </Link>
          </div>
          <p className="mt-6 font-serif">
            <Link to="/register?role=athlete" className="link text-white">Get support as an athlete</Link>
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-semibold">Our Mission</h2>
              </div>
              <p className="font-serif text-lg leading-relaxed">
                Athylift exists to make sporting opportunities more accessible to athletes facing financial barriers. We believe that talent, determination, and passion deserve an opportunity to grow, regardless of an athlete's financial circumstances.
              </p>
              <p className="font-serif text-lg leading-relaxed">
                By connecting athletes in need with supportive donors, we aim to bridge the gap between sporting ambition and the resources required to pursue it. From essential equipment to coaching and academy fees, Athylift provides a platform where athletes can share their journeys and seek meaningful support.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-base-100 py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-10">How It Works</h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <li key={step.title} className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">{idx + 1}</span>
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="card-title">{step.title}</h3>
                  <p className="font-serif">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <div key={value.title} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-center gap-3">
                    <value.icon className="h-6 w-6 text-secondary" />
                    <h3 className="card-title">{value.title}</h3>
                  </div>
                  <p className="font-serif">{value.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-base-100 py-16 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold">For athletes</h3>
              </div>
              <p className="font-serif leading-relaxed">
                Build a profile, share your achievements and goals, and post what you need help funding: equipment, coaching, training or academy fees.
              </p>
              <div className="card-actions mt-4">
                <Link to="/register?role=athlete" className="btn bg-primary text-white border-none hover:bg-primary/90">Create an athlete profile</Link>
                <Link to="/add-post" className="btn btn-outline btn-primary">Post a support request</Link>
              </div>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <HandHeart className="h-6 w-6 text-secondary" />
                <h3 className="text-2xl font-semibold">For donors</h3>
              </div>
              <p className="font-serif leading-relaxed">
                Explore athletes and their support requests, see exactly what each contribution is for, and help them take the next step in their sport.
              </p>
              <div className="card-actions mt-4">
                <Link to="/explore" className="btn bg-secondary text-white border-none hover:bg-secondary/90">Browse funding requests</Link>
                <Link to="/register?role=donor" className="btn btn-outline btn-secondary">Become a donor</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-secondary py-16 px-4 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-brand tracking-wide mb-4">Talent shouldn't depend on money</h2>
          <p className="text-xl font-serif max-w-3xl mx-auto mb-8">
            Join Athylift as an athlete looking for support, or as a donor ready to help one take the next step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-lg bg-base-100 text-primary border-none hover:bg-base-100/90">
              Sign up
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/login" className="btn btn-lg btn-outline border-base-100 text-white hover:bg-base-100 hover:text-primary">
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-base-300 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-brand text-2xl mb-3 text-base-content">Athylift</h3>
              <p className="font-serif text-base-content/80">
                Connecting underprivileged athletes with donors who help fund equipment, coaching, training and academy fees.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-base-content">Explore</h3>
              <ul className="space-y-2 font-serif">
                <li><Link to="/explore" className="link link-hover text-base-content">Athletes</Link></li>
                <li><Link to="/explore" className="link link-hover text-base-content">Feed</Link></li>
                <li><Link to="/explore" className="link link-hover text-base-content">Funding requests</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-base-content">Learn</h3>
              <ul className="space-y-2 font-serif">
                <li><Link to="/features" className="link link-hover text-base-content">How it works</Link></li>
                <li><Link to="/about" className="link link-hover text-base-content">About</Link></li>
                <li><Link to="/faq" className="link link-hover text-base-content">Help & FAQ</Link></li>
                <li><Link to="/contact" className="link link-hover text-base-content">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-base-content">Account & legal</h3>
              <ul className="space-y-2 font-serif">
                <li><Link to="/login" className="link link-hover text-base-content">Log in</Link></li>
                <li><Link to="/register" className="link link-hover text-base-content">Sign up</Link></li>
                <li><Link to="/terms" className="link link-hover text-base-content">Terms of use</Link></li>
                <li><Link to="/privacy" className="link link-hover text-base-content">Privacy policy</Link></li>
                <li><Link to="/disclaimer" className="link link-hover text-base-content">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="divider" />
          <p className="text-center text-base-content font-serif">© {new Date().getFullYear()} Athylift. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
