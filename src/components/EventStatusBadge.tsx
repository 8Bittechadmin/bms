
import React from 'react';

type EventStatusType = 'setup' | 'ongoing' | 'completed' | 'cancelled' | 'pending';

interface EventStatusBadgeProps {
  status: EventStatusType;
  className?: string;
}

const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ status, className = '' }) => {
  const statusStyles: Record<EventStatusType, string> = {
    setup: 'bg-amber-100 text-amber-800 border-amber-200',
    ongoing: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusLabels: Record<EventStatusType, string> = {
    setup: 'Setup',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
  };

  return (
    <span 
      className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
};

export default EventStatusBadge;
