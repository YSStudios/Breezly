import React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface TextFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}

export function TextField({
  name,
  label,
  placeholder,
  helperText,
  multiline = false,
  rows = 4,
  disabled = false,
}: TextFieldProps) {
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
          multiline ? (
            <textarea
              id={name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          ) : (
            <input
              type="text"
              id={name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          )
        )}
      />
      {helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
} 