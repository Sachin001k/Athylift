import { Link } from 'react-router-dom';
import { AthleteSummary, categoryLabel, RequestTotals, STATUS_BADGE, STATUS_LABELS, SupportRequest } from '@/lib/athylift';
import { FundingProgress } from './FundingProgress';

interface RequestCardProps {
  request: SupportRequest;
  athlete?: AthleteSummary;
  totals?: RequestTotals;
}

export const RequestCard = ({ request, athlete, totals }: RequestCardProps) => (
  <div className="card bg-base-100 shadow-lg border border-base-300">
    {request.image_url && (
      <figure>
        <img src={request.image_url} alt="" className="w-full aspect-video object-cover" />
      </figure>
    )}
    <div className="card-body p-5 gap-3">
      <div className="flex flex-wrap gap-2">
        <span className="badge badge-outline">{categoryLabel(request.category)}</span>
        <span className={`badge ${STATUS_BADGE[request.status]}`}>{STATUS_LABELS[request.status]}</span>
      </div>
      <h3 className="card-title text-lg">
        <Link to={`/requests/${request.id}`} className="hover:text-primary">{request.title}</Link>
      </h3>
      {athlete && (
        <p className="text-sm text-base-content/70">
          <Link to={`/athletes/${athlete.id}`} className="link link-hover">{athlete.full_name || 'Athlete'}</Link>
          {athlete.sport ? ` · ${athlete.sport}` : ''}
        </p>
      )}
      <FundingProgress target={Number(request.target_amount)} currency={request.currency} totals={totals} compact />
      <div className="card-actions justify-end">
        <Link to={`/requests/${request.id}`} className="btn btn-primary btn-sm text-white">View request</Link>
      </div>
    </div>
  </div>
);
