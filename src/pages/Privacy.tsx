import { Shield, Database, Eye, Mail, Lock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body flex items-center gap-4">
              <Shield className="h-12 w-12 text-primary" />
              <div>
                <h1 className="text-3xl font-brand tracking-wide mb-2">Privacy Policy</h1>
                <p className="font-serif">We understand the importance of privacy, especially for sensitive topics.</p>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body space-y-2 font-serif">
              <p>Welcome to Athlyft. This Privacy Policy outlines how we collect, use, and protect your data across our platform.</p>
              <p className="text-sm text-muted-foreground">Last updated: May 7, 2025.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <Database className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div className="font-serif">
                    <h2 className="card-title mb-3">Information We Collect</h2>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Personal details: name, email address, contact information (optional during account creation).</li>
                      <li>Profile information: posts, replies, media uploads, parenting topics followed.</li>
                      <li>Technical data: device type, browser version, IP address, and usage patterns.</li>
                      <li>Anonymous insights shared via posts or responses.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <Eye className="h-8 w-8 text-secondary flex-shrink-0 mt-1" />
                  <div className="font-serif">
                    <h2 className="card-title mb-3">How We Use Your Information</h2>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Provide a secure, customized experience on the platform.</li>
                      <li>Enable features like personalized feeds, private messages, or anonymous posts.</li>
                      <li>Monitor content safety and community health.</li>
                      <li>Suggest therapist connections if a post shows signs of distress (with user consent).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body font-serif space-y-3">
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary" />
                  <h2 className="card-title mb-0">Third-Party Services</h2>
                </div>
                <p>We only share data with trusted third parties essential to platform functionality:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Cloud service providers for hosting and backups.</li>
                  <li>Analytics tools to improve performance and insights.</li>
                  <li>Email services to deliver account-related updates.</li>
                </ul>
                <p>We never sell your data or share it with advertisers.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div className="font-serif">
                    <h2 className="card-title mb-3">Data Protection</h2>
                    <ul className="list-disc list-inside space-y-2">
                      <li>End-to-end encryption for sensitive content.</li>
                      <li>Routine security audits and vulnerability assessments.</li>
                      <li>Strict access control policies.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body font-serif space-y-3">
                <h2 className="card-title">Your Rights & Choices</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Access or update your profile data.</li>
                  <li>Delete posts or your entire account.</li>
                  <li>Request complete removal of your personal data.</li>
                  <li>Opt out of communication or anonymize further.</li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body font-serif space-y-3">
                <h2 className="card-title">Updates to This Policy</h2>
                <p>We may update this Privacy Policy to reflect new features or legal requirements. Major updates will be notified via email or in-app notification.</p>
              </div>
            </div>
          </div>

          <div className="card bg-primary text-primary-foreground mt-8">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <Mail className="h-8 w-8 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="card-title mb-2">Questions or concerns?</h2>
                  <p className="mb-4 font-serif">Reach out to us at <a className="underline" href="mailto:privacy@athlyft.com">privacy@athlyft.com</a>. We’re here to help.</p>
                  <div className="btn btn-sm bg-base-100 text-primary border-none hover:bg-base-100/90 w-max">
                    Email Privacy Team
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
