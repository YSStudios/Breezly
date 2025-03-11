import React from "react";
import { Controller, useFormContext } from "react-hook-form";

export interface RadioOption {
  value: string;
  label: string;
  icon?: React.ElementType;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  label?: string;
  columns?: 1 | 2 | 3 | 4;
  onChange?: (value: string) => void;
}

export function RadioGroup({ 
  name, 
  options, 
  label, 
  columns = 2,
  onChange
}: RadioGroupProps) {
  const { control } = useFormContext();
  
  return (
    <div>
      {label && <h4 className="mb-2 text-lg font-medium">{label}</h4>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className={`grid grid-cols-1 gap-4 md:grid-cols-${columns}`}>
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 ${
                    field.value === option.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => {
                    field.onChange(option.value);
                    onChange?.(option.value);
                  }}
                >
                  <div className="flex items-start">
                    <div
                      className={`relative h-5 w-5 flex-shrink-0 rounded-full ${
                        field.value === option.value
                          ? "bg-emerald-500 border-emerald-500"
                          : "bg-white border-2 border-gray-300"
                      }`}
                    >
                      {field.value === option.value && (
                        <svg
                          className="absolute inset-0 h-full w-full p-1 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 flex items-center">
                      {Icon && <Icon className="mr-2 h-5 w-5 text-gray-500" />}
                      <label className="cursor-pointer text-lg font-medium text-gray-700">
                        {option.label}
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      />
    </div>
  );
} 