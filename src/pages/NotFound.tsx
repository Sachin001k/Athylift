import { Link, useLocation } from 'react-router-dom';
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="flex items-center justify-center p-12">
        <div className="text-center card bg-base-100 shadow-lg p-8">
          <h1 className="mb-4 text-4xl font-brand tracking-wide text-primary">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
