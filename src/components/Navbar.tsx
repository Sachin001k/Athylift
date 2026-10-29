import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserAvatar } from '@/components/UserAvatar';

interface NavbarProps {
  // Pages with a sidebar (Layout) toggle it here; other pages get a built-in mobile menu.
  onMenuClick?: () => void;
}

const PAGE_LINKS = [
  { to: '/athletes', label: 'Athletes' },
  { to: '/feed', label: 'Feed' },
  { to: '/requests', label: 'Funding requests' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
];

type NotificationItem = {
  id: string;
  title: string | null;
  body: string | null;
  is_read: boolean | null;
  created_at?: string | null;
};

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toast } = useToast();
  // Shared across pages, so the header keeps its state while navigating.
  const {
    user,
    loading: authLoading,
    avatarUrl: profileAvatar,
    role,
    unreadCount: notificationCount,
    setUnreadCount: setNotificationCount,
  } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
      default:
        return <Moon className="h-5 w-5" />;
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'Could not log out', description: error.message, variant: 'destructive' });
      return;
    }
    navigate('/login', { replace: true });
  };

  const handleOpenNotifications = async () => {
    if (!user) return;
    setLoadingNotifications(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, body, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      toast({ title: 'Could not load notifications', description: error.message, variant: 'destructive' });
      setLoadingNotifications(false);
      return;
    }

    const items = (data as NotificationItem[]) || [];
    setNotifications(items);
    const unread = items.filter((n) => !n.is_read).length;
    setNotificationCount(unread);

    if (unread > 0) {
      const { error: markError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (markError) {
        console.warn('Could not mark notifications as read:', markError.message);
      } else {
        setNotificationCount(0);
        setNotifications(items.map((n) => ({ ...n, is_read: true })));
      }
    }
    setLoadingNotifications(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-base-100/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {onMenuClick ? (
            <button
              onClick={onMenuClick}
              className="btn btn-ghost btn-sm lg:hidden text-base-content"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="btn btn-ghost btn-sm lg:hidden text-base-content" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-base-100 text-base-content border-base-300">
                {user && (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="text-base-content">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {PAGE_LINKS.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to} className="text-base-content">{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="Athylift home"
            onClick={() => {
              // Already home: the route doesn't change, so scroll back to the top ourselves.
              if (pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary shadow-md">
              <span className="text-xl font-brand text-white tracking-wide">A</span>
            </div>
            <span className="hidden min-[380px]:inline text-xl sm:text-2xl font-brand font-bold uppercase text-primary tracking-wide">Athylift</span>
          </Link>
        </div>

        <nav className="hidden lg:flex flex-1 justify-center items-center gap-7 font-medium text-base-content">
          {(user ? [{ to: '/dashboard', label: 'Dashboard' }, ...PAGE_LINKS] : PAGE_LINKS).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative py-1 transition-colors hover:text-primary after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:origin-left ${
                  isActive ? 'text-primary after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="btn btn-ghost btn-circle btn-sm sm:btn-md text-base-content" aria-label="Change theme">
                {getThemeIcon()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-base-100 text-base-content border-base-300">
              <DropdownMenuItem onClick={() => setTheme('light')} className="text-base-content">
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="text-base-content">
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <DropdownMenu onOpenChange={(open) => open && handleOpenNotifications()}>
              <DropdownMenuTrigger asChild>
                <button className="btn btn-ghost btn-circle relative text-base-content">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="badge badge-primary badge-sm absolute top-1 right-1 text-white">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-base-100 text-base-content border-base-300 w-80">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  {loadingNotifications && <span className="loading loading-spinner loading-xs text-primary" />}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-base-300">
                  {notifications.length === 0 && !loadingNotifications && (
                    <p className="text-sm text-muted-foreground px-3 py-2">No notifications yet.</p>
                  )}
                  {notifications.map((note) => (
                    <div key={note.id} className="px-3 py-2">
                      <p className="text-sm font-semibold">{note.title || 'Notification'}</p>
                      <p className="text-sm text-muted-foreground">{note.body || 'You have a new update.'}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {note.created_at ? new Date(note.created_at).toLocaleString() : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {authLoading ? (
            // Same size as the avatar button, so nothing shifts while the session is checked.
            <div className="h-12 w-12" aria-hidden="true" />
          ) : !user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm sm:btn-md">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm sm:btn-md text-white">Sign up</Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="btn btn-ghost btn-circle p-0" aria-label="Account menu">
                  <UserAvatar
                    id={user.id}
                    name={(user.user_metadata?.full_name as string | undefined) || user.email}
                    url={profileAvatar}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-base-100 text-base-content border-base-300">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="text-base-content">Dashboard</Link>
                </DropdownMenuItem>
                {role === 'athlete' && (
                  <DropdownMenuItem asChild>
                    <Link to={`/athletes/${user.id}`} className="text-base-content">My public profile</Link>
                  </DropdownMenuItem>
                )}
                {role === 'donor' && (
                  <DropdownMenuItem asChild>
                    <Link to="/donations" className="text-base-content">My support</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="text-base-content">Account & photos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-base-content">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
