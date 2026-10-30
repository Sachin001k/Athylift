import { Link } from 'react-router-dom';
import { Trophy, HandHeart, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const Features = () => {
  const { user } = useAuth();
  const athleteFeatures = [
    'Create a profile with your sport, achievements and goals',
    'Share training updates and results with supporters',
    'Post support requests for equipment, coaching, training or academy fees',
    'Explain exactly how each contribution will be used',
    'Keep donors updated on the progress your support made possible',
  ];

  const donorFeatures = [
    'Explore athletes across different sports and communities',
    'Read each athlete\'s story, achievements and goals',
    'Browse support requests and see what they will fund',
    'Contribute towards the needs that matter to you',
    'Follow the journeys of the athletes you support',
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto max-w-6xl py-12 px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-brand tracking-wide text-primary mb-4">How Athylift Works</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
            Athletes share their journeys and funding needs. Donors discover them and help close the gap between talent and resources.
          </p>
        </div>

        {/* For Athletes */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">For Athletes</h2>
                <p className="text-muted-foreground">Share your story and ask for the support you need</p>
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

        {/* For Donors */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <HandHeart className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">For Donors</h2>
                <p className="text-muted-foreground">Help talented athletes overcome financial barriers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {donorFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-white">
          <div className="card-body text-center py-12">
            <h2 className="text-3xl font-bold mb-4">{user ? 'Ready for your next step?' : 'Ready to Get Started?'}</h2>
            <p className="text-xl mb-6">
              {user ? 'Pick up where you left off on your dashboard.' : 'Join as an athlete looking for support, or as a donor ready to help.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="btn btn-lg bg-base-100 text-primary hover:bg-base-100/90 border-none">
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register?role=athlete" className="btn btn-lg bg-base-100 text-primary hover:bg-base-100/90 border-none">
                    Join as an athlete
                  </Link>
                  <Link to="/register?role=donor" className="btn btn-lg btn-outline text-white border-base-100 hover:bg-base-100 hover:text-primary">
                    Become a donor
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
