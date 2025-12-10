
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/AuthLayout';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

const LoginStaff = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, role, password')
          .eq('username', username)
          .eq('password', password)
          .single();

        if (error || !data) {
          toast({
            title: 'Login failed',
            description: 'Invalid username or password.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        localStorage.setItem('currentUser', JSON.stringify({
          id: data.id,
          username: data.username,
          role: data.role,
        }));

        // Determine first allowed page for this role and navigate there.
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('accessible_pages')
            .ilike('name', data.role)
            .single();

          let target = '/dashboard';
          if (!roleError && roleData) {
            const pages = Array.isArray(roleData.accessible_pages)
              ? roleData.accessible_pages
              : (typeof roleData.accessible_pages === 'string'
                ? roleData.accessible_pages.split(',').map((s: string) => s.trim()).filter(Boolean)
                : []);

            if (pages.length > 0) {
              // map page keys to routes
              const map: Record<string, string> = {
                dashboard: '/dashboard',
                bookings: '/bookings',
                inventory: '/inventory',
                venues: '/venues',
                event_planning: '/event-planning',
                catering: '/catering',
                staff: '/staff',
                billing: '/billing',
                clients: '/clients',
                reports: '/reports',
                settings: '/settings',
              };

              const first = pages[0];
              target = map[first] ?? '/dashboard';
            }
          }

          toast({
            title: 'Login successful',
            description: `Welcome back, ${data.username}!`,
          });
          navigate(target);
        } catch (err) {
          console.error('[LoginStaff] role lookup error', err);
          toast({
            title: 'Login successful',
            description: `Welcome back, ${data.username}!`,
          });
          navigate('/dashboard');
        }
      } catch (err: any) {
        console.error('[LoginStaff] Error:', err);
        toast({
          title: 'Error',
          description: 'An error occurred during login. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    <AuthLayout
      title="Staff Login"
      subtitle="Access your staff portal to manage events and tasks."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="jane_doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-sm font-medium text-cyan-600 hover:text-cyan-500">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
        
        <div className="text-center text-sm">
          <Link to="/login-admin" className="text-cyan-600 hover:text-cyan-500">
            Switch to admin login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginStaff;
