import { Link } from 'react-router-dom';
import { Target, Users, Heart, ArrowRight, Trophy } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const About = () => {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />

      <section className="bg-gradient-to-r from-primary to-secondary py-16 px-4 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-brand tracking-wide mb-6">About Athylift</h1>
          <p className="text-xl font-serif max-w-3xl mx-auto mb-8">
            Athylift is a fundraising and community platform that connects underprivileged athletes with donors who believe in their potential.
          </p>
          <Link to="/register" className="btn btn-lg bg-base-100 text-primary border-none hover:bg-base-100/90">
            Join Athylift
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
                Athylift exists to make sporting opportunities more accessible to athletes facing financial barriers. We believe that talent, determination, and passion deserve an opportunity to grow, regardless of an athlete's financial circumstances.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-secondary" />
                <h2 className="text-3xl font-semibold">Our Approach</h2>
              </div>
              <p className="font-serif leading-relaxed">
                By connecting athletes in need with supportive donors, we aim to bridge the gap between sporting ambition and the resources required to pursue it. From essential equipment to coaching and academy fees, Athylift provides a platform where athletes can share their journeys and seek meaningful support.
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
                <Trophy className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold">How It Works</h3>
              </div>
              <ol className="font-serif space-y-2 list-decimal pl-5">
                <li><strong>Athletes share their stories</strong> — profiles, achievements, goals, and what they need help funding.</li>
                <li><strong>Donors discover and connect</strong> — explore athletes and support requests, and choose whose journey to back.</li>
                <li><strong>Support sporting dreams</strong> — donors contribute towards equipment, training, coaching and academy fees.</li>
              </ol>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body space-y-2">
              <div className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-secondary" />
                <h3 className="text-2xl font-semibold">Our Values</h3>
              </div>
              <ul className="font-serif space-y-2">
                <li><strong>Accessibility</strong> — sporting opportunities for athletes facing financial barriers.</li>
                <li><strong>Inclusivity</strong> — athletes across different sports, backgrounds, and communities.</li>
                <li><strong>Transparency</strong> — clear needs, fundraising goals, and intended use of support.</li>
                <li><strong>Community</strong> — meaningful connections between athletes, donors, and supporters.</li>
                <li><strong>Empowerment</strong> — athletes own their journeys and pursue their ambitions.</li>
                <li><strong>Integrity</strong> — responsible fundraising, verification, and accountable use of contributions.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-4xl font-brand tracking-wide mb-4">Be part of an athlete's journey</h2>
          <p className="font-serif text-lg max-w-3xl mx-auto mb-6">
            Whether you're an athlete looking for support or a donor who wants to help talent grow, there's a place for you on Athylift.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=athlete" className="btn btn-lg bg-primary text-white border-none hover:bg-primary/80">
              Join as an athlete
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/register?role=donor" className="btn btn-lg btn-outline btn-primary">
              Become a donor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
