
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, AlertTriangle, Archive, Package, Edit, Trash, X, Check } from 'lucide-react';
import AddInventoryItemModal from '@/components/Inventory/AddInventoryItemModal';
import InventoryItemModal from '@/components/Inventory/InventoryItemModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import DeleteConfirmDialog from '@/components/Common/DeleteConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Inventory: React.FC = () => {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    status: 'all',
    category: 'all',
    sortBy: 'name'
  });
  
  const queryClient = useQueryClient();
  
  const { data: inventoryItems, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
  
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Item Deleted',
        description: 'The inventory item has been removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item',
        variant: 'destructive',
      });
    }
  });
  
  // Categories for quick filtering
  const categories = [
    { name: 'All', value: 'all' },
    { name: 'Furniture', value: 'furniture' },
    { name: 'Linens', value: 'linens' },
    { name: 'AV Equipment', value: 'av-equipment' },
    { name: 'Tableware', value: 'tableware' },
    { name: 'Decor', value: 'decor' }
  ];
  
  // Status options for filtering
  const statusOptions = [
    { name: 'All', value: 'all' },
    { name: 'In Stock', value: 'in-stock' },
    { name: 'Low Stock', value: 'low' },
    { name: 'Out of Stock', value: 'out' },
    { name: 'On Order', value: 'on-order' }
  ];
  
  // Sort options
  const sortOptions = [
    { name: 'Name (A-Z)', value: 'name' },
    { name: 'Name (Z-A)', value: 'name-desc' },
    { name: 'Quantity (High-Low)', value: 'quantity-desc' },
    { name: 'Quantity (Low-High)', value: 'quantity' },
    { name: 'Recently Added', value: 'created_at-desc' }
  ];
  
  // Filter items based on criteria
  const filteredItems = (inventoryItems || []).filter(item => {
    // Filter by tab category
    const matchesTabCategory = activeCategory === 'all' || item.category === activeCategory;
    
    // Filter by dropdown status filter
    const matchesStatus = 
      filterOptions.status === 'all' || 
      item.status === filterOptions.status;
    
    // Filter by dropdown category filter
    const matchesCategory = 
      filterOptions.category === 'all' || 
      item.category === filterOptions.category;
    
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTabCategory && matchesStatus && matchesCategory && matchesSearch;
  });
  
  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    const [field, direction] = filterOptions.sortBy.split('-');
    
    if (field === 'name') {
      return direction === 'desc' 
        ? b.name.localeCompare(a.name) 
        : a.name.localeCompare(b.name);
    }
    
    if (field === 'quantity') {
      return direction === 'desc' 
        ? b.quantity - a.quantity 
        : a.quantity - b.quantity;
    }
    
    if (field === 'created_at') {
      return direction === 'desc' 
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    
    return 0;
  });
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'in-stock': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'out': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'on-order': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'in-stock': return 'In Stock';
      case 'low': return 'Low Stock';
      case 'out': return 'Out of Stock';
      case 'on-order': return 'On Order';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteItem = (item: any) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedItem) {
      deleteItemMutation.mutate(selectedItem.id);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const applyFilter = () => {
    setFilterOpen(false);
  };
  
  const resetFilter = () => {
    setFilterOptions({
      status: 'all',
      category: 'all',
      sortBy: 'name'
    });
    setFilterOpen(false);
  };
  
  // Calculate statistics
  const totalItems = inventoryItems?.length || 0;
  const itemsInStock = inventoryItems?.filter(item => item.status === 'in-stock').length || 0;
  const lowStockAlerts = inventoryItems?.filter(item => item.status === 'low').length || 0;
  const outOfStock = inventoryItems?.filter(item => item.status === 'out').length || 0;
  
  return (
    <AppLayout>
      <PageHeader 
        title="Inventory Management" 
        description="Track and manage your event inventory"
        action={{
          label: "Add Item",
          icon: <Plus size={16} />,
          onClick: () => setIsAddItemModalOpen(true)
        }}
      />
      
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">{categories.length - 1} categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Items In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{itemsInStock}</div>
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
                <Package className="h-3 w-3 mr-1" /> Available
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{Math.round((itemsInStock / totalItems) * 100) || 0}% of inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{lowStockAlerts}</div>
              <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-600 border-yellow-200">
                <AlertTriangle className="h-3 w-3 mr-1" /> Attention Needed
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Items need restock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{outOfStock}</div>
              <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border-red-200">
                <Archive className="h-3 w-3 mr-1" /> Order Required
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Items unavailable</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-4">
            {categories.map(category => (
              <TabsTrigger 
                key={category.value} 
                value={category.value}
                className="rounded-full px-3 py-1 text-xs h-auto data-[state=active]:shadow-none"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search inventory..." 
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-4" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Status</h4>
                    <select
                      className="w-full text-sm p-2 border border-input rounded-md"
                      value={filterOptions.status}
                      onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value})}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Category</h4>
                    <select
                      className="w-full text-sm p-2 border border-input rounded-md"
                      value={filterOptions.category}
                      onChange={(e) => setFilterOptions({...filterOptions, category: e.target.value})}
                    >
                      {categories.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Sort By</h4>
                    <select
                      className="w-full text-sm p-2 border border-input rounded-md"
                      value={filterOptions.sortBy}
                      onChange={(e) => setFilterOptions({...filterOptions, sortBy: e.target.value})}
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={resetFilter}>Reset</Button>
                    <Button size="sm" onClick={applyFilter} className="flex items-center gap-1">
                      <Check className="h-4 w-4" /> Apply
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <TabsContent value={activeCategory} className="m-0">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading inventory items...</div>
                ) : sortedItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery ? "No items match your search criteria." : "No inventory items found."}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="hidden lg:table-cell">Unit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedItems.map(item => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{item.id.substring(0, 8)}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{item.category}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="hidden lg:table-cell">{item.unit || '-'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusLabel(item.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteItem(item)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <AddInventoryItemModal
        open={isAddItemModalOpen}
        onOpenChange={setIsAddItemModalOpen}
      />
      
      {selectedItem && (
        <>
          <InventoryItemModal
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            item={selectedItem}
          />
          
          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={confirmDelete}
            isDeleting={deleteItemMutation.isPending}
            title={`Delete ${selectedItem.name}?`}
            description="This will permanently remove this item from your inventory."
          />
        </>
      )}
    </AppLayout>
  );
};

export default Inventory;
