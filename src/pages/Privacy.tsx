import { Shield, Database, Eye, Mail } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Hero */}
        <div className="card bg-info text-info-content mb-8">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <Shield className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p>Your privacy is important to us</p>
              </div>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <p className="text-lg">
              At Athlyft, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last Updated: January 2025
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <Database className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="card-title mb-4">Information We Collect</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Account Information:</strong> Name, email address, and profile details</li>
                    <li><strong>Content:</strong> Posts, images, and videos you share on the platform</li>
                    <li><strong>Usage Data:</strong> How you interact with our platform and features you use</li>
                    <li><strong>Device Information:</strong> Browser type, IP address, and device characteristics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <Eye className="h-8 w-8 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="card-title mb-4">How We Use Your Information</h2>
                  <ul className="list-disc list-inside space-y-2">
                    <li>To provide and improve our services</li>
                    <li>To personalize your experience on Athlyft</li>
                    <li>To communicate with you about updates and features</li>
                    <li>To maintain the security and integrity of our platform</li>
                    <li>To analyze usage patterns and optimize performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-success flex-shrink-0 mt-1" />
                <div>
                  <h2 className="card-title mb-4">Data Protection</h2>
                  <p className="mb-4">
                    We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. This includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Encrypted data transmission (HTTPS/SSL)</li>
                    <li>Secure password storage with hashing</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited access to personal data by authorized personnel only</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access your personal information</li>
                <li>Update or correct your data</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Third-Party Services</h2>
              <p className="mb-4">
                Athlyft may use third-party services for analytics, hosting, and other functions. These providers have their own privacy policies and are bound by confidentiality agreements. We do not sell your personal information to third parties.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to improve your experience on Athlyft. You can control cookie preferences through your browser settings. However, disabling cookies may affect the functionality of certain features.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting a notice on our platform or sending you an email. Your continued use of Athlyft after such changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card bg-primary text-primary-foreground mt-8">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <Mail className="h-8 w-8 flex-shrink-0 mt-1" />
              <div>
                <h2 className="card-title mb-2">Questions About Privacy?</h2>
                <p className="mb-4">
                  If you have any questions or concerns about our privacy practices, please don't hesitate to contact us.
                </p>
                <a href="mailto:privacy@athlyft.com" className="btn btn-sm bg-white text-primary hover:bg-white/90">
                  Contact Privacy Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
