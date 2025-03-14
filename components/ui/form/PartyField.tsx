import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { UserIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { RadioGroup, RadioOption } from "./RadioGroup";
import { TextField } from "./TextField";

interface PartyFieldProps {
  partyType: 'buyer' | 'seller';
  index: number;
  label?: string;
  onRemove?: () => void;
  removable?: boolean;
}

export function PartyField({
  partyType,
  index,
  label,
  onRemove,
  removable = false,
}: PartyFieldProps) {
  const { control } = useFormContext();
  
  const partyTypeOptions: RadioOption[] = [
    {
      value: 'individual',
      label: 'Individual',
      icon: UserIcon
    },
    {
      value: 'corporation',
      label: 'Corporation/Organization',
      icon: BuildingOfficeIcon
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        {label && <h3 className="text-xl font-semibold text-gray-900">{label}</h3>}
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            aria-label={`Remove ${partyType}`}
          >
            Remove
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Party Type Selection */}
      <RadioGroup
        name={`${partyType}-type-${index}`}
        options={partyTypeOptions}
        label={`Who is the ${partyType}?`}
      />
      
      {/* Name and Address Fields */}
      <div className="space-y-4">
        <TextField
          name={`name-${partyType}-${index}`}
          label="Name"
          placeholder={`Enter ${partyType}'s name`}
        />
        <TextField
          name={`address-${partyType}-${index}`}
          label="Address"
          placeholder="e.g. Street, City, State ZIP Code"
          helperText={`Enter the complete mailing address for the ${partyType}`}
        />
      </div>
    </div>
  );
} 