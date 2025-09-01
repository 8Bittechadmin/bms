
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SelectWithOtherFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  otherFieldName?: string; // Name for the "other" text field
}

export const SelectWithOtherField: React.FC<SelectWithOtherFieldProps> = ({
  form,
  name,
  label,
  options,
  placeholder,
  className,
  disabled = false,
  otherFieldName = `${name}_other`
}) => {
  const [showOtherField, setShowOtherField] = useState(false);
  const currentValue = form.watch(name);

  useEffect(() => {
    setShowOtherField(currentValue === 'other');
    
    // Clear the other field when not "other"
    if (currentValue !== 'other') {
      form.setValue(otherFieldName, '');
    }
  }, [currentValue, otherFieldName, form]);

  return (
    <div className={className}>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                setShowOtherField(value === 'other');
              }} 
              value={field.value} 
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className={cn(
                  form.formState.errors[name] && "border-red-500"
                )}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {showOtherField && (
        <FormField
          control={form.control}
          name={otherFieldName}
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Specify Other</FormLabel>
              <FormControl>
                <Input
                  placeholder="Please specify..."
                  {...field}
                  className={cn(
                    form.formState.errors[otherFieldName] && "border-red-500"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
