import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { asRole, Role } from '@/lib/athylift';

// Auth state lives here, above the router, so it survives page changes.
// Without it every page re-checked the session and the header flickered to "logged out" and back.
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  // True only until the first session check finishes after the app loads.
  loading: boolean;
  avatarUrl: string | null;
  role: Role | null;
  onboardingComplete: boolean;
  // False while the signed-in user's profile (role, onboarding) is still loading.
  profileReady: boolean;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  // Which user the role/onboarding state belongs to, so a new login never sees the previous user's.
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const user = session?.user ?? null;
  const userId = user?.id ?? null;
  // The latest user a profile load was started for; older responses are dropped.
  const currentUserRef = useRef<string | null>(null);
  currentUserRef.current = userId;

  useEffect(() => {
    // getSession reads the stored session locally, so this is fast and needs no network round trip.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setAvatarUrl(null);
      setUnreadCount(0);
      setRole(null);
      setOnboardingComplete(false);
      setProfileUserId(null);
      return;
    }
    const [{ data: profile, error: profileError }, { count, error: countError }] = await Promise.all([
      supabase.from('profiles').select('avatar_url, role, onboarding_complete').eq('id', userId).maybeSingle(),
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false),
    ]);
    if (currentUserRef.current !== userId) return;
    if (profileError) {
      // Keep whatever was known; a blip shouldn't bounce a set-up user to onboarding.
      console.warn('Could not load profile:', profileError.message);
    } else {
      setAvatarUrl(profile?.avatar_url || null);
      setRole(asRole(profile?.role));
      setOnboardingComplete(Boolean(profile?.onboarding_complete));
    }
    setProfileUserId(userId);
    if (countError) console.warn('Could not load notifications:', countError.message);
    else setUnreadCount(count ?? 0);
  }, [userId]);

  // Load avatar and unread count once per signed-in user (not on every token refresh or page change).
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Profile.tsx fires this after a new avatar is saved.
  useEffect(() => {
    const onProfileUpdated = () => {
      refreshProfile();
    };
    window.addEventListener('profile-updated', onProfileUpdated);
    return () => window.removeEventListener('profile-updated', onProfileUpdated);
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        avatarUrl,
        role,
        onboardingComplete,
        profileReady: !userId || profileUserId === userId,
        unreadCount,
        setUnreadCount,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
