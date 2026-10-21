import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const FAQ = () => {
  const faqs = [
    {
      question: 'What is Athlyft?',
      answer: 'Athlyft is a safe, supportive platform where you can freely ask parenting or personal questions—without judgment. You can remain anonymous and connect with a community that understands your journey.',
    },
    {
      question: 'Can I ask questions anonymously?',
      answer: 'Absolutely. When posting, you can choose to hide your identity. Your question will be visible to the community without revealing your name or profile.',
    },
    {
      question: 'Is my personal data safe?',
      answer: 'Yes. Your data is encrypted and never sold or shared with advertisers. Read more in our Privacy Policy.',
    },
    {
      question: 'Who answers my questions?',
      answer: 'Answers come from our parenting community, certified coaches, and experienced parents. Every response is moderated for respect and safety.',
    },
    {
      question: 'Can I delete a post or comment later?',
      answer: 'Yes, you can edit or delete your content anytime from your profile settings. You control your presence.',
    },
    {
      question: 'How do I report inappropriate content?',
      answer: 'Each post and reply has a "Report" button. Our moderation team reviews all flagged content within 24 hours to keep the community safe.',
    },
    {
      question: 'Is Athlyft free to use?',
      answer: 'Yes, Athlyft is completely free. We’re here to support your journey, not profit from your privacy.',
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
            <p className="text-xl font-serif">Quick answers about staying safe, supported, and anonymous.</p>
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

          <div className="card bg-gradient-to-r from-primary to-secondary text-base-900 p-2 mt-12">
            <div className="card-body text-center">
              <h2 className="text-2xl font-brand mb-2">Still have questions?</h2>
              <p className="mb-6 font-serif">Reach us at <a className="underline" href="mailto:support@athlyft.com">support@athlyft.com</a>. We are happy to help.</p>
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
