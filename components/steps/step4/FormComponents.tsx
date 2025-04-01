import React from "react";
import { useFormContext, Controller } from "react-hook-form";

// Date field component with consistent styling
export const DateField = ({ name, label }: { name: string; label?: string }) => {
  const { control } = useFormContext();

  return (
    <div className="mt-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            value={field.value || ""}
            onChange={(e) => {
              e.stopPropagation();
              field.onChange(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      />
    </div>
  );
};

// Radio options component with conditional fields
export const RadioOptions = ({
  name,
  options,
  textFieldName,
}: {
  name: string;
  options: any[];
  textFieldName?: string;
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {options.map((option) => (
            <div
              key={option.value}
              className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 ${
                field.value === option.value
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200"
              }`}
              onClick={() => field.onChange(option.value)}
            >
              <div className="flex items-start">
                <div
                  className={`relative h-5 w-5 flex-shrink-0 rounded-full ${
                    field.value === option.value
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-2 border-gray-300 bg-white"
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
                <label className="ml-3 cursor-pointer text-lg font-medium text-gray-700">
                  {option.label}
                </label>
              </div>

              {/* Handle date fields separately */}
              {option.hasDateField && field.value === option.value && (
                <DateField
                  name={option.dateFieldName}
                  label={option.dateFieldLabel}
                />
              )}

              {/* Handle regular text fields */}
              {option.hasTextField &&
                !option.hasDateField &&
                field.value === option.value && (
                  <div className="mt-4">
                    {option.textFieldLabel && (
                      <label className="block text-sm font-medium text-gray-700">
                        {option.textFieldLabel}
                      </label>
                    )}
                    <Controller
                      name={
                        option.textFieldName || textFieldName || `${name}Other`
                      }
                      control={control}
                      render={({ field: textField }) => (
                        <input
                          type="text"
                          placeholder={option.textFieldPlaceholder || ""}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          value={textField.value || ""}
                          onChange={(e) => {
                            e.stopPropagation(); 
                            textField.onChange(e.target.value);
                          }}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    />
                  </div>
                )}

              {/* Handle second text field if present */}
              {option.secondTextField && field.value === option.value && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {option.secondTextField.label}
                  </label>
                  <Controller
                    name={option.secondTextField.name}
                    control={control}
                    render={({ field: textField2 }) => (
                      <input
                        type={option.secondTextField.type || "text"}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={textField2.value || ""}
                        onChange={(e) => {
                          e.stopPropagation(); 
                          textField2.onChange(e.target.value);
                        }}
                        onFocus={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    />
  );
};

// Money input field component
export const MoneyField = ({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder: string;
}) => {
  const { control } = useFormContext();
  
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-lg">$</span>
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-emerald-500 focus:ring-emerald-500 sm:text-lg"
              placeholder={placeholder}
              value={field.value || ""}
              onChange={(e) => {
                e.stopPropagation();
                // Format as currency, remove non-numeric
                const value = e.target.value.replace(/[^\d.]/g, "");
                field.onChange(value);
              }}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    />
  );
}; 