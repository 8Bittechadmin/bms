
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/AuthLayout';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

const LoginAdmin = () => {
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

        toast({
          title: 'Login successful',
          description: `Welcome back, ${data.username}!`,
        });
        navigate('/dashboard');
      } catch (err: any) {
        console.error('[LoginAdmin] Error:', err);
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
      title="Admin Login"
      subtitle="Access your admin dashboard to manage all aspects of the banquet system."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="john_smith"
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
          <Link to="/login-staff" className="text-cyan-600 hover:text-cyan-500">
            Switch to staff login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginAdmin;
