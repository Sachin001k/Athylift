import { BadgeCheck } from 'lucide-react';
import { AthleteSummary } from '@/lib/athylift';

export const AthleteBadges = ({ athlete }: { athlete: Pick<AthleteSummary, 'verification_status' | 'is_sample'> }) => (
  <>
    {athlete.verification_status === 'verified' && (
      <span className="badge badge-success gap-1 text-white">
        <BadgeCheck className="h-3 w-3" /> Verified
      </span>
    )}
    {athlete.is_sample && <span className="badge badge-warning">Sample profile</span>}
  </>
);
