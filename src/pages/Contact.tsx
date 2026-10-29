import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Mail, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabaseClient';

const Contact = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const isDark = theme === 'dark';
  const mutedTextClass = isDark ? 'text-white/90' : 'text-muted-foreground';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    // Same rule as the contact_messages check constraint in supabase_setup.sql.
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    if (error) {
      toast({
        title: 'Message not sent',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

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
    <div className={`min-h-screen bg-base-200 ${isDark ? 'text-white' : 'text-base-content'}`}>
      <Navbar />
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
            <p className={`text-xl font-serif ${mutedTextClass}`}>
              Questions about supporting an athlete or asking for support? We'd love to hear from you
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
                      <p className={`${mutedTextClass} mb-2`}>
                        Our team typically responds within 24 hours
                      </p>
                      <a href="mailto:support@athylift.com" className="link link-primary">
                        support@athylift.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-primary text-primary-foreground">
                <div className="card-body">
                  <h3 className="card-title mb-4">Partnerships</h3>
                  <p className="mb-4">
                    Organisations, academies and sponsors who want to support athletes at scale can reach our partnerships team.
                  </p>
                  <a href="mailto:business@athylift.com" className="btn bg-base-100 text-primary hover:bg-base-100/90 border-none">
                    Contact Partnerships
                  </a>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border border-base-300">
                <div className="card-body">
                  <h3 className="card-title mb-4 text-primary">FAQ</h3>
                  <p className={`mb-4 ${mutedTextClass}`}>
                    Looking for quick answers? Check out our frequently asked questions.
                  </p>
                  <Link
                    to="/faq"
                    className={`btn btn-secondary border-none text-white`}
                  >
                    Visit FAQ
                  </Link>
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
