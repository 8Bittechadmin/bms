import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

interface Props {
  pageKey: string;
  children: React.ReactNode;
}

const RequirePageAccess: React.FC<Props> = ({ pageKey, children }) => {
  const { currentUser, loading, hasPage, roleMeta } = useAuth();

  // If not logged in, allow (some apps may permit public routes)
  if (!currentUser) return <>{children}</>;

  // If still loading role metadata for a logged-in user, wait
  if (loading || (currentUser && !roleMeta)) {
    return null; // or a small spinner if desired
  }

  // After role metadata is loaded, check access
  if (!hasPage(pageKey)) {
    return <Navigate to="/not-found" replace />;
  }

  return <>{children}</>;
};

export default RequirePageAccess;
