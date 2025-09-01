
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter, Mail, Phone, Building, Calendar } from 'lucide-react';
import ClientModal from '@/components/Clients/ClientModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ClientManagement: React.FC = () => {
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch clients from Supabase
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Filter clients based on search query and active tab
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      searchQuery === '' || 
      client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      client.client_type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Get client statistics
  const clientStats = {
    total: clients.length,
    // Assume all clients are active since there is no status field
    active: clients.length,
    newThisMonth: clients.filter(c => {
      const createdAt = new Date(c.created_at || '');
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && 
             createdAt.getFullYear() === now.getFullYear();
    }).length,
    avgEvents: 0 // Would require joining with events table
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'individual': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'corporate': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'non-profit': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'government': return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  return (
    <AppLayout>
      <PageHeader 
        title="Client Management" 
        description="Manage and view all your clients"
        action={{
          label: "Add Client",
          icon: <Plus size={16} />,
          onClick: () => setIsAddClientModalOpen(true)
        }}
      />
      
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clientStats.total > 0 
                ? `${Math.round((clientStats.active / clientStats.total) * 100)}% of total clients` 
                : 'No clients yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clientStats.newThisMonth > 0 ? '+' + clientStats.newThisMonth + ' from last month' : 'No new clients this month'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Events per Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.avgEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on active clients</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="corporate">Corporate</TabsTrigger>
          <TabsTrigger value="non-profit">Non-Profit</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search clients..." 
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex gap-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Client Directory</CardTitle>
            <CardDescription>View and manage your clients</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading clients...</p>
              </div>
            ) : filteredClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="hidden xl:table-cell">Phone</TableHead>
                    <TableHead className="hidden sm:table-cell">Events</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">{client.id.substring(0, 6)}</TableCell>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(client.client_type || 'individual')}>
                          {(client.client_type || 'Individual').charAt(0).toUpperCase() + (client.client_type || 'individual').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{client.name}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {client.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span>{client.email}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span>0</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* Since there's no status field, we'll display "Active" as default */}
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No clients found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsAddClientModalOpen(true)}
                >
                  Add Client
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
      
      <ClientModal
        open={isAddClientModalOpen}
        onOpenChange={setIsAddClientModalOpen}
      />
    </AppLayout>
  );
};

export default ClientManagement;
