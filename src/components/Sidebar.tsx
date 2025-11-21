import { NavLink } from 'react-router-dom';
import { Home, User, FileText, Plus, Info, FileQuestion, Shield, Lock } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: 'Feed', path: '/explore' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const contentItems = [
    { icon: Plus, label: 'Post', path: '/add-post' },
    { icon: FileText, label: 'My Posts', path: '/my-posts' },
  ];

  const metaItems = [
    { icon: Info, label: 'About us', path: '/about' },
    { icon: FileQuestion, label: 'Terms & Conditions', path: '/terms' },
    { icon: Shield, label: 'Disclaimer', path: '/disclaimer' },
    { icon: FileQuestion, label: 'FAQs', path: '/faq' },
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

          <div>
            <h3 className="px-4 mb-2 text-sm font-semibold text-base-content/60">Content Management</h3>
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

          <div>
            <h3 className="px-4 mb-2 text-sm font-semibold text-base-content/60">Meta</h3>
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
