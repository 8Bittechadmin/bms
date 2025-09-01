
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, startOfToday } from 'date-fns';

interface DateTimeFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  minDate?: string;
  disabled?: boolean;
}

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  form,
  name,
  label,
  placeholder,
  required = false,
  optional = false,
  className,
  minDate,
  disabled = false
}) => {
  // Set minimum date to today if not provided
  const today = format(startOfToday(), 'yyyy-MM-dd');
  const minimumDate = minDate || today;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label} {optional && <span className="text-muted-foreground">(optional)</span>}
          </FormLabel>
          <FormControl>
            <Input
              type="datetime-local"
              placeholder={placeholder}
              {...field}
              value={field.value || ''}
              min={disabled ? undefined : `${minimumDate}T00:00`}
              disabled={disabled}
              className={cn(
                "w-full",
                form.formState.errors[name] && "border-red-500"
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
