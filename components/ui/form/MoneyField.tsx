import React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface MoneyFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MoneyField({
  name,
  label,
  placeholder = "0.00",
  disabled = false,
}: MoneyFieldProps) {
  const { control } = useFormContext();
  
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">$</span>
        </div>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              type="text"
              id={name}
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-emerald-500 focus:ring-emerald-500"
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              onChange={(e) => {
                // Optional: Format as currency or validate number input
                field.onChange(e.target.value);
              }}
            />
          )}
        />
      </div>
    </div>
  );
} 