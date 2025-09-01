
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/AuthLayout';

const LoginStaff = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // This would typically validate credentials against a backend
    // For now, we'll just simulate a successful login
    toast({
      title: "Login successful",
      description: "Welcome to the staff dashboard.",
    });
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      title="Staff Login"
      subtitle="Access your staff portal to manage events and tasks."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="staff@example.com" required />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-sm font-medium text-cyan-600 hover:text-cyan-500">
              Forgot password?
            </a>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        
        <div>
          <Button type="submit" className="w-full">
            Sign in
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
