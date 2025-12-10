
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Database,
  Home,
  LineChart,
  LogOut,
  PackageOpen,
  Settings,
  Users,
  Utensils,
  Warehouse,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import useAuth from '@/hooks/useAuth';

interface SidebarProps {
  className?: string;
}

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPage } = useAuth();
  
  // Load sidebar state from localStorage only
  useEffect(() => {
    const localState = localStorage.getItem('sidebar:state');
    if (localState) {
      setIsCollapsed(localState === 'collapsed');
    }
  }, []);
  
  // Save sidebar state when it changes
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    // Save to localStorage
    localStorage.setItem('sidebar:state', newState ? 'collapsed' : 'expanded');
    
    // Dispatch custom event to notify AppLayout
    window.dispatchEvent(new CustomEvent('sidebar-state-changed'));
  };
  
  const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, isCollapsed, isActive }) => (
    <Link
      to={to}
      className={cn(
        'flex items-center py-3 px-4 rounded-md transition-colors duration-200',
        isActive ? 'bg-cyan-50 text-cyan-700' : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-700'
      )}
    >
      <div className="mr-3 text-lg">{icon}</div>
      {!isCollapsed && <span className="font-medium">{label}</span>}
    </Link>
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/'); // Redirect to home page
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        'bg-white border-r border-border h-screen transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed ? <Logo size="md" /> : <Logo size="md" type="icon" />}

        <button
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto py-4 px-2">
        <nav className="space-y-1">
          {hasPage('dashboard') && (
            <SidebarLink
              to="/dashboard"
              icon={<Home />}
              label="Dashboard"
              isCollapsed={isCollapsed}
              isActive={location.pathname === '/dashboard'}
            />
          )}

          {hasPage('bookings') && (
            <SidebarLink
              to="/bookings"
              icon={<Calendar />}
              label="Bookings"
              isCollapsed={isCollapsed}
              isActive={location.pathname === '/bookings'}
            />
          )}

          {hasPage('inventory') && (
            <SidebarLink
              to="/inventory"
              icon={<PackageOpen />}
              label="Inventory"
              isCollapsed={isCollapsed}
              isActive={location.pathname === '/inventory'}
            />
          )}

          {hasPage('venues') && (
            <SidebarLink
              to="/venues"
              icon={<Warehouse />}
              label="Venues"
              isCollapsed={isCollapsed}
              isActive={location.pathname === '/venues'}
            />
          )}

          {hasPage('event_planning') && (
            <SidebarLink
              to="/event-planning"
              icon={<ClipboardList />}
              label="Event Planning"
              isCollapsed={isCollapsed}
              isActive={location.pathname === '/event-planning'}
            />
          )}

          {hasPage('catering') && (
            <SidebarLink
              to="/catering"
              icon={<Utensils />}
              label="Catering"
              isCollapsed={isCollapsed}
              isActive={location.pathname === '/catering'}
            />
          )}

          {hasPage('staff') && (
            <SidebarLink
              to="/staff"
              icon={<Users />}
              label="Staff"
              isCollapsed={isCollapsed}
              isActive={location.pathname === '/staff'}
            />
          )}

          {hasPage('billing') && (
            <SidebarLink
              to="/billing"
              icon={<CreditCard />}
              label="Billing & Payments"
              isCollapsed={isCollapsed}
              isActive={location.pathname === '/billing'}
            />
          )}

          {hasPage('clients') && (
            <SidebarLink
              to="/clients"
              icon={<Database />}
              label="Client Management"
              isCollapsed={isCollapsed}
              isActive={location.pathname === '/clients'}
            />
          )}

          {hasPage('reports') && (
            <SidebarLink
              to="/reports"
              icon={<LineChart />}
              label="Reports & Analysis"
              isCollapsed={isCollapsed}
              isActive={location.pathname === '/reports'}
            />
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        {hasPage('settings') && (
          <SidebarLink
            to="/settings"
            icon={<Settings />}
            label="Settings"
            isCollapsed={isCollapsed}
            isActive={location.pathname === '/settings'}
          />
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center py-3 px-4 rounded-md transition-colors duration-200 w-full mt-2',
            'text-gray-600 hover:bg-red-50 hover:text-red-700'
          )}
        >
          <div className="mr-3 text-lg">
            <LogOut />
          </div>
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
