import { Check } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Create your profile',
        'Share up to 10 posts per month',
        'Connect with other athletes',
        'Basic gallery (10 images)',
        'Community support',
      ],
      buttonText: 'Get Started',
      buttonClass: 'btn-outline',
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      description: 'For serious athletes',
      features: [
        'Everything in Free',
        'Unlimited posts',
        'Unlimited gallery storage',
        'Video hosting',
        'Priority support',
        'Analytics dashboard',
        'Custom profile URL',
      ],
      buttonText: 'Go Pro',
      buttonClass: 'btn-primary',
      popular: true,
    },
    {
      name: 'Fan Supporter',
      price: '$4.99',
      period: '/month',
      description: 'Support your favorite athletes',
      features: [
        'Ad-free experience',
        'Exclusive content access',
        'Direct messaging with athletes',
        'Early access to features',
        'Supporter badge',
      ],
      buttonText: 'Become a Supporter',
      buttonClass: 'btn-secondary',
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you. All plans include core features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`card bg-base-100 shadow-xl ${
                plan.popular ? 'ring-2 ring-primary scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="badge badge-primary absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </div>
              )}
              <div className="card-body">
                <h3 className="card-title text-2xl">{plan.name}</h3>
                <div className="py-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
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

                <button className={`btn ${plan.buttonClass} w-full`}>
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Can I change my plan later?</h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and various local payment methods depending on your region.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Is there a free trial for Pro?</h3>
                <p className="text-muted-foreground">
                  Yes! All new users get a 14-day free trial of the Pro plan. No credit card required.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">What happens if I cancel?</h3>
                <p className="text-muted-foreground">
                  You'll retain access to your plan features until the end of your billing period. After that, you'll be moved to the Free plan.
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
