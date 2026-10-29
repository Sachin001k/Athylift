import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const FAQ = () => {
  const faqs = [
    {
      question: 'What is Athylift?',
      answer: 'Athylift is a fundraising and community platform that connects underprivileged athletes with donors who help fund equipment, coaching, training and academy fees.',
    },
    {
      question: 'Who can join as an athlete?',
      answer: 'Athletes of any sport who face financial barriers to training or competing. You create a profile, share your achievements and goals, and post what you need help funding.',
    },
    {
      question: 'What can athletes ask for support with?',
      answer: 'Sporting needs such as equipment, coaching, training, academy fees and travel to competitions. Every request should explain how the support will be used.',
    },
    {
      question: 'How do donors choose who to support?',
      answer: 'Donors explore athlete profiles and support requests, read about each athlete\'s goals and needs, and choose the journeys they want to back.',
    },
    {
      question: 'Can I donate online right now?',
      answer: 'Not yet. You can record a pledge to support an athlete, but online payments are not connected and no money is charged. We will announce when payments go live.',
    },
    {
      question: 'How are athletes under 18 protected?',
      answer: 'Profiles of minors hide location and exact age from public view, and phone numbers or addresses are never shown publicly.',
    },
    {
      question: 'How do I report a misleading profile or request?',
      answer: 'Contact us with a link to the profile or post. We review reports to keep fundraising on Athylift honest and responsible.',
    },
    {
      question: 'Is Athylift free to use?',
      answer: 'Yes. Joining as an athlete or as a donor is free.',
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl font-brand tracking-wide mb-3">Frequently Asked Questions</h1>
            <p className="text-xl font-serif">Quick answers for athletes and donors.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="collapse collapse-plus bg-base-100 shadow-lg">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-lg font-semibold">
                  {faq.question}
                </div>
                <div className="collapse-content">
                  <p className="text-base font-serif">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-gradient-to-r from-primary to-secondary text-white mt-12">
            <div className="card-body text-center">
              <h2 className="text-2xl font-brand mb-2">Still have questions?</h2>
              <p className="mb-6 font-serif">Reach us at <a className="underline" href="mailto:support@athylift.com">support@athylift.com</a>. We are happy to help.</p>
              <Link to="/contact" className="btn bg-base-100 text-primary border-none mx-auto hover:bg-base-100/90">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
