import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, FileText, Download, Plus, Filter, DollarSign, ArrowUpRight, CreditCard, AlertCircle, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CreateInvoiceModal from '@/components/Billing/CreateInvoiceModal';
import EditInvoiceModal from '@/components/Billing/EditInvoiceModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Billing: React.FC = () => {
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isEditInvoiceModalOpen, setIsEditInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch invoices from database
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          bookings:booking_id (
            event_name,
            client_id
          )
        `)
        .order('due_date', { ascending: true });
      
      if (error) throw error;

      // Process data to handle clients properly
      return data?.map(invoice => ({
        ...invoice,
        bookings: invoice.bookings ? {
          ...invoice.bookings,
          clients: { name: "Client" } // Default client name when relation fails
        } : null
      })) || [];
    },
  });
  
  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.bookings?.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.bookings?.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Mock payment methods
  const paymentMethods = [
    { name: 'Credit Card (Stripe)', isDefault: true },
    { name: 'Bank Transfer', isDefault: false },
    { name: 'PayPal', isDefault: false }
  ];
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsEditInvoiceModalOpen(true);
  };
  
  // Calculate statistics
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  
  const outstandingBalance = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue').length;
  
  return (
    <AppLayout>
      <PageHeader 
        title="Billing & Payments" 
        description="Manage invoices, payments and financial records"
        action={{
          label: "New Invoice",
          icon: <FileText size={16} />,
          onClick: () => setIsCreateInvoiceModalOpen(true)
        }}
      />
      
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${outstandingBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {pendingInvoices} invoice{pendingInvoices !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(outstandingBalance * 0.85).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated collections</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="invoices" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="settings">Payment Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-4 m-0">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search invoices..." 
                className="w-full pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Loading invoices...</p>
                </div>
              ) : filteredInvoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead className="hidden md:table-cell">Client</TableHead>
                      <TableHead className="hidden lg:table-cell">Event</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell className="hidden md:table-cell">{invoice.bookings?.clients?.name || 'No client'}</TableCell>
                        <TableCell className="hidden lg:table-cell">{invoice.bookings?.event_name || 'No event'}</TableCell>
                        <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>${invoice.total_amount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status || 'pending')}>
                            {getStatusLabel(invoice.status || 'pending')}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditInvoice(invoice)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p>No invoices found.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setIsCreateInvoiceModalOpen(true)}
                  >
                    Create Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-6 m-0">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Transactions from the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.filter(inv => inv.status === 'paid').slice(0, 5).map((payment, index) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{payment.bookings?.clients?.name || 'No client'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.issue_date || '').toLocaleDateString()} • {payment.invoice_number}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">${payment.total_amount?.toLocaleString()}</span>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                  ))}

                  {invoices.filter(inv => inv.status === 'paid').length === 0 && (
                    <div className="text-center py-8">
                      <p>No payments recorded yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Transactions</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Reminders</CardTitle>
                <CardDescription>Outstanding and upcoming payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices
                    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
                    .slice(0, 5)
                    .map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between py-2 border-b last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{reminder.bookings?.clients?.name || 'No client'}</p>
                          {reminder.status === 'overdue' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reminder.due_date).toLocaleDateString()} • {reminder.invoice_number}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold">${reminder.total_amount?.toLocaleString()}</span>
                        <Badge className={getStatusColor(reminder.status || 'pending')}>
                          {getStatusLabel(reminder.status || 'pending')}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue').length === 0 && (
                    <div className="text-center py-8">
                      <p>No outstanding invoices.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button variant="outline" className="w-full">Send Reminder</Button>
                <Button className="w-full">Record Payment</Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Financial Overview</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    Monthly
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    Quarterly
                  </Button>
                  <Button size="sm" className="h-8">
                    Yearly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center text-center">
              <div className="text-gray-500">
                <ArrowUpRight className="mx-auto h-12 w-12 mb-4 text-cyan-500" />
                <h3 className="font-medium mb-2">Revenue Charts</h3>
                <p>Revenue and payment trending charts would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6 m-0">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure how you accept payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-md w-10 h-10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        {method.isDefault && (
                          <Badge variant="outline" className="mt-1">Default</Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Payment Method
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Settings</CardTitle>
                <CardDescription>Customize your invoice format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4">
                  <FileText className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <p className="mb-4">Configure your invoice templates, numbering, and branding.</p>
                  <Button variant="outline">Edit Settings</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>Configure tax rates and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4">
                  <DollarSign className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <p className="mb-4">Set up tax rates, exemptions, and reporting settings.</p>
                  <Button variant="outline">Edit Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <CreateInvoiceModal
        open={isCreateInvoiceModalOpen}
        onOpenChange={setIsCreateInvoiceModalOpen}
      />

      <EditInvoiceModal
        open={isEditInvoiceModalOpen}
        onOpenChange={setIsEditInvoiceModalOpen}
        invoice={selectedInvoice}
      />
    </AppLayout>
  );
};

export default Billing;
