import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type RoleMeta = {
  accessible_pages?: string[];
  permissions?: Record<string, any> | null;
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
};

export default function useAuth() {
  const [currentUser, setCurrentUser] = useState<any | null>(() => getCurrentUser());
  const [roleMeta, setRoleMeta] = useState<RoleMeta | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setCurrentUser(u);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchRole = async (roleName: string) => {
      setLoading(true);
      // try cache first
      try {
        const key = `roleMeta:${roleName}`;
        const cached = sessionStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (mounted) setRoleMeta(parsed);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('permissions, accessible_pages')
          .eq('name', roleName)
          .single();

        if (error) {
          console.debug('[useAuth] role fetch error', error);
          if (mounted) setRoleMeta(null);
          setLoading(false);
          return;
        }

        // Normalize accessible_pages: DB may store as text[] or comma-separated string
        let pages: string[] = [];
        if (Array.isArray(data?.accessible_pages)) {
          pages = data.accessible_pages;
        } else if (typeof data?.accessible_pages === 'string') {
          pages = data.accessible_pages.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        const meta: RoleMeta = {
          accessible_pages: pages,
          permissions: data?.permissions ?? null,
        };

        sessionStorage.setItem(`roleMeta:${roleName}`, JSON.stringify(meta));
        if (mounted) setRoleMeta(meta);
      } catch (err) {
        console.error('[useAuth] fetchRole error', err);
        if (mounted) setRoleMeta(null);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role) {
      fetchRole(currentUser.role);
    }

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const refresh = async () => {
    const u = getCurrentUser();
    setCurrentUser(u);
    if (u?.role) {
      // clear cached role and refetch
      sessionStorage.removeItem(`roleMeta:${u.role}`);
      const { data } = await supabase
        .from('user_roles')
        .select('permissions, accessible_pages')
        .eq('name', u.role)
        .single();
      let pages: string[] = [];
      if (Array.isArray(data?.accessible_pages)) {
        pages = data.accessible_pages;
      } else if (typeof data?.accessible_pages === 'string') {
        pages = data.accessible_pages.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      const meta: RoleMeta = {
        accessible_pages: pages,
        permissions: data?.permissions ?? null,
      };
      sessionStorage.setItem(`roleMeta:${u.role}`, JSON.stringify(meta));
      setRoleMeta(meta);
    }
  };

  const hasPage = (pageKey: string) => {
    if (!currentUser) return true; // if not logged in, allow (app may have public flows)
    // admin gets full access
    if (currentUser.role && String(currentUser.role).toLowerCase() === 'admin') return true;
    if (!roleMeta) return false;
    return Array.isArray(roleMeta.accessible_pages) && roleMeta.accessible_pages.includes(pageKey);
  };

  const hasPermission = (pageKey: string, permission: string) => {
    if (!currentUser) return false;
    if (currentUser.role && String(currentUser.role).toLowerCase() === 'admin') return true;
    if (!roleMeta?.permissions) return false;
    const perms = roleMeta.permissions as Record<string, string>;
    return perms?.[pageKey] === permission || perms?.[pageKey] === 'all';
  };

  return {
    currentUser,
    roleMeta,
    loading,
    hasPage,
    hasPermission,
    refresh,
  };
}
