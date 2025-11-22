import { Link } from 'react-router-dom';
import { Target, Users, Heart, ArrowRight, Shield, MessageCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const About = () => {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar onMenuClick={() => {}} />

      <section className="bg-gradient-to-r from-primary to-secondary py-16 px-4 text-base-900 p-2">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-brand tracking-wide mb-6">About Athlyt</h1>
          <p className="text-xl font-serif max-w-3xl mx-auto mb-8">
            Welcome to Athlyt, a trusted online community created for parents navigating overwhelming situations. Our focus: provide a supportive, private space to share, learn, and heal together.
          </p>
          <Link to="/register" className="btn btn-lg bg-base-100 text-primary border-none hover:bg-base-100/90">
            Join Our Community
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="py-14 px-4">
        <div className="container mx-auto grid gap-8 md:grid-cols-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-semibold">Our Mission</h2>
              </div>
              <p className="font-serif leading-relaxed">
                To build a safe, judgment-free space for parents to express challenges, seek advice, and find emotional comfort—anonymously or openly—through shared experiences and professional insights.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-secondary" />
                <h2 className="text-3xl font-semibold">What Makes Us Unique</h2>
              </div>
              <p className="font-serif leading-relaxed">
                We offer the freedom to ask or answer questions anonymously, prioritize emotional support, and connect you with licensed therapists when needed—without ever compromising your privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-base-100">
        <div className="container mx-auto grid gap-8 md:grid-cols-2">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body space-y-2">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold">How It Works</h3>
              </div>
              <ul className="font-serif space-y-2">
                <li>Ask questions freely—anonymous or with your profile.</li>
                <li>Real stories, real advice from other parents.</li>
                <li>Therapist involvement when needed.</li>
                <li>Private help suggestions if distress appears.</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body space-y-2">
              <div className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-secondary" />
                <h3 className="text-2xl font-semibold">Our Values</h3>
              </div>
              <ul className="font-serif space-y-2">
                <li>Empathy first: we listen before we speak.</li>
                <li>Privacy & safety: anonymity is respected.</li>
                <li>Support over judgment.</li>
                <li>Guided help without stigma.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-4xl font-brand tracking-wide mb-4">Need guidance?</h2>
          <p className="font-serif text-lg max-w-3xl mx-auto mb-6">
            Whether you're here to ask, support, or simply listen—Athlyt welcomes you. Join a movement where shared parenting experiences lead to healing, strength, and better mental well-being.
          </p>
          <Link to="/register" className="btn btn-lg bg-primary text-base-900 p-2 border-none hover:bg-primary/80">
            Become a Member
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
