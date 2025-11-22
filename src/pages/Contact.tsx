import { useState } from 'react';
import { Mail, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';

const Contact = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Message sent!',
      description: 'We\'ll get back to you as soon as possible',
    });
    
    setLoading(false);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar onMenuClick={() => {}} />
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl font-brand tracking-wide text-primary mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground font-serif">
              Have a question or feedback? We'd love to hear from you
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-2xl text-primary mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="input input-bordered w-full"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className="input input-bordered w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Message</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-32"
                      placeholder="How can we help you?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="card bg-base-100 shadow-xl border border-base-300">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-primary">Email Us</h3>
                      <p className="text-muted-foreground mb-2">
                        Our team typically responds within 24 hours
                      </p>
                      <a href="mailto:support@athlyft.com" className="link link-primary">
                        support@athlyft.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-primary text-primary-foreground">
                <div className="card-body">
                  <h3 className="card-title mb-4">Business Inquiries</h3>
                  <p className="mb-4">
                    Interested in partnerships or sponsorships? Reach out to our business team.
                  </p>
                  <a href="mailto:business@athlyft.com" className="btn bg-base-100 text-primary hover:bg-base-100/90 border-none">
                    Contact Business Team
                  </a>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border border-base-300">
                <div className="card-body">
                  <h3 className="card-title mb-4 text-primary">FAQ</h3>
                  <p className="mb-4 text-base-content/80">
                    Looking for quick answers? Check out our frequently asked questions.
                  </p>
                  <a href="/faq" className="btn btn-secondary border-none text-base-900 p-2">
                    Visit FAQ
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
