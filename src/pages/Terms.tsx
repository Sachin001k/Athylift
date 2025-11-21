import { FileText } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="card bg-info text-info-content mb-8">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <FileText className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
                <p>Please read these terms carefully</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body prose max-w-none text-base-content">
            <h2 className="text-base-content">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Athlyft, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-base-content">2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on Athlyft for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-base-content">3. User Content</h2>
            <p>
              You retain all rights to the content you post on Athlyft. However, by posting content, you grant us a license to use, display, and distribute your content on the platform.
            </p>

            <h2 className="text-base-content">4. Prohibited Uses</h2>
            <p>
              You may not use Athlyft for any unlawful purpose or to violate any laws. Prohibited activities include harassment, spam, and posting inappropriate content.
            </p>

            <h2 className="text-base-content">5. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users.
            </p>

            <h2 className="text-base-content">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
