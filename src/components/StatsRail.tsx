import { FileText, Users } from 'lucide-react';

export const StatsRail = () => {
  return (
    <aside className="hidden xl:block w-80 space-y-4 p-4">
      <div className="stats stats-vertical shadow-lg bg-base-100 w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <FileText className="h-8 w-8" />
          </div>
          <div className="stat-title">Total Posts</div>
          <div className="stat-value text-primary">1,247</div>
          <div className="stat-desc">↗︎ 12% this month</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <Users className="h-8 w-8" />
          </div>
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-secondary">3,891</div>
          <div className="stat-desc">↗︎ 8% this month</div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-sm">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-primary">#Fitness</span>
            <span className="badge badge-secondary">#Training</span>
            <span className="badge badge-accent">#Nutrition</span>
            <span className="badge badge-info">#Recovery</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
