// Quick debug script to check Staff role data in Supabase
// Run this in browser console or add to a page temporarily

import { supabase } from './src/integrations/supabase/client';

export async function debugStaffRole() {
  console.log('=== Checking Staff Role Data ===');
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('name, permissions, accessible_pages')
    .eq('name', 'Staff')
    .single();

  if (error) {
    console.error('Error fetching Staff role:', error);
    return;
  }

  console.log('Staff role data:', {
    name: data?.name,
    permissions: data?.permissions,
    accessible_pages: data?.accessible_pages,
    accessible_pages_type: typeof data?.accessible_pages,
    accessible_pages_isArray: Array.isArray(data?.accessible_pages),
  });

  // Also check all roles
  const { data: allRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('name, accessible_pages');

  console.log('All roles in database:', allRoles);
}

// Call it: debugStaffRole()
