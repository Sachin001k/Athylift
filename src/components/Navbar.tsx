import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
      default:
        return <Moon className="h-5 w-5" />;
    }
  };

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
    if (data.user) {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', data.user.id)
        .eq('is_read', false);
      setNotificationCount(count ?? 0);
    } else {
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNotificationCount(0);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-base-100/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="btn btn-ghost btn-sm lg:hidden text-base-content"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md">
              <span className="text-xl font-brand text-base-900 p-2 tracking-wide">A</span>
            </div>
            <span className="text-2xl font-brand text-primary tracking-wide">Athlyft</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-6 font-medium text-base-content">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
          <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </nav>

        <div className="hidden flex-1 max-w-md mx-8 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search the Athlyt community"
              className="input input-bordered w-full pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="btn btn-ghost btn-circle text-base-content">
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
            <button className="btn btn-ghost btn-circle relative text-base-content">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="badge badge-primary badge-sm absolute top-1 right-1 text-base-900 p-2">
                  {notificationCount}
                </span>
              )}
            </button>
          )}

          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary text-base-900 p-2">Sign Up</Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="btn btn-ghost btn-circle avatar">
                  <Avatar>
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=athlete" />
                    <AvatarFallback>{(user.email || 'AT').slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-base-100 text-base-content border-base-300">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="text-base-content">Profile</Link>
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
