
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TextareaFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  form,
  name,
  label,
  placeholder,
  rows = 3,
  className,
  disabled = false
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              rows={rows}
              {...field}
              value={field.value || ''}
              disabled={disabled}
              className={cn(
                "resize-none",
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
