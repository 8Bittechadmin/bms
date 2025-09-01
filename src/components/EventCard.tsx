
import React from 'react';
import { format } from 'date-fns';
import { CalendarRange, Clock, Users, MapPin, Check } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import EventStatusBadge from './EventStatusBadge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface DashboardEventProps {
  id?: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  clientName?: string;
  eventType?: string;
  status?: string;
  guestCount?: number;
  key?: string;
}

interface EventCardProps {
  event?: any;
  onClick?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  // Dashboard specific props
  id?: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  clientName?: string;
  eventType?: string;
  status?: string;
  guestCount?: number;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onClick,
  isSelectable = false,
  isSelected = false,
  onSelect,
  // Dashboard specific props
  id,
  title,
  date,
  time,
  venue,
  clientName,
  eventType,
  status,
  guestCount
}) => {
  // Determine if we're using dashboard or event-style props
  const isDashboardStyle = !event && id !== undefined;
  
  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'h:mm a');
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectable) {
      e.stopPropagation();
      onSelect && onSelect();
    } else if (onClick) {
      onClick();
    }
  };
  
  // Get client information (either from client or wedding_bookings)
  const getClientName = () => {
    if (isDashboardStyle) {
      return clientName || 'No client';
    }
    
    if (event.client?.name) {
      return event.client.name;
    } else if (event.wedding_bookings && event.wedding_bookings.length > 0) {
      return event.wedding_bookings[0].client_name;
    }
    return 'No client';
  };
  
  const isPastEvent = isDashboardStyle 
    ? (date ? new Date(date) < new Date() : false) 
    : new Date(event.start_date) < new Date();
  
  // For wedding events, determine if full day or half day
  const isWedding = isDashboardStyle 
    ? eventType === 'wedding' 
    : event.event_type === 'wedding';
    
  const weddingInfo = !isDashboardStyle && isWedding && event.wedding_bookings && event.wedding_bookings.length > 0
    ? event.wedding_bookings[0]
    : null;
  const isFullDay = weddingInfo ? weddingInfo.is_full_day : true;
  
  // Get time slot info for half-day weddings
  const getTimeSlotInfo = () => {
    if (!isWedding || isFullDay) return null;
    
    if (isDashboardStyle && time) {
      if (time.toLowerCase().includes('morning')) {
        return 'Morning (8AM-2PM)';
      } else if (time.toLowerCase().includes('evening')) {
        return 'Evening (3PM-9PM)';
      }
      return null;
    }
    
    const startHour = new Date(event.start_date).getHours();
    if (startHour < 12) {
      return 'Morning (8AM-2PM)';
    } else {
      return 'Evening (3PM-9PM)';
    }
  };
  
  const timeSlotInfo = getTimeSlotInfo();

  // Get event name/title
  const eventName = isDashboardStyle ? title : event.event_name;
  
  // Get event status
  const eventStatus = isDashboardStyle ? status : event.status;

  // Get guest count
  const eventGuestCount = isDashboardStyle ? guestCount : event.guest_count;
  
  // Get event type
  const displayEventType = isDashboardStyle ? eventType : event.event_type;

  // Get the event ID for navigation
  const eventId = isDashboardStyle ? id : event.id;

  return (
    <Card 
      className={cn(
        "h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer", 
        isSelected && "ring-2 ring-primary",
        isPastEvent && "opacity-75"
      )}
      onClick={handleCardClick}
    >
      {isSelectable && (
        <div className="absolute top-2 right-2 z-10">
          <div className={cn(
            "h-6 w-6 rounded-full border-2",
            isSelected 
              ? "bg-primary border-primary text-white flex items-center justify-center" 
              : "border-gray-300 bg-white"
          )}>
            {isSelected && <Check className="h-4 w-4" />}
          </div>
        </div>
      )}
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="font-semibold text-base">{eventName}</CardTitle>
            <div className="text-xs text-muted-foreground">
              <span className="capitalize">{displayEventType}</span>
              {isWedding && (
                <span> • {isFullDay ? 'Full Day' : 'Half Day'}</span>
              )}
            </div>
          </div>
          <EventStatusBadge status={eventStatus} />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 pb-0 space-y-3">
        <div className="flex items-start gap-2">
          <CalendarRange className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            {isDashboardStyle ? (
              <div>{date || 'No date'}</div>
            ) : (
              <div>{formatDateOnly(event.start_date)}</div>
            )}
            <div className="text-xs text-muted-foreground">
              {isDashboardStyle ? (
                <>{time || 'No time'}</>
              ) : (
                <>{formatTime(event.start_date)} - {event.end_date ? formatTime(event.end_date) : 'End time not set'}</>
              )}
              
              {timeSlotInfo && (
                <div className="text-xs text-primary font-medium mt-0.5">{timeSlotInfo}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Venue information */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            {isDashboardStyle ? venue : (event.venue ? event.venue.name : 'No venue')}
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Users className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm flex-grow flex justify-between">
            <span>{getClientName()}</span>
            <span>{eventGuestCount} guests</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-3">
        {!isSelectable && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={(e) => {
              e.stopPropagation();
              if (eventId) {
                window.location.href = `/bookings/${eventId}`;
              }
            }}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
