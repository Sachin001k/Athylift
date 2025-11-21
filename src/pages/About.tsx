import { Link } from 'react-router-dom';
import { Target, Users, Heart, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-secondary py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">About Athlyft</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Empowering athletes worldwide to connect, share, and inspire
          </p>
          <Link to="/register" className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none">
            Join Our Community
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-3xl mb-4">Our Mission</h2>
              <p className="text-lg">
                At Athlyft, we believe every athlete has a story worth sharing. Our platform connects athletes from all disciplines, creating a supportive community where achievements are celebrated, challenges are shared, and motivation is contagious.
              </p>
              <p className="text-lg mt-4">
                Whether you're a professional competitor or a weekend warrior, Athlyft provides the tools and community to help you reach your goals and inspire others along the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-base-100">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="card-title">Focus on Athletes</h3>
                <p>Built specifically for athletes, by athletes. Every feature is designed with your journey in mind.</p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="card-title">Global Community</h3>
                <p>Connect with athletes from around the world, share experiences, and build lasting friendships.</p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
                <h3 className="card-title">Support & Motivation</h3>
                <p>Get inspired daily by real stories from real athletes achieving real results.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of athletes already sharing their stories on Athlyft
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
