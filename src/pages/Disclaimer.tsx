import { Navbar } from '@/components/Navbar';
import { AlertTriangle, ShieldAlert, DollarSign, UserX } from 'lucide-react';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Hero */}
        <div className="card bg-warning text-warning-content mb-8">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold mb-2">Important Disclaimer</h1>
                <p>Please read carefully before using Athylift</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <ShieldAlert className="h-8 w-8 text-error flex-shrink-0 mt-1" />
                <div>
                  <h2 className="card-title mb-4">Medical & Training Advice</h2>
                  <p className="mb-4">
                    The content shared on Athylift is for informational purposes only and should not be considered professional medical or training advice. Always consult with qualified healthcare providers and certified trainers before starting any new fitness program or making significant changes to your training regimen.
                  </p>
                  <p>
                    Individual results may vary. What works for one athlete may not be suitable for another due to differences in fitness levels, health conditions, and personal circumstances.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <UserX className="h-8 w-8 text-warning flex-shrink-0 mt-1" />
                <div>
                  <h2 className="card-title mb-4">No Liability</h2>
                  <p className="mb-4">
                    Athylift and its creators are not responsible for any injuries, accidents, or health issues that may result from following advice or training methods shared on this platform. Users engage in any physical activities at their own risk.
                  </p>
                  <p>
                    By using this platform, you acknowledge that you are responsible for your own safety and well-being during any athletic activities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <DollarSign className="h-8 w-8 text-info flex-shrink-0 mt-1" />
                <div>
                  <h2 className="card-title mb-4">Fundraising and Donations</h2>
                  <p className="mb-4">
                    Athlete profiles and support requests are written by athletes. Athylift encourages appropriate verification and responsible fundraising, but donors should review each request and its intended use before contributing. Online payments are not live yet, so no money is collected through Athylift today.
                  </p>
                  <p>
                    Any products, services, or transactions arranged directly between users or with third parties are independent of Athylift.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h2 className="card-title mb-4">User Responsibility</h2>
                  <p className="mb-4">
                    Users are solely responsible for the content they post and share on Athylift. This includes ensuring accuracy, respecting intellectual property rights, and maintaining appropriate conduct within the community.
                  </p>
                  <p>
                    Athylift reserves the right to remove content or suspend accounts that violate our community guidelines or terms of service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="alert alert-info mt-8">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Last Updated: January 2025</h3>
            <div className="text-sm">
              This disclaimer is subject to change. Please review it periodically for updates.
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Disclaimer;
