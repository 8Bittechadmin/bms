
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Save, X, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  due_date?: string;
  booking_id: string;
  isNew?: boolean;
  isEditing?: boolean;
}

interface EventTaskListProps {
  bookingId: string;
  existingTasks?: Task[];
}

const EventTaskList: React.FC<EventTaskListProps> = ({ bookingId, existingTasks = [] }) => {
  const [tasks, setTasks] = useState<Task[]>(existingTasks);
  const [bulkTaskInput, setBulkTaskInput] = useState('');
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (existingTasks.length > 0) {
      setTasks(existingTasks);
    }
  }, [existingTasks]);

  const saveMutation = useMutation({
    mutationFn: async (task: Task) => {
      if (task.isNew) {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title: task.title,
            booking_id: bookingId,
            status: 'pending',
          })
          .select();

        if (error) throw error;
        return data;
      } else {
        // Update existing task
        const { data, error } = await supabase
          .from('tasks')
          .update({
            title: task.title,
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id)
          .select();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: "Task Saved",
        description: "The task has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['eventTasks', bookingId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to save task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Task Deleted",
        description: "The task has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['eventTasks', bookingId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: 'pending' | 'completed' }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTasks', bookingId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update task status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        id: `new-${Date.now()}`,
        title: '',
        status: 'pending',
        booking_id: bookingId,
        isNew: true,
        isEditing: true,
      },
    ]);
  };

  const handleBulkAddTasks = () => {
    if (!bulkTaskInput.trim()) return;

    // Split by dot and create new task for each non-empty line
    const newTaskTitles = bulkTaskInput
      .split('.')
      .map(t => t.trim())
      .filter(t => t);

    const newTasks = newTaskTitles.map((title) => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title,
      status: 'pending' as const,
      booking_id: bookingId,
      isNew: true,
    }));

    // Add all new tasks to the database
    const bulkInsertMutation = async () => {
      try {
        const { error } = await supabase
          .from('tasks')
          .insert(
            newTasks.map(task => ({
              title: task.title,
              booking_id: bookingId,
              status: 'pending',
            }))
          );

        if (error) throw error;

        toast({
          title: "Tasks Added",
          description: `${newTasks.length} tasks have been added successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: ['eventTasks', bookingId] });
        setBulkTaskInput('');
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to add tasks: ${error.message}`,
          variant: "destructive",
        });
      }
    };

    bulkInsertMutation();
  };

  const handleEditTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, isEditing: true } : task
      )
    );
  };

  const handleSaveTask = (task: Task) => {
    saveMutation.mutate(task);
    setTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...task, isEditing: false, isNew: false } : t
      )
    );
  };

  const handleCancelEdit = (taskId: string) => {
    setTasks(
      tasks.filter((task) => !(task.id === taskId && task.isNew)).map((task) =>
        task.id === taskId ? { ...task, isEditing: false } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    // For new unsaved tasks, just remove from state
    if (taskId.startsWith('new-')) {
      setTasks(tasks.filter((task) => task.id !== taskId));
      return;
    }

    // For existing tasks, delete from database
    deleteMutation.mutate(taskId);
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    // Optimistically update UI
    setTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, status: newStatus } : t
      )
    );
    
    // If it's a newly added task that hasn't been saved yet, don't call API
    if (!task.id.startsWith('new-')) {
      toggleStatus.mutate({ taskId: task.id, status: newStatus });
    }
  };

  const handleUpdateTaskTitle = (taskId: string, title: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, title } : task
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Quick Add Tasks</label>
        <div className="flex items-start space-x-2">
          <div className="flex-grow">
            <textarea
              placeholder="Enter tasks separated by dots (e.g. 'Call the client. Order flowers. Confirm menu.')"
              value={bulkTaskInput}
              onChange={(e) => setBulkTaskInput(e.target.value)}
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button onClick={handleBulkAddTasks} disabled={!bulkTaskInput.trim()}>
            Add Tasks
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Task List</h3>
        <Button onClick={handleAddTask} size="sm">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      {tasks.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Task</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className={task.status === 'completed' ? 'bg-gray-50' : ''}>
                  <TableCell>
                    <div 
                      className={`cursor-pointer w-6 h-6 rounded-md border flex items-center justify-center
                        ${task.status === 'completed' 
                          ? 'bg-green-100 border-green-300 text-green-600' 
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}
                      onClick={() => handleToggleStatus(task)}
                    >
                      {task.status === 'completed' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                    {task.isEditing ? (
                      <Input
                        value={task.title}
                        onChange={(e) => handleUpdateTaskTitle(task.id, e.target.value)}
                        className="w-full"
                        autoFocus
                      />
                    ) : (
                      task.title
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {task.isEditing ? (
                      <div className="flex justify-end space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCancelEdit(task.id)}
                          className="h-7 w-7"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveTask(task)}
                          className="h-7 w-7"
                          disabled={!task.title.trim()}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditTask(task.id)}
                          className="h-7 w-7 text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-7 w-7 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 border rounded-md">
          <p className="text-muted-foreground">No tasks created yet</p>
          <Button onClick={handleAddTask} variant="outline" size="sm" className="mt-2">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add First Task
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventTaskList;
