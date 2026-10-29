import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const Pricing = () => {
  const plans = [
    {
      name: 'Athletes',
      price: 'Free',
      description: 'For athletes facing financial barriers',
      features: [
        'Create your athlete profile',
        'Share achievements and training updates',
        'Post support requests for your sporting needs',
        'Explain how contributions will be used',
        'Keep supporters updated on your progress',
      ],
      buttonText: 'Join as an athlete',
      to: '/register?role=athlete',
      buttonClass: 'btn-primary',
    },
    {
      name: 'Donors',
      price: 'Free',
      description: 'For people who want to support athletes',
      features: [
        'Explore athlete profiles and stories',
        'Browse support requests by sport and need',
        'Contribute towards equipment, coaching and fees',
        'Keep a record of the athletes you support',
        'Follow the journeys you helped make possible',
      ],
      buttonText: 'Become a donor',
      to: '/register?role=donor',
      buttonClass: 'btn-secondary',
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto max-w-5xl py-12 px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-brand tracking-wide text-primary mb-4">Free for Athletes and Donors</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
            Athylift doesn't charge athletes to share their stories or ask for support, and joining as a donor is free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {plans.map((plan, idx) => (
            <div key={idx} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-2xl">{plan.name}</h3>
                <div className="py-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.to} className={`btn ${plan.buttonClass} w-full`}>
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Does Athylift take a share of donations?</h3>
                <p className="text-muted-foreground">
                  Online payments aren't live yet. When they are, any payment processing fees will be shown clearly before a donor contributes.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Can I donate right now?</h3>
                <p className="text-muted-foreground">
                  You can record a pledge to support an athlete. No money is charged until online payments are connected.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">What can athletes ask for support with?</h3>
                <p className="text-muted-foreground">
                  Sporting needs such as equipment, coaching, training, academy fees and travel to competitions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
