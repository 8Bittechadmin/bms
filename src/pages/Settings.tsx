
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings as SettingsIcon, Users, Shield, Bell, Database } from 'lucide-react';

// Define local interfaces instead of importing from client
interface SystemSettings {
  id: string;
  category: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  name: string;
  permissions: any;
  accessible_pages: string[];
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  username: string;
  role: string;
  password: string;
  created_at: string;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const { data: systemSettings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;
      return data as SystemSettings[];
    }
  });

  const { data: userRoles } = useQuery({
    queryKey: ['userRoles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      
      if (error) throw error;
      return data as UserRole[];
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      return data as User[];
    }
  });

  const handleSaveSettings = async () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleCreateRole = async () => {
    toast({
      title: "Feature Coming Soon",
      description: "Role creation functionality will be available soon.",
    });
  };

  const handleCreateUser = async () => {
    toast({
      title: "Feature Coming Soon",
      description: "User creation functionality will be available soon.",
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Settings" 
        description="Manage system settings and configuration"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon size={16} />
            General
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield size={16} />
            Roles
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database size={16} />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" placeholder="Event Management Co." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Company Email</Label>
                  <Input id="company-email" type="email" placeholder="info@company.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-address">Company Address</Label>
                <Input id="company-address" placeholder="123 Business St, City, State 12345" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="maintenance-mode" />
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              </div>
              
              <Button onClick={handleSaveSettings} className="w-full">
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Button onClick={handleCreateUser}>
                <Users size={16} className="mr-2" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Role Management</CardTitle>
              <Button onClick={handleCreateRole}>
                <Shield size={16} className="mr-2" />
                Add Role
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRoles?.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role.permissions ? Object.keys(role.permissions).length : 0} permissions
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role.accessible_pages?.length || 0} pages
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="email-notifications" defaultChecked />
                <Label htmlFor="email-notifications">Email Notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="booking-alerts" defaultChecked />
                <Label htmlFor="booking-alerts">Booking Alerts</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="payment-notifications" defaultChecked />
                <Label htmlFor="payment-notifications">Payment Notifications</Label>
              </div>
              
              <Button onClick={handleSaveSettings} className="w-full">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">Export All Data</Button>
                <Button variant="outline">Import Data</Button>
              </div>
              
              <div className="space-y-2">
                <Label>Database Backup</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Create Backup</Button>
                  <Button variant="outline" className="flex-1">Restore Backup</Button>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Data operations are irreversible. Please ensure you have proper backups before proceeding.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default SettingsPage;
