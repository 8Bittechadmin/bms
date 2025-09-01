
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InputFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  step?: string;
  readOnly?: boolean;
  onValueChange?: (value: any) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  form,
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  className,
  disabled = false,
  step,
  readOnly = false,
  onValueChange
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              value={field.value || ''}
              disabled={disabled}
              readOnly={readOnly}
              step={step}
              onChange={(e) => {
                field.onChange(e);
                if (onValueChange) {
                  onValueChange(e.target.value);
                }
              }}
              className={cn(
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
