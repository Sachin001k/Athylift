import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const StatsRail = () => {
  const [postCount, setPostCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostCount = async () => {
      setLoading(true);
      setError(null);
      const { count, error } = await supabase
        .from('posts')
        .select('id', { head: true, count: 'exact' });

      if (error) {
        setError('Could not load posts');
        setPostCount(null);
      } else {
        setPostCount(count ?? 0);
      }
      setLoading(false);
    };

    fetchPostCount();
  }, []);

  return (
    <aside className="hidden xl:block w-80 space-y-4 p-4">
      <div className="stats stats-vertical shadow-lg bg-base-100 w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <FileText className="h-8 w-8" />
          </div>
          <div className="stat-title">Total Posts</div>
          <div className="stat-value text-primary">
            {loading ? '...' : (postCount ?? '—')}
          </div>
          <div className="stat-desc">{error ? error : 'Live count'}</div>
        </div>
      </div>
    </aside>
  );
};
