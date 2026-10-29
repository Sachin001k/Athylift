import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/lib/athylift';

type ProtectedRouteProps = {
  children: JSX.Element;
  // Only this role may open the page; others go to their dashboard.
  role?: Role;
  // The onboarding page itself must not redirect to onboarding.
  allowIncompleteProfile?: boolean;
};

export const ProtectedRoute = ({ children, role, allowIncompleteProfile = false }: ProtectedRouteProps) => {
  // The session is checked once for the whole app, so moving between pages doesn't blank the screen.
  const { session, loading: checking, profileReady, onboardingComplete, role: userRole } = useAuth();
  const location = useLocation();

  if (checking || (session && !profileReady)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking session...</p>
      </div>
    );
  }

  if (!session) {
    // Login sends the user back here afterwards.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowIncompleteProfile && (!onboardingComplete || !userRole)) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  if (role && userRole !== role) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ notice: role === 'athlete' ? 'Only athletes can open that page.' : 'Only donors can open that page.' }}
      />
    );
  }

  return children;
};
