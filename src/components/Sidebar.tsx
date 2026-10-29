import { NavLink } from 'react-router-dom';
import { Home, User, FileText, Plus, Info, FileQuestion, Shield, HeartHandshake, LayoutDashboard, Trophy, HandCoins, Megaphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, role } = useAuth();

  const menuItems = [
    ...(user ? [{ icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }] : []),
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Trophy, label: 'Athletes', path: '/athletes' },
    { icon: HandCoins, label: 'Funding requests', path: '/requests' },
    ...(role === 'donor' ? [{ icon: HeartHandshake, label: 'My support', path: '/donations' }] : []),
    ...(user ? [{ icon: User, label: 'Account', path: '/profile' }] : []),
  ];

  const contentItems = user
    ? [
        ...(role === 'athlete' ? [{ icon: Megaphone, label: 'New support request', path: '/requests/new' }] : []),
        { icon: Plus, label: 'Share an update', path: '/add-post' },
        { icon: FileText, label: 'My posts', path: '/my-posts' },
      ]
    : [];

  const metaItems = [
    { icon: Info, label: 'How it works', path: '/how-it-works' },
    { icon: Info, label: 'About us', path: '/about' },
    { icon: FileQuestion, label: 'FAQs', path: '/faq' },
    { icon: FileQuestion, label: 'Terms & Conditions', path: '/terms' },
    { icon: Shield, label: 'Disclaimer', path: '/disclaimer' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 transform border-r bg-base-100 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col gap-6 p-6">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors text-base-content ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-base-200'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {contentItems.length > 0 && (
          <div>
            <h3 className="px-4 mb-2 text-sm font-semibold text-base-content/60">Create</h3>
            <div className="space-y-1">
              {contentItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors text-base-content ml-4 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-base-200'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
          )}

          <div>
            <h3 className="px-4 mb-2 text-sm font-semibold text-base-content/60">Learn</h3>
            <div className="space-y-1">
              {metaItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors text-base-content ml-4 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-base-200'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};
