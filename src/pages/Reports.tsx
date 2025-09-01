
import React from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileSpreadsheet, Calendar, RefreshCw } from 'lucide-react';

const Reports: React.FC = () => {
  // Mock data for revenue chart
  const revenueData = [
    { month: 'Jan', revenue: 38000 },
    { month: 'Feb', revenue: 42000 },
    { month: 'Mar', revenue: 55000 },
    { month: 'Apr', revenue: 48000 },
    { month: 'May', revenue: 62000 },
    { month: 'Jun', revenue: 78000 },
    { month: 'Jul', revenue: 72000 },
    { month: 'Aug', revenue: 85000 },
    { month: 'Sep', revenue: 68000 },
    { month: 'Oct', revenue: 75000 },
    { month: 'Nov', revenue: 82000 },
    { month: 'Dec', revenue: 91000 }
  ];
  
  // Mock data for event type distribution
  const eventTypeData = [
    { name: 'Wedding', value: 35 },
    { name: 'Corporate', value: 25 },
    { name: 'Social', value: 20 },
    { name: 'Conference', value: 15 },
    { name: 'Other', value: 5 }
  ];
  
  // Mock data for venue utilization
  const venueData = [
    { name: 'Grand Ballroom', bookings: 24 },
    { name: 'Garden Pavilion', bookings: 18 },
    { name: 'Conference Hall A', bookings: 15 },
    { name: 'Terrace Hall', bookings: 12 },
    { name: 'Lakeside Room', bookings: 10 }
  ];
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <AppLayout>
      <PageHeader 
        title="Reports & Analysis" 
        description="Review performance metrics and analytics"
      />
      
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-x-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">This Month</span>
          </Button>
          <Button variant="outline" size="sm">Q2 2025</Button>
          <Button variant="outline" size="sm">2025</Button>
          <Button variant="outline" size="sm">Custom</Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="financial" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecasting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial" className="space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$795,000</div>
                <p className="text-xs text-muted-foreground mt-1">YTD, +12.5% from last year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Event Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,450</div>
                <p className="text-xs text-muted-foreground mt-1">+5.2% from last year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28.4%</div>
                <p className="text-xs text-muted-foreground mt-1">+1.8% from last year</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Year-to-date financial performance</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="justify-between text-xs text-muted-foreground">
              <div>Updated: April 5, 2025</div>
              <div>Source: Financial Management System</div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Breakdown of income sources</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-gray-500">
                    <h3 className="font-medium mb-2">Revenue Category Chart</h3>
                    <p className="text-sm">This would show revenue breakdown by category</p>
                    <p className="text-sm">(Venue rental, catering, services, etc.)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Expense Analysis</CardTitle>
                <CardDescription>Major cost centers</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-gray-500">
                    <h3 className="font-medium mb-2">Expense Analysis Chart</h3>
                    <p className="text-sm">This would show expense breakdown by category</p>
                    <p className="text-sm">(Staff, food cost, supplies, etc.)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="operational" className="space-y-6 m-0">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Event Type Distribution</CardTitle>
                <CardDescription>Breakdown of events by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Venue Utilization</CardTitle>
                <CardDescription>Bookings by venue</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={venueData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <RechartsTooltip />
                    <Bar dataKey="bookings" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Operational Efficiency</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">Staff Efficiency</h3>
                  <div className="text-2xl font-bold mb-1">96%</div>
                  <div className="text-xs text-green-600 font-medium">↑ 2.5% from last quarter</div>
                  <p className="text-xs text-muted-foreground mt-2">Based on staff-to-guest ratio and service quality ratings</p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">Venue Turnover Time</h3>
                  <div className="text-2xl font-bold mb-1">1.8 hrs</div>
                  <div className="text-xs text-green-600 font-medium">↑ Improved by 0.3 hrs</div>
                  <p className="text-xs text-muted-foreground mt-2">Average time between events for cleanup and setup</p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">Resource Utilization</h3>
                  <div className="text-2xl font-bold mb-1">87%</div>
                  <div className="text-xs text-yellow-600 font-medium">↓ 1.2% from last quarter</div>
                  <p className="text-xs text-muted-foreground mt-2">Efficiency of inventory and supplies usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6 m-0">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Booking Trends</CardTitle>
              <CardDescription>Event distribution throughout the year</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-gray-500">
                  <h3 className="font-medium mb-2">Seasonal Distribution Chart</h3>
                  <p className="text-sm">This would show booking patterns by season</p>
                  <p className="text-sm">(A heat map or line chart showing peak seasons)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Feedback trends and ratings</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-gray-500">
                    <h3 className="font-medium mb-2">Satisfaction Ratings Chart</h3>
                    <p className="text-sm">This would show client satisfaction trends over time</p>
                    <p className="text-sm">(Based on post-event surveys and feedback)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Industry and local market analysis</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-gray-500">
                    <h3 className="font-medium mb-2">Market Analysis Chart</h3>
                    <p className="text-sm">This would show competitive analysis and market trends</p>
                    <p className="text-sm">(Comparing performance against industry benchmarks)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Growth Forecasting</CardTitle>
              <CardDescription>Projected performance for upcoming quarters</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-gray-500">
                  <h3 className="font-medium mb-2">Growth Projection Chart</h3>
                  <p className="text-sm">This would show forecasted revenue and bookings</p>
                  <p className="text-sm">(Based on historical data and current trends)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Reports;
