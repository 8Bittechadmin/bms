
import React from 'react';
import { RadioGroup as ShadcnRadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  children,
  className,
}) => {
  return (
    <ShadcnRadioGroup
      value={value}
      onValueChange={onValueChange}
      className={cn('flex gap-4', className)}
    >
      {children}
    </ShadcnRadioGroup>
  );
};

interface RadioItemProps {
  value: string;
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean; // Added disabled property to support disabling radio items
}

export const RadioItem: React.FC<RadioItemProps> = ({
  value,
  id,
  children,
  className,
  disabled = false, // Default to false
}) => {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem
        id={id}
        value={value}
        disabled={disabled}
        className={cn(
          'peer h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      />
      <Label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {children}
      </Label>
    </div>
  );
};
