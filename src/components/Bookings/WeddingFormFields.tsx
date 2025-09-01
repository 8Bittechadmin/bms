
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { InputField, RadioGroup, RadioItem } from '@/components/Common/FormFields';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { isBefore, startOfToday } from 'date-fns';

interface WeddingFormFieldsProps {
  form: UseFormReturn<any>;
  bookings?: any[];
  readOnly?: boolean;
}

const WeddingFormFields: React.FC<WeddingFormFieldsProps> = ({ form, bookings = [], readOnly = false }) => {
  const isHalfDay = !form.watch('is_full_day');
  const timeOfDay = form.watch('time_of_day') || 'morning';
  const selectedDate = form.watch('start_date')?.split('T')[0];
  
  // Check if the booking is in the past
  const startDate = form.watch('start_date');
  const isPastBooking = startDate ? isBefore(new Date(startDate), startOfToday()) : false;
  const isFormReadOnly = readOnly || isPastBooking;
  
  // Check for time slot conflicts on the selected date
  const getDisabledTimeSlots = () => {
    if (!selectedDate || !bookings?.length || isFormReadOnly) return { morning: false, evening: false };
    
    const bookingsOnDate = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_date).toISOString().split('T')[0];
      return bookingDate === selectedDate && booking.id !== form.getValues('id');
    });
    
    // If there are bookings on this date, check for conflicts
    if (bookingsOnDate.length > 0) {
      // Check if there's a full day booking
      const hasFullDayBooking = bookingsOnDate.some(booking => {
        const isWeddingBooking = booking.event_type === 'wedding';
        const isFullDay = isWeddingBooking && 
                          booking.wedding_bookings && 
                          booking.wedding_bookings.length > 0 && 
                          booking.wedding_bookings[0].is_full_day;
        return isFullDay;
      });
      
      if (hasFullDayBooking) {
        return { morning: true, evening: true };
      }
      
      // Check for morning/evening conflicts
      let morningBooked = false;
      let eveningBooked = false;
      
      bookingsOnDate.forEach(booking => {
        if (booking.event_type === 'wedding' && 
            booking.wedding_bookings && 
            booking.wedding_bookings.length > 0 && 
            !booking.wedding_bookings[0].is_full_day) {
          
          // Get the time of the existing booking
          const bookingStartHour = new Date(booking.start_date).getHours();
          if (bookingStartHour < 12) {
            morningBooked = true;
          } else {
            eveningBooked = true;
          }
        } else {
          // For non-wedding bookings, check time roughly
          const bookingStartHour = new Date(booking.start_date).getHours();
          if (bookingStartHour < 12) {
            morningBooked = true;
          } else {
            eveningBooked = true;
          }
        }
      });
      
      return { morning: morningBooked, evening: eveningBooked };
    }
    
    return { morning: false, evening: false };
  };
  
  const disabledTimeSlots = getDisabledTimeSlots();

  return (
    <div className="space-y-4">
      {isPastBooking && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a past booking and cannot be edited. You can only view the details.
          </AlertDescription>
        </Alert>
      )}

      <InputField
        form={form}
        name="client_name"
        label="Client Name"
        placeholder="Enter client name"
        disabled={isFormReadOnly}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          form={form}
          name="bride_name"
          label="Bride's Name"
          placeholder="Enter bride's name"
          disabled={isFormReadOnly}
        />
        <InputField
          form={form}
          name="groom_name"
          label="Groom's Name"
          placeholder="Enter groom's name"
          disabled={isFormReadOnly}
        />
      </div>

      <InputField
        form={form}
        name="address"
        label="Address"
        placeholder="Enter address"
        disabled={isFormReadOnly}
      />

      <InputField
        form={form}
        name="phone"
        label="Phone Number"
        placeholder="Enter phone number"
        disabled={isFormReadOnly}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Booking Duration</label>
        <RadioGroup 
          value={form.watch('is_full_day') ? 'full' : 'half'}
          onValueChange={(value) => {
            if (isFormReadOnly) return;
            
            const isFullDay = value === 'full';
            form.setValue('is_full_day', isFullDay);
            
            // If switching to full day, clear time of day
            if (isFullDay) {
              form.setValue('time_of_day', undefined);
            } else {
              // Default to morning when switching to half day
              form.setValue('time_of_day', 'morning');
            }
            
            // Update pricing based on selected venue and duration
            const venueId = form.watch('venue_id');
            if (venueId) {
              updatePricing(venueId, isFullDay, form, value === 'half' ? timeOfDay : undefined);
            }
          }}
          className="flex space-x-4"
        >
          <RadioItem value="full" id="full-day" disabled={isFormReadOnly}>Full Day</RadioItem>
          <RadioItem value="half" id="half-day" disabled={isFormReadOnly}>Half Day</RadioItem>
        </RadioGroup>
      </div>

      {/* Show morning/evening selection only for half-day bookings */}
      {isHalfDay && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Time of Day</label>
          <RadioGroup 
            value={timeOfDay}
            onValueChange={(value) => {
              if (isFormReadOnly) return;
              
              form.setValue('time_of_day', value);
              
              // Update pricing based on selected venue, duration and time of day
              const venueId = form.watch('venue_id');
              if (venueId) {
                updatePricing(venueId, false, form, value);
              }
            }}
            className="flex space-x-4"
          >
            <RadioItem 
              value="morning" 
              id="morning" 
              disabled={isFormReadOnly || disabledTimeSlots.morning}
              className={isFormReadOnly || disabledTimeSlots.morning ? "opacity-50 cursor-not-allowed" : ""}
            >
              Morning (8AM-2PM)
            </RadioItem>
            <RadioItem 
              value="evening" 
              id="evening" 
              disabled={isFormReadOnly || disabledTimeSlots.evening}
              className={isFormReadOnly || disabledTimeSlots.evening ? "opacity-50 cursor-not-allowed" : ""}
            >
              Evening (3PM-9PM)
            </RadioItem>
          </RadioGroup>
          
          {!isFormReadOnly && disabledTimeSlots.morning && timeOfDay === 'morning' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Morning slot is already booked for this date
              </AlertDescription>
            </Alert>
          )}
          
          {!isFormReadOnly && disabledTimeSlots.evening && timeOfDay === 'evening' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Evening slot is already booked for this date
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export const updatePricing = async (
  venueId: string, 
  isFullDay: boolean, 
  form: UseFormReturn<any>,
  timeOfDay?: string
) => {
  if (!venueId) return;
  
  try {
    // Import supabase here to avoid circular dependencies
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data: venue } = await supabase
      .from('venues')
      .select('total_amount, deposit_amount, full_day_amount, half_day_amount')
      .eq('id', venueId)
      .single() as any;
    
    if (venue) {
      // Set appropriate amounts based on selected duration
      const totalAmount = isFullDay 
        ? venue.full_day_amount || venue.total_amount
        : venue.half_day_amount || venue.total_amount;
      
      form.setValue('total_amount', totalAmount || 0);
      form.setValue('deposit_amount', venue.deposit_amount || 0);

      // Set start and end times based on full/half day
      const now = new Date();
      const startDate = new Date(form.getValues('start_date') || now);
      if (isNaN(startDate.getTime())) {
        // If invalid date, use current date
        startDate.setTime(now.getTime());
      }
      
      const endDate = new Date(startDate);
      
      if (isFullDay) {
        // Full day is 9 AM to 10 PM
        startDate.setHours(9, 0, 0, 0);
        endDate.setHours(22, 0, 0, 0);
      } else {
        // Half day is either morning (8AM-2PM) or evening (3PM-9PM)
        if (timeOfDay === 'morning') {
          startDate.setHours(8, 0, 0, 0);
          endDate.setHours(14, 0, 0, 0);
        } else {
          startDate.setHours(15, 0, 0, 0);
          endDate.setHours(21, 0, 0, 0);
        }
      }
      
      form.setValue('start_date', startDate.toISOString().slice(0, 16));
      form.setValue('end_date', endDate.toISOString().slice(0, 16));
    }
  } catch (error) {
    console.error('Error fetching venue pricing:', error);
  }
};

export default WeddingFormFields;
