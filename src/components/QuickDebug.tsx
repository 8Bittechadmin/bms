import React, { useEffect } from 'react';
import useAuth from '@/hooks/useAuth';

const QuickDebug = () => {
  const { currentUser, roleMeta, loading } = useAuth();

  useEffect(() => {
    console.log('=== QUICK DEBUG ===');
    console.log('currentUser:', currentUser);
    console.log('currentUser?.role:', currentUser?.role);
    console.log('loading:', loading);
    console.log('roleMeta:', roleMeta);
    console.log('localStorage.currentUser:', localStorage.getItem('currentUser'));
  }, [currentUser, roleMeta, loading]);

  return (
    <div className="p-8 bg-yellow-50 border-2 border-yellow-400 rounded m-4">
      <h2 className="text-xl font-bold mb-4">Auth Debug</h2>
      <ul className="space-y-2 text-sm">
        <li><strong>User:</strong> {currentUser?.username} ({currentUser?.role})</li>
        <li><strong>Loading:</strong> {loading ? 'yes' : 'no'}</li>
        <li><strong>Role Meta:</strong> {roleMeta ? 'loaded' : 'null'}</li>
        <li><strong>Accessible Pages:</strong> {JSON.stringify(roleMeta?.accessible_pages)}</li>
        <li><code className="text-xs bg-white p-1">localStorage.currentUser: {localStorage.getItem('currentUser')}</code></li>
      </ul>
    </div>
  );
};

export default QuickDebug;
