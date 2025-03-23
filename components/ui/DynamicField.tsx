import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { TextField } from './form/TextField';
import { RadioGroup } from './form/RadioGroup';
import { MoneyField } from './form/MoneyField';
import { DateField } from './form/DateField';
import { AddressField } from './form/AddressField';

interface FieldConfig {
  id: string;
  type: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  options?: any[];
  rows?: number;
  showMap?: boolean;
  conditionalDisplay?: {
    field: string;
    value: any;
  };
  [key: string]: any;
}

interface DynamicFieldProps {
  field: FieldConfig;
  disabled?: boolean;
}

export function DynamicField({ field, disabled = false }: DynamicFieldProps) {
  const { control } = useFormContext();
  
  // Always call useWatch unconditionally
  // If no conditional display, use a dummy field name that will never match
  const watchFieldName = field.conditionalDisplay?.field || 'non-existent-field';
  const watchedValue = useWatch({ control, name: watchFieldName });
  
  // Handle conditional display - only check if conditionalDisplay exists
  if (field.conditionalDisplay && watchedValue !== field.conditionalDisplay.value) {
    return null;
  }
  
  // Render the appropriate field based on type
  switch (field.type) {
    case 'text':
      return (
        <TextField
          name={field.id}
          label={field.label}
          placeholder={field.placeholder}
          helperText={field.helperText}
          disabled={disabled}
        />
      );
      
    case 'textarea':
      return (
        <TextField
          name={field.id}
          label={field.label}
          placeholder={field.placeholder}
          helperText={field.helperText}
          multiline
          rows={field.rows || 4}
          disabled={disabled}
        />
      );
      
    case 'radio':
      return (
        <RadioGroup
          name={field.id}
          label={field.label}
          options={field.options || []}
        />
      );
      
    case 'radio-cards':
      return (
        <RadioGroup
          name={field.id}
          label={field.label}
          options={field.options || []}
          columns={4}
        />
      );
      
    case 'money':
      return (
        <MoneyField
          name={field.id}
          label={field.label || ''}
          placeholder={field.placeholder}
          disabled={disabled}
        />
      );
      
    case 'date':
      return (
        <DateField
          name={field.id}
          label={field.label}
          disabled={disabled}
        />
      );
      
    case 'address':
      return (
        <AddressField
          name={field.id}
          label={field.label}
          disabled={disabled}
          showMap={field.showMap}
        />
      );
      
    default:
      return <div>Unknown field type: {field.type}</div>;
  }
} 