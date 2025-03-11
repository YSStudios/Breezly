import React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface DateFieldProps {
  name: string;
  label?: string;
  disabled?: boolean;
}

export function DateField({ name, label, disabled = false }: DateFieldProps) {
  const { control } = useFormContext();
  
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            type="date"
            id={name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            disabled={disabled}
            {...field}
          />
        )}
      />
    </div>
  );
} 