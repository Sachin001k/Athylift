import { NavLink } from 'react-router-dom';
import { Compass, Plus, User, Info, Shield, Lock } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Plus, label: 'Add Post', path: '/add-post' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const metaItems = [
    { icon: Info, label: 'About', path: '/about' },
    { icon: Shield, label: 'Disclaimer', path: '/disclaimer' },
    { icon: Lock, label: 'Privacy Policy', path: '/privacy' },
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
        <nav className="flex flex-col gap-2 p-4">
          <div className="menu">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-base-200'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="divider">Meta</div>

          <div className="menu">
            {metaItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-base-200'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
};
