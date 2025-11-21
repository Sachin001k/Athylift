import { HelpCircle } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top right corner, enter your email and password, and you\'re ready to go! It takes less than a minute.',
    },
    {
      question: 'Is Athlyft free to use?',
      answer: 'Yes! Athlyft offers a free plan that includes all core features. We also offer Pro and Fan Supporter plans with additional benefits.',
    },
    {
      question: 'Can I connect with athletes from different sports?',
      answer: 'Absolutely! Athlyft is a platform for all athletes regardless of sport or discipline. Connect with runners, swimmers, cyclists, and more.',
    },
    {
      question: 'How do I share posts?',
      answer: 'Navigate to the "Add Post" section from the sidebar, upload your image, add a title and description, and hit "Save Post". Your post will be visible in the Explore feed.',
    },
    {
      question: 'Can I edit my profile?',
      answer: 'Yes! Visit your profile page and click the edit icons to update your cover photo, profile picture, bio, and other information.',
    },
    {
      question: 'How do I contact support?',
      answer: 'You can reach our support team through the Contact page or by emailing support@athlyft.com. We typically respond within 24 hours.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! We take security seriously and use industry-standard encryption to protect your data. Read our Privacy Policy for more details.',
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account at any time from your settings. Please note that this action is permanent and cannot be undone.',
    },
    {
      question: 'How do likes and comments work?',
      answer: 'Simply click the heart icon to like a post or the comment icon to leave a comment. You can engage with posts from any athlete in the community.',
    },
    {
      question: 'Can brands connect with athletes on Athlyft?',
      answer: 'Yes! Brands can create accounts and connect with athletes for potential sponsorships and partnerships.',
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about Athlyft
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="collapse collapse-plus bg-base-100 shadow-lg">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-semibold">
                {faq.question}
              </div>
              <div className="collapse-content">
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-white mt-12">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
            <p className="mb-6">Our support team is here to help</p>
            <a href="/contact" className="btn bg-white text-primary hover:bg-white/90 border-none mx-auto">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
