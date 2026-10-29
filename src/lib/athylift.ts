import { supabase } from '@/lib/supabaseClient';

// Mirrors the check constraints in supabase_setup.sql (fundraising model section).
export type Role = 'athlete' | 'donor';
export type RequestCategory = 'equipment' | 'coaching' | 'training' | 'academy_fees' | 'travel' | 'other';
export type RequestStatus = 'draft' | 'active' | 'funded' | 'closed';
export type AchievementLevel = 'local' | 'state' | 'national' | 'international';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export const asRole = (value: unknown): Role | null => (value === 'athlete' || value === 'donor' ? value : null);

export const REQUEST_CATEGORIES: { value: RequestCategory; label: string }[] = [
  { value: 'equipment', label: 'Equipment' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'training', label: 'Training' },
  { value: 'academy_fees', label: 'Academy fees' },
  { value: 'travel', label: 'Travel' },
  { value: 'other', label: 'Other' },
];

export const categoryLabel = (value: string) => REQUEST_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  funded: 'Funded',
  closed: 'Closed',
};

export const STATUS_BADGE: Record<RequestStatus, string> = {
  draft: 'badge-ghost',
  active: 'badge-primary',
  funded: 'badge-success',
  closed: 'badge-neutral',
};

export const ACHIEVEMENT_LEVELS: { value: AchievementLevel; label: string }[] = [
  { value: 'local', label: 'Local' },
  { value: 'state', label: 'State' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
];

// Suggestions only; athletes can type any sport.
export const SPORTS = [
  'Athletics', 'Archery', 'Badminton', 'Basketball', 'Boxing', 'Chess', 'Cricket', 'Cycling', 'Football',
  'Gymnastics', 'Hockey', 'Judo', 'Kabaddi', 'Kho-Kho', 'Shooting', 'Swimming', 'Table Tennis', 'Taekwondo',
  'Tennis', 'Volleyball', 'Weightlifting', 'Wrestling',
];

export type AthleteSummary = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  sport: string | null;
  discipline: string | null;
  goals: string | null;
  location: string | null;
  academy: string | null;
  is_minor: boolean;
  verification_status: VerificationStatus;
  is_sample: boolean;
  created_at: string;
};

export type SupportRequest = {
  id: string;
  athlete_id: string;
  title: string;
  description: string;
  category: RequestCategory;
  target_amount: number;
  currency: string;
  intended_use: string;
  status: RequestStatus;
  deadline: string | null;
  image_url: string | null;
  image_path: string | null;
  created_at: string;
};

export type Achievement = {
  id: string;
  athlete_id: string;
  title: string;
  event: string | null;
  level: AchievementLevel;
  achieved_on: string | null;
  description: string | null;
};

export type RequestTotals = {
  request_id: string;
  amount_raised: number;
  pledge_count: number;
  amount_pledged: number;
};

export const ATHLETE_COLUMNS =
  'id, full_name, avatar_url, cover_url, bio, sport, discipline, goals, location, academy, is_minor, verification_status, is_sample, created_at';
export const REQUEST_COLUMNS =
  'id, athlete_id, title, description, category, target_amount, currency, intended_use, status, deadline, image_url, image_path, created_at';

export const formatMoney = (amount: number, currency = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

export const avatarFor = (id: string, url: string | null | undefined) =>
  url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(id)}`;

const EMPTY_TOTALS = (requestId: string): RequestTotals => ({
  request_id: requestId,
  amount_raised: 0,
  pledge_count: 0,
  amount_pledged: 0,
});

export const fetchTotals = async (requestIds: string[]): Promise<Record<string, RequestTotals>> => {
  const result: Record<string, RequestTotals> = {};
  requestIds.forEach((id) => (result[id] = EMPTY_TOTALS(id)));
  if (requestIds.length === 0) return result;
  const { data, error } = await supabase
    .from('support_request_totals')
    .select('request_id, amount_raised, pledge_count, amount_pledged')
    .in('request_id', requestIds);
  if (error) {
    console.warn('Could not load request totals:', error.message);
    return result;
  }
  (data || []).forEach((row) => {
    result[row.request_id] = {
      request_id: row.request_id,
      amount_raised: Number(row.amount_raised),
      pledge_count: Number(row.pledge_count),
      amount_pledged: Number(row.amount_pledged),
    };
  });
  return result;
};

export const fetchAthletes = async (ids: string[]): Promise<Record<string, AthleteSummary>> => {
  const unique = Array.from(new Set(ids));
  if (unique.length === 0) return {};
  const { data, error } = await supabase.from('athlete_directory').select(ATHLETE_COLUMNS).in('id', unique);
  if (error) {
    console.warn('Could not load athletes:', error.message);
    return {};
  }
  return Object.fromEntries((data as AthleteSummary[]).map((a) => [a.id, a]));
};
