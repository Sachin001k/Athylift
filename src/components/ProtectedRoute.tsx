import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  children: JSX.Element;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // The session is checked once for the whole app, so moving between pages doesn't blank the screen.
  const { session, loading: checking } = useAuth();
  const location = useLocation();

  if (checking) {
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

  return children;
};
