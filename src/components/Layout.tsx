import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { StatsRail } from './StatsRail';

interface LayoutProps {
  children: React.ReactNode;
  showStats?: boolean;
}

export const Layout = ({ children, showStats = true }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex w-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        {showStats && <StatsRail />}
      </div>
    </div>
  );
};
