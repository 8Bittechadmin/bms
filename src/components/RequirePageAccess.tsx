import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

interface Props {
  pageKey: string;
  children: React.ReactNode;
}

const RequirePageAccess: React.FC<Props> = ({ pageKey, children }) => {
  const { currentUser, loading, hasPage } = useAuth();

  if (loading) return null; // or a small spinner if desired

  // if not logged in, allow (some apps may permit public routes)
  if (!currentUser) return <>{children}</>;

  if (!hasPage(pageKey)) {
    return <Navigate to="/not-found" replace />;
  }

  return <>{children}</>;
};

export default RequirePageAccess;
