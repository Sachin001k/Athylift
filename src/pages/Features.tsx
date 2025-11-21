import { User, Heart, Building, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const Features = () => {
  const athleteFeatures = [
    'Create a professional athlete profile',
    'Share your training journey and achievements',
    'Connect with fellow athletes worldwide',
    'Showcase your gallery and videos',
    'Gain recognition in your sport',
  ];

  const fanFeatures = [
    'Follow your favorite athletes',
    'Get inspired by success stories',
    'Engage with the community',
    'Support athletes you believe in',
    'Stay updated on athlete journeys',
  ];

  const brandFeatures = [
    'Connect with authentic athletes',
    'Discover emerging talent',
    'Build brand partnerships',
    'Reach engaged sports audience',
    'Create meaningful sponsorships',
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar onMenuClick={() => {}} />
      <div className="container mx-auto max-w-6xl py-12 px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-brand tracking-wide text-primary mb-4">Features for Everyone</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
            Whether you're an athlete, fan, or brand, Athlyft has something for you
          </p>
        </div>

        {/* For Athletes */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">For Athletes</h2>
                <p className="text-muted-foreground">Build your presence and connect with your community</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {athleteFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* For Fans */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">For Fans</h2>
                <p className="text-muted-foreground">Get closer to the athletes you admire</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fanFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* For Brands */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Building className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">For Brands</h2>
                <p className="text-muted-foreground">Connect with athletes and grow your brand</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brandFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-base-100">
          <div className="card-body text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-6">Join Athlyft today and experience all these features</p>
            <div className="flex justify-center gap-4">
              <a href="/register" className="btn btn-lg bg-base-100 text-primary hover:bg-base-100/90 border-none">
                Sign Up Free
              </a>
              <a href="/explore" className="btn btn-lg btn-outline text-base-100 border-base-100 hover:bg-base-100 hover:text-primary">
                Explore Platform
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
