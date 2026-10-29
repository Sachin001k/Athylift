import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { HeartHandshake, Clock } from 'lucide-react';

type Donation = {
  id: string;
  amount: number;
  currency: string;
  frequency: string;
  payment_method: string | null;
  message: string | null;
  dedication: string | null;
  country: string | null;
  cover_fees: boolean | null;
  allow_updates: boolean | null;
  created_at: string;
  cause_title: string | null;
  cause_image: string | null;
  beneficiary_name: string | null;
  post_reference: string | null;
  post_id: string | null;
  request_id: string | null;
  status: string;
};

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

const Donations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user ?? null);
      if (!userData.user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('donations')
        .select(
          'id, amount, currency, frequency, payment_method, message, dedication, country, cover_fees, allow_updates, created_at, cause_title, cause_image, beneficiary_name, post_reference, post_id, request_id, status',
        )
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setDonations(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <Layout showStats={false}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-base-content/60">Your impact</p>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HeartHandshake className="h-6 w-6 text-primary" />
              Donations
            </h1>
          </div>
        </div>

        {!loading && !user && (
          <Alert>
            <AlertDescription>Please log in to view your donations.</AlertDescription>
          </Alert>
        )}

        {user && loading && (
          <Card>
            <CardContent className="p-6 flex items-center gap-3 text-base-content/80">
              <Clock className="h-5 w-5 animate-spin" />
              Loading your donations...
            </CardContent>
          </Card>
        )}

        {user && !loading && error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {user && !loading && !error && donations.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-6 space-y-3 text-center">
              <HeartHandshake className="h-8 w-8 mx-auto text-primary" />
              <p className="font-semibold">No donations yet</p>
              <p className="text-sm text-base-content/70">
                Explore the athlete feed and pledge support towards an athlete's sporting needs.
              </p>
            </CardContent>
          </Card>
        )}

        {user && donations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {donations.map((donation) => (
              <Card key={donation.id} className="overflow-hidden">
                {donation.cause_image && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={donation.cause_image}
                      alt={donation.cause_title || 'Donation cause'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{donation.cause_title || donation.post_reference || 'Donation'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {formatAmount(Number(donation.amount), donation.currency)}
                    </Badge>
                    <span className="text-xs text-base-content/60">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-base-content/70">
                    <Badge variant={donation.status === 'paid' ? 'default' : 'outline'}>{donation.status}</Badge>
                    <Badge variant="outline">{donation.frequency}</Badge>
                    {donation.payment_method && <Badge variant="outline">{donation.payment_method}</Badge>}
                    {donation.cover_fees && <Badge variant="outline">Covered fees</Badge>}
                  </div>
                  {donation.beneficiary_name && (
                    <p className="text-sm">
                      <span className="font-medium">Beneficiary:</span> {donation.beneficiary_name}
                    </p>
                  )}
                  {donation.request_id ? (
                    <Link to={`/requests/${donation.request_id}`} className="link link-primary text-sm">
                      View request
                    </Link>
                  ) : donation.post_id ? (
                    <Link to={`/feed?post=${donation.post_id}`} className="link link-primary text-sm">
                      View post
                    </Link>
                  ) : (
                    donation.post_reference && (
                      <p className="text-sm text-base-content/80">{donation.post_reference}</p>
                    )
                  )}
                  {donation.message && <p className="text-sm text-base-content/80">“{donation.message}”</p>}
                  {donation.dedication && (
                    <p className="text-xs text-base-content/70">Dedicated to: {donation.dedication}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Donations;
