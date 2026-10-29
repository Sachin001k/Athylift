import { FileText, Shield } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const Terms = () => {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body flex items-center gap-4">
              <FileText className="h-12 w-12 text-primary" />
              <div>
                <h1 className="text-3xl font-brand tracking-wide mb-2">Terms & Conditions</h1>
                <p className="font-serif">Welcome to Athylift. Please review these terms carefully.</p>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-6 font-serif">
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />Acceptance of Terms</h2>
                <p>By using Athylift, you acknowledge and agree to comply with these terms. If you do not agree, please discontinue use immediately.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">User Responsibilities</h2>
                <p>You are responsible for providing accurate information, treating others with respect, and ensuring your content adheres to our community guidelines.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">Athletes and Support Requests</h2>
                <p>Athletes must describe their achievements, needs, funding goals and intended use of support truthfully. Contributions must be used for the sporting purpose stated in the support request, and athletes should keep supporters updated on how support was used.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">Donors and Contributions</h2>
                <p>Donors choose which athletes and requests to support. Athylift helps present needs clearly but cannot guarantee the outcome of any athlete's sporting journey. Online payments are not live yet; pledges recorded today do not charge any money.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">Privacy Policy</h2>
                <p>We take your privacy seriously. Your personal data will be managed in accordance with our Privacy Policy.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">Account Termination</h2>
                <p>We reserve the right to suspend or terminate user accounts that violate our terms or engage in fraudulent fundraising or harmful activity.</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">Changes to Terms</h2>
                <p>These terms may be updated periodically. Continued use after changes are made constitutes acceptance of the revised terms.</p>
              </div>

              <div className="rounded-lg border border-border p-4 bg-base-200">
                <p>For any questions, please contact us at <a className="link text-primary" href="mailto:support@athylift.com">support@athylift.com</a>.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;
