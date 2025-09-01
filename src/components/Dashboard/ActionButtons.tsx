
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CalendarPlus, Calendar, Package } from 'lucide-react';

interface ActionButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  to?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  variant = "outline", 
  label, 
  icon, 
  onClick,
  to 
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (onClick) {
      onClick();
    }
  };
  
  return (
    <Button 
      variant={variant} 
      onClick={handleClick} 
      className="w-full"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </Button>
  );
};

export const ViewCalendarButton = () => {
  return (
    <ActionButton
      label="View Full Calendar"
      icon={<Calendar size={16} />}
      to="/bookings?view=calendar"
    />
  );
};

export const CheckAvailabilityButton = () => {
  return (
    <ActionButton
      label="Check Availability"
      icon={<Calendar size={16} />}
      to="/venues?action=check-availability"
    />
  );
};

export const AddNewBookingButton = () => {
  return (
    <ActionButton
      variant="default"
      label="Add New Booking"
      icon={<CalendarPlus size={16} />}
      to="/bookings/new"
    />
  );
};

export const AddTaskButton = () => {
  const handleAddTask = () => {
    // This would open the task creation modal
    document.getElementById('open-task-modal-btn')?.click();
  };
  
  return (
    <ActionButton
      label="Add Task"
      icon={<Package size={16} />}
      onClick={handleAddTask}
    />
  );
};
