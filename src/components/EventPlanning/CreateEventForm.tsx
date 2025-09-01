import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputField, SelectField, TextareaField, DateTimeField } from '@/components/Common/FormFields';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import QuickAddClient from '@/components/Bookings/QuickAddClient';
import EventTaskList from './EventTaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioItem } from '@/components/Common/FormFields/RadioGroup';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const eventFormSchema = z.object({
  event_name: z.string().min(1, "Event name is required"),
  event_type: z.string().min(1, "Event type is required"),
  venue_id: z.string().min(1, "Venue is required"),
  client_id: z.string().min(1, "Client is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  guest_count: z.coerce.number().min(1, "Guest count must be at least 1"),
  notes: z.string().optional(),
  is_full_day: z.boolean().default(true),
  time_of_day: z.string().optional(),
}).refine((data) => {
  // Validate that half-day bookings have a time_of_day
  if (data.is_full_day === false) {
    return !!data.time_of_day;
  }
  return true;
}, {
  message: 'Time of day is required for half-day bookings',
  path: ['time_of_day'],
});

type EventFormValues = z.infer<typeof eventFormSchema>;

type CreateEventFormProps = {
  onSubmit: (values: EventFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  initialValues?: Partial<EventFormValues>;
  bookingId?: string;
  existingTasks?: any[];
}

const eventTypes = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'conference', label: 'Conference' },
  { value: 'gala', label: 'Charity Gala' },
  { value: 'other', label: 'Other' },
];

export function CreateEventForm({ onSubmit, isSubmitting, onCancel, initialValues, bookingId, existingTasks = [] }: CreateEventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues || {
      event_name: '',
      event_type: '',
      venue_id: '',
      client_id: '',
      start_date: '',
      end_date: '',
      guest_count: 1,
      notes: '',
      is_full_day: true,
      time_of_day: '',
    },
  });

  const isMobile = useIsMobile();
  const isFullDay = form.watch('is_full_day');
  
  // Fetch venues for dropdown with refreshing enabled
  const { data: venues = [], isLoading: loadingVenues } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });
  
  // Fetch clients for dropdown with refreshing enabled
  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    // This ensures the client list is fresh when the form is opened
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  const venueOptions = venues.map(venue => ({
    value: venue.id,
    label: venue.name
  }));
  
  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.name
  }));

  const handleClientAdded = (client: { id: string; name: string }) => {
    form.setValue('client_id', client.id);
  };

  const handleSubmitForm = (values: EventFormValues) => {
    // Make sure guest_count is a number
    onSubmit({
      ...values,
      guest_count: Number(values.guest_count)
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
        <div className="space-y-4">
          <InputField
            form={form}
            name="event_name"
            label="Event Name"
            placeholder="Enter event name"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              form={form}
              name="event_type"
              label="Event Type"
              options={eventTypes}
              placeholder="Select event type"
            />
            
            <InputField
              form={form}
              name="guest_count"
              label="Guest Count"
              placeholder="Enter number of guests"
              type="number"
            />
            
            <SelectField
              form={form}
              name="venue_id"
              label="Venue"
              options={venueOptions}
              placeholder={loadingVenues ? "Loading venues..." : "Select venue"}
            />
            
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="text-sm font-medium" htmlFor="client_id">Client</label>
                <QuickAddClient onClientAdded={handleClientAdded} />
              </div>
              <SelectField
                form={form}
                name="client_id"
                label=""
                options={clientOptions}
                placeholder={loadingClients ? "Loading clients..." : "Select client"}
                className="mt-0"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Event Date</label>
              <input
                type="date"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.watch('start_date') ? form.watch('start_date').split('T')[0] : ''}
                onChange={(e) => {
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
                      const isFullDay = value === 'full';
                      field.onChange(isFullDay);
                      form.setValue('is_full_day', isFullDay);
                      
                      if (!isFullDay) {
                        // Set default to morning for half day
                        form.setValue('time_of_day', 'morning');
                      } else {
                        form.setValue('time_of_day', '');
                      }

                      // Update times if date is already selected
                      const selectedDate = form.getValues('start_date')?.split('T')[0];
                      if (selectedDate) {
                        if (isFullDay) {
                          form.setValue('start_date', `${selectedDate}T09:00`);
                          form.setValue('end_date', `${selectedDate}T17:00`);
                        } else {
                          form.setValue('start_date', `${selectedDate}T09:00`);
                          form.setValue('end_date', `${selectedDate}T13:00`);
                        }
                      }
                    }}
                    className="flex gap-6"
                  >
                    <RadioItem value="full" id="full-day">
                      Full Day (9 AM - 5 PM)
                    </RadioItem>
                    <RadioItem value="half" id="half-day">
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
                        field.onChange(value);
                        form.setValue('time_of_day', value);

                        // Update times if date is already selected
                        const selectedDate = form.getValues('start_date')?.split('T')[0];
                        if (selectedDate) {
                          if (value === 'morning') {
                            form.setValue('start_date', `${selectedDate}T09:00`);
                            form.setValue('end_date', `${selectedDate}T13:00`);
                          } else if (value === 'evening') {
                            form.setValue('start_date', `${selectedDate}T14:00`);
                            form.setValue('end_date', `${selectedDate}T18:00`);
                          }
                        }
                      }}
                      className="flex gap-6"
                    >
                      <RadioItem value="morning" id="morning">
                        Morning (9 AM - 1 PM)
                      </RadioItem>
                      <RadioItem value="evening" id="evening">
                        Evening (2 PM - 6 PM)
                      </RadioItem>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <TextareaField
            form={form}
            name="notes"
            label="Notes (optional)"
            placeholder="Enter any additional notes about this event"
          />
        </div>

        {bookingId && (
          <>
            <Separator />
            <EventTaskList bookingId={bookingId} existingTasks={existingTasks} />
          </>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (initialValues ? 'Updating...' : 'Creating...') : (initialValues ? 'Update Event' : 'Create Event')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateEventForm;
