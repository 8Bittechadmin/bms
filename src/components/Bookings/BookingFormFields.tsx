
import React, { useState, useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { InputField, SelectField, TextareaField, CheckboxField } from '@/components/Common/FormFields';
import { DateTimeField } from '@/components/Common/FormFields/DateTimeField';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookingFormValues } from './BookingFormSchema';
import QuickAddClient from './QuickAddClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import WeddingFormFields, { updatePricing } from './WeddingFormFields';
import { addDays, format, isAfter, isBefore, parseISO, startOfToday } from 'date-fns';
import { RadioGroup, RadioItem } from '@/components/Common/FormFields/RadioGroup';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface BookingFormFieldsProps {
  form: UseFormReturn<BookingFormValues>;
  preSelectedDate?: string;
  readOnly?: boolean;
}

const BookingFormFields: React.FC<BookingFormFieldsProps> = ({ form, preSelectedDate, readOnly = false }) => {
  const [clientOptions, setClientOptions] = useState<{ value: string; label: string; }[]>([]);
  const [venueOptions, setVenueOptions] = useState<{ value: string; label: string; }[]>([]);
  const [depositAmount, setDepositAmount] = useState<number | undefined>(form.getValues('deposit_amount'));
  const [totalAmount, setTotalAmount] = useState<number | undefined>(form.getValues('total_amount'));
  const [isWeddingEvent, setIsWeddingEvent] = useState(form.getValues('event_type') === 'wedding');
  const [isFullDay, setIsFullDay] = useState(form.getValues('is_full_day') ?? true);
  const isMobile = useIsMobile();
  const today = startOfToday();

  // Check if the booking is in the past
  const startDate = form.watch('start_date');
  const isPastBooking = startDate ? isBefore(new Date(startDate), today) : false;
  const isFormReadOnly = readOnly || isPastBooking;

  // Use preSelectedDate if provided
  useEffect(() => {
    if (preSelectedDate && !form.getValues('start_date')) {
      // Set default start time to 9 AM on the selected date
      const startDate = new Date(preSelectedDate);
      startDate.setHours(9, 0, 0, 0);
      
      // Set default end time to 5 PM on the selected date
      const endDate = new Date(preSelectedDate);
      endDate.setHours(17, 0, 0, 0);
      
      form.setValue('start_date', startDate.toISOString().slice(0, 16));
      form.setValue('end_date', endDate.toISOString().slice(0, 16));
    }
  }, [preSelectedDate, form]);

  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name') as any;
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: venues = [], isLoading: isVenuesLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name') as any;
      
      if (error) throw error;
      return data || [];
    },
  });

  // Check for booking conflicts when a venue is selected
  const selectedVenueId = form.watch('venue_id');
  const { data: venueBookings = [] } = useQuery({
    queryKey: ['venue-bookings', selectedVenueId],
    queryFn: async () => {
      if (!selectedVenueId) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, 
          event_name, 
          start_date, 
          end_date,
          event_type,
          status,
          is_full_day
        `)
        .eq('venue_id', selectedVenueId)
        .eq('status', 'confirmed')
        .neq('status', 'cancelled') as any;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedVenueId,
  });

  useEffect(() => {
    if (clients.length > 0) {
      setClientOptions(clients.map(client => ({
        value: client.id,
        label: client.name
      })));
    }
  }, [clients]);

  useEffect(() => {
    if (venues.length > 0) {
      setVenueOptions(venues.map(venue => ({
        value: venue.id,
        label: venue.name
      })));
    }
  }, [venues]);

  // Watch for changes to event_type and other fields
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'event_type') {
        const isWedding = value.event_type === 'wedding';
        setIsWeddingEvent(isWedding);
        
        // If switching to wedding, set defaults for wedding form
        if (isWedding && !isFormReadOnly) {
          form.setValue('is_full_day', true);
          setIsFullDay(true);
          // Clear client_id when switching to wedding
          form.setValue('client_id', '');
        }
      } else if (name === 'is_full_day') {
        setIsFullDay(value.is_full_day);
        
        // Auto-set start and end dates based on full/half day selection
        if (!isFormReadOnly && form.getValues('start_date')) {
          const selectedDate = form.getValues('start_date').split('T')[0];
          const timeOfDay = form.getValues('time_of_day');
          
          if (value.is_full_day) {
            // Full day: 9 AM to 5 PM
            form.setValue('start_date', `${selectedDate}T09:00`);
            form.setValue('end_date', `${selectedDate}T17:00`);
            form.setValue('time_of_day', '');
          } else if (timeOfDay) {
            // Half day: morning (9 AM to 1 PM) or evening (2 PM to 6 PM)
            if (timeOfDay === 'morning') {
              form.setValue('start_date', `${selectedDate}T09:00`);
              form.setValue('end_date', `${selectedDate}T13:00`);
            } else if (timeOfDay === 'evening') {
              form.setValue('start_date', `${selectedDate}T14:00`);
              form.setValue('end_date', `${selectedDate}T18:00`);
            }
          }
        }
      } else if (name === 'time_of_day' && !value.is_full_day) {
        // Update times when time of day changes for half day bookings
        if (!isFormReadOnly && form.getValues('start_date')) {
          const selectedDate = form.getValues('start_date').split('T')[0];
          const timeOfDay = value.time_of_day;
          
          if (timeOfDay === 'morning') {
            form.setValue('start_date', `${selectedDate}T09:00`);
            form.setValue('end_date', `${selectedDate}T13:00`);
          } else if (timeOfDay === 'evening') {
            form.setValue('start_date', `${selectedDate}T14:00`);
            form.setValue('end_date', `${selectedDate}T18:00`);
          }
        }
      } else if (name === 'venue_id' && value.venue_id && !isFormReadOnly) {
        // Update pricing when venue changes
        const isWedding = form.getValues('event_type') === 'wedding';
        const isFullDay = form.getValues('is_full_day');
        const timeOfDay = form.getValues('time_of_day');
        
        if (isWedding) {
          updatePricing(value.venue_id, isFullDay, form, !isFullDay ? timeOfDay : undefined);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, isFormReadOnly]);

  const handleClientAdded = (client: { id: string; name: string }) => {
    if (isFormReadOnly) return;
    setClientOptions(prev => [...prev, { value: client.id, label: client.name }]);
    form.setValue('client_id', client.id);
  };

  const handleTotalAmountChange = (value: any) => {
    if (isFormReadOnly) return;
    setTotalAmount(value);
    if (depositAmount && depositAmount > value) {
      setDepositAmount(value);
      form.setValue('deposit_amount', value);
    }
  };

  const handleDepositAmountChange = (value: any) => {
    if (isFormReadOnly) return;
    const total = totalAmount || 0;
    const deposit = value > total ? total : value;
    setDepositAmount(deposit);
  };

  const EVENT_TYPE_OPTIONS = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'birthday', label: 'Birthday Party' },
    { value: 'conference', label: 'Conference' },
    { value: 'other', label: 'Other' }
  ];

  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Check if the selected date has any existing bookings
  const checkDateBookingConflicts = () => {
    if (!venueBookings.length || !form.getValues('start_date') || isFormReadOnly) return;
    
    const selectedDate = form.getValues('start_date').split('T')[0];
    const bookingsOnDate = venueBookings.filter(booking => {
      const bookingDate = new Date(booking.start_date).toISOString().split('T')[0];
      return bookingDate === selectedDate && booking.id !== form.getValues('id');
    });
    
    // If there are bookings on this date, check for conflicts
    if (bookingsOnDate.length > 0) {
      const hasFullDayBooking = bookingsOnDate.some(booking => booking.is_full_day);

      // If there's a full day booking, we can't book anything else
      if (hasFullDayBooking) {
        form.setError('start_date', {
          type: 'manual',
          message: 'This date already has a full-day booking'
        });
        return;
      }

      // Check for morning/evening conflicts for half-day bookings
      if (!form.getValues('is_full_day')) {
        const selectedTimeOfDay = form.getValues('time_of_day');
        
        const hasConflictingTimeSlot = bookingsOnDate.some(booking => {
          if (!booking.is_full_day) {
            // Get the time of the existing booking
            const bookingStartHour = new Date(booking.start_date).getHours();
            const existingTimeSlot = bookingStartHour < 12 ? 'morning' : 'evening';
            
            // If the same time slot is booked, we have a conflict
            return existingTimeSlot === selectedTimeOfDay;
          }
          return false;
        });
        
        if (hasConflictingTimeSlot) {
          form.setError('time_of_day', {
            type: 'manual',
            message: `This ${selectedTimeOfDay} slot is already booked`
          });
        }
      }
    }
  };

  // Check for booking conflicts when start date, venue, or booking type changes
  useEffect(() => {
    if (isFormReadOnly) return;
    
    const subscription = form.watch((value, { name }) => {
      if (['start_date', 'venue_id', 'is_full_day', 'time_of_day'].includes(name as string)) {
        // Clear any existing errors
        form.clearErrors(['start_date', 'time_of_day']);
        checkDateBookingConflicts();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [venueBookings, form, isFormReadOnly]);

  return (
    <CardContent>
      <div className="grid gap-6">
        {isPastBooking && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a past booking and cannot be edited. You can only view the details.
            </AlertDescription>
          </Alert>
        )}

        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
          <InputField
            form={form}
            name="event_name"
            label="Event Name"
            placeholder="Enter event name"
            disabled={isFormReadOnly}
          />
          
          <SelectField
            form={form}
            name="event_type"
            label="Event Type"
            options={EVENT_TYPE_OPTIONS}
            disabled={isFormReadOnly}
          />
        </div>

        {isWeddingEvent ? (
          <WeddingFormFields 
            form={form} 
            bookings={venueBookings} 
            readOnly={isFormReadOnly}
          />
        ) : (
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="text-sm font-medium" htmlFor="client_id">Client</label>
                {!isFormReadOnly && <QuickAddClient onClientAdded={handleClientAdded} />}
              </div>
              <SelectField
                form={form}
                name="client_id"
                label=""
                options={clientOptions}
                className="mt-0"
                disabled={isFormReadOnly}
              />
            </div>
          </div>
        )}

        <SelectField
          form={form}
          name="venue_id"
          label="Venue"
          options={venueOptions}
          disabled={isFormReadOnly}
        />

        {/* Date Selection */}
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
          <div>
            <label className="text-sm font-medium">Event Date</label>
            <input
              type="date"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.watch('start_date') ? form.watch('start_date').split('T')[0] : ''}
              min={format(today, 'yyyy-MM-dd')}
              onChange={(e) => {
                if (isFormReadOnly) return;
                const selectedDate = e.target.value;
                const isFullDay = form.getValues('is_full_day') ?? true;
                const timeOfDay = form.getValues('time_of_day');
                
                if (isFullDay) {
                  // Full day: 9 AM to 5 PM
                  form.setValue('start_date', `${selectedDate}T09:00`);
                  form.setValue('end_date', `${selectedDate}T17:00`);
                } else if (timeOfDay) {
                  // Half day based on time of day
                  if (timeOfDay === 'morning') {
                    form.setValue('start_date', `${selectedDate}T09:00`);
                    form.setValue('end_date', `${selectedDate}T13:00`);
                  } else if (timeOfDay === 'evening') {
                    form.setValue('start_date', `${selectedDate}T14:00`);
                    form.setValue('end_date', `${selectedDate}T18:00`);
                  }
                }
              }}
              disabled={isFormReadOnly}
            />
          </div>
        </div>

        {/* Full Day / Half Day Selection */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_full_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking Duration</FormLabel>
                <RadioGroup
                  value={field.value ? 'full' : 'half'}
                  onValueChange={(value) => {
                    if (isFormReadOnly) return;
                    const isFullDay = value === 'full';
                    field.onChange(isFullDay);
                    form.setValue('is_full_day', isFullDay);
                    
                    if (!isFullDay) {
                      // Set default to morning for half day
                      form.setValue('time_of_day', 'morning');
                    } else {
                      form.setValue('time_of_day', '');
                    }
                  }}
                  className="flex gap-6"
                >
                  <RadioItem value="full" id="full-day" disabled={isFormReadOnly}>
                    Full Day (9 AM - 5 PM)
                  </RadioItem>
                  <RadioItem value="half" id="half-day" disabled={isFormReadOnly}>
                    Half Day
                  </RadioItem>
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time of Day Selection for Half Day */}
          {!isFullDay && (
            <FormField
              control={form.control}
              name="time_of_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Day</FormLabel>
                  <RadioGroup
                    value={field.value || ''}
                    onValueChange={(value) => {
                      if (isFormReadOnly) return;
                      field.onChange(value);
                      form.setValue('time_of_day', value);
                    }}
                    className="flex gap-6"
                  >
                    <RadioItem value="morning" id="morning" disabled={isFormReadOnly}>
                      Morning (9 AM - 1 PM)
                    </RadioItem>
                    <RadioItem value="evening" id="evening" disabled={isFormReadOnly}>
                      Evening (2 PM - 6 PM)
                    </RadioItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-4`}>
          <div>
            <label className="text-sm font-medium">Number of Guests</label>
            <input
              type="number"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="0"
              value={form.watch('guest_count') || ''}
              onChange={(e) => {
                if (isFormReadOnly) return;
                const value = e.target.value;
                const numValue = value !== '' ? parseInt(value) : undefined;
                form.setValue('guest_count', numValue as any);
              }}
              disabled={isFormReadOnly}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Total Amount</label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="0.00"
              value={form.watch('total_amount') || ''}
              onChange={(e) => {
                if (isFormReadOnly) return;
                const value = e.target.value;
                const numValue = value !== '' ? parseFloat(value) : undefined;
                form.setValue('total_amount', numValue as any);
                handleTotalAmountChange(numValue);
              }}
              disabled={isFormReadOnly}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Deposit Amount</label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="0.00"
              value={form.watch('deposit_amount') || ''}
              onChange={(e) => {
                if (isFormReadOnly) return;
                const value = e.target.value;
                const numValue = value !== '' ? parseFloat(value) : undefined;
                form.setValue('deposit_amount', numValue as any);
                handleDepositAmountChange(numValue);
              }}
              disabled={isFormReadOnly}
            />
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
          <CheckboxField
            form={form}
            name="deposit_paid"
            label="Deposit Paid"
            disabled={isFormReadOnly}
          />

          <SelectField
            form={form}
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
            disabled={isFormReadOnly}
          />
        </div>

        <TextareaField
          form={form}
          name="notes"
          label="Notes"
          placeholder="Enter any additional notes about this booking"
          disabled={isFormReadOnly}
        />

        {!isFormReadOnly && (depositAmount && totalAmount && depositAmount > totalAmount) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Deposit amount cannot be greater than the total amount.
            </AlertDescription>
          </Alert>
        )}

        {!isFormReadOnly && form.formState.errors.start_date && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {form.formState.errors.start_date.message}
            </AlertDescription>
          </Alert>
        )}

        {!isFormReadOnly && form.formState.errors.time_of_day && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {form.formState.errors.time_of_day.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </CardContent>
  );
};

export default BookingFormFields;
