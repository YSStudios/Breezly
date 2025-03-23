import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { RadioGroup } from '../form/RadioGroup';
import { TextField } from '../form/TextField';
import { DateField } from '../form/DateField';

export function InspectionConditions() {
  const { control } = useFormContext();
  const inspectionType = useWatch({ control, name: 'inspection-type' });
  const inspectionResponse = useWatch({ control, name: 'inspection-response' });
  
  const inspectionOptions = [
    { value: 'standard', label: 'Standard Inspection Period' },
    { value: 'waived', label: 'Inspection Waived' },
    { value: 'custom', label: 'Custom Inspection Terms' }
  ];
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Inspection Contingency</h3>
      
      <RadioGroup
        name="inspection-type"
        options={inspectionOptions}
        label="Inspection Terms"
      />
      
      {inspectionType === 'standard' && (
        <div className="space-y-4 pt-4 pl-4 border-l-2 border-emerald-200">
          <DateField 
            name="inspection-deadline"
            label="Inspection Deadline"
          />
          
          <RadioGroup
            name="inspection-response"
            options={[
              { value: '5-days', label: '5 days from receipt of inspection' },
              { value: '10-days', label: '10 days from receipt of inspection' },
              { value: 'custom', label: 'Custom response period' }
            ]}
            label="Response Period"
          />
          
          {inspectionResponse === 'custom' && (
            <TextField
              name="inspection-response-custom"
              label="Custom Response Period"
              placeholder="e.g., 7 business days"
            />
          )}
        </div>
      )}
      
      {inspectionType === 'custom' && (
        <div className="space-y-4 pt-4 pl-4 border-l-2 border-emerald-200">
          <TextField
            name="inspection-custom-terms"
            label="Custom Inspection Terms"
            multiline
            rows={4}
            placeholder="Describe your custom inspection contingency terms..."
          />
        </div>
      )}
    </div>
  );
} 