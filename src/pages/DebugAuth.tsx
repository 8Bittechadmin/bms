import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/hooks/useAuth';

const DebugAuth = () => {
  const [staffData, setStaffData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, roleMeta, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchStaffRole = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('name', 'Staff')
        .single();

      console.log('=== DEBUG AUTH ===');
      console.log('Current User:', currentUser);
      console.log('Auth Loading:', authLoading);
      console.log('Role Meta:', roleMeta);
      console.log('Staff Role from DB:', { data, error });
      console.log('Staff accessible_pages type:', typeof data?.accessible_pages);
      console.log('Staff accessible_pages value:', data?.accessible_pages);
      console.log('localStorage.currentUser:', localStorage.getItem('currentUser'));
      console.log('sessionStorage.roleMeta:Staff:', sessionStorage.getItem('roleMeta:Staff'));

      setStaffData({ data, error });
      setLoading(false);
    };

    fetchStaffRole();
  }, []);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Debug Auth Info</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Current User</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(currentUser, null, 2)}</pre>
        </div>

        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Role Meta</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(roleMeta, null, 2)}</pre>
        </div>

        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Staff Role from Database</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <pre className="text-sm overflow-auto">{JSON.stringify(staffData?.data, null, 2)}</pre>
          )}
          {staffData?.error && (
            <pre className="text-sm text-red-600">{JSON.stringify(staffData.error, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
