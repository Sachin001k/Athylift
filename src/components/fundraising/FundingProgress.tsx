import { formatMoney, RequestTotals } from '@/lib/athylift';

interface FundingProgressProps {
  target: number;
  currency: string;
  totals?: RequestTotals;
  compact?: boolean;
}

// Raised counts verified payments only; pledges are shown separately so totals are never inflated.
export const FundingProgress = ({ target, currency, totals, compact = false }: FundingProgressProps) => {
  const raised = totals?.amount_raised ?? 0;
  const remaining = Math.max(target - raised, 0);
  const percent = target > 0 ? Math.min(raised / target, 1) * 100 : 0;
  const pledges = totals?.pledge_count ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-bold text-primary ${compact ? 'text-lg' : 'text-3xl'}`}>{formatMoney(raised, currency)}</span>
        <span className="text-sm text-base-content/70">raised of {formatMoney(target, currency)}</span>
      </div>
      <progress
        className={`progress progress-primary w-full ${compact ? 'h-2' : 'h-4'}`}
        value={percent}
        max={100}
        aria-label={`${Math.round(percent)}% funded`}
      />
      <div className="flex justify-between text-xs text-base-content/70">
        <span>{formatMoney(remaining, currency)} remaining</span>
        {pledges > 0 && (
          <span>
            {pledges} {pledges === 1 ? 'pledge' : 'pledges'} ({formatMoney(totals?.amount_pledged ?? 0, currency)}, not yet paid)
          </span>
        )}
      </div>
    </div>
  );
};
