import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { RadioGroup } from '../form/RadioGroup';
import { TextField } from '../form/TextField';
import { DateField } from '../form/DateField';
import { MoneyField } from '../form/MoneyField';

export function FinancingConditions() {
  const { control } = useFormContext();
  const financingType = useWatch({ control, name: 'financing-type' });
  
  const financingOptions = [
    { value: 'cash', label: 'Cash (No Financing)' },
    { value: 'conventional', label: 'Conventional Loan' },
    { value: 'fha', label: 'FHA Loan' },
    { value: 'va', label: 'VA Loan' },
    { value: 'seller', label: 'Seller Financing' },
    { value: 'other', label: 'Other' }
  ];
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Financing Conditions</h3>
      
      <RadioGroup
        name="financing-type"
        options={financingOptions}
        label="How will this purchase be financed?"
      />
      
      {financingType && financingType !== 'cash' && (
        <div className="space-y-4 pt-4 pl-4 border-l-2 border-emerald-200">
          <MoneyField
            name="financing-amount"
            label="Loan Amount"
          />
          
          <TextField
            name="financing-percentage"
            label="Down Payment Percentage"
            placeholder="e.g., 20%"
          />
          
          <DateField 
            name="financing-deadline"
            label="Financing Contingency Deadline"
          />
          
          {financingType === 'other' && (
            <TextField
              name="financing-details"
              label="Financing Details"
              multiline
              rows={3}
              placeholder="Please describe your financing arrangement"
            />
          )}
        </div>
      )}
    </div>
  );
} 