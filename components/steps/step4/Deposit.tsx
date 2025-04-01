import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { MoneyField, RadioOptions } from "./FormComponents";
import { DEPOSIT_METHOD_OPTIONS } from "../Step4";

export const Deposit: React.FC = () => {
  const { control, watch } = useFormContext();
  
  return (
    <>
      <div>
        <h2 className="mb-4 text-2xl font-bold">Deposit</h2>
        <MoneyField
          name="depositAmount"
          label="How much is the initial deposit?"
          placeholder="e.g. 20,000"
        />
      </div>

      <div className="mt-6">
        <h3 className="mb-2 text-lg font-medium">
          How will the deposit be paid?
        </h3>
        <RadioOptions
          name="depositMethod"
          options={DEPOSIT_METHOD_OPTIONS}
          textFieldName="depositMethodOther"
        />
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="mb-2 text-lg font-medium">
          When is the deposit due?
        </h3>

        {/* Simple radio selection without conditional fields */}
        <Controller
          name="depositDueDate"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 ${
                  field.value === "Unsure"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200"
                }`}
                onClick={() => field.onChange("Unsure")}
              >
                <div className="flex items-start">
                  <div
                    className={`relative h-5 w-5 flex-shrink-0 rounded-full ${
                      field.value === "Unsure"
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-2 border-gray-300 bg-white"
                    }`}
                  >
                    {field.value === "Unsure" && (
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
                    Unsure
                  </label>
                </div>
              </div>

              <div
                className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 ${
                  field.value === "Specify date"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200"
                }`}
                onClick={() => field.onChange("Specify date")}
              >
                <div className="flex items-start">
                  <div
                    className={`relative h-5 w-5 flex-shrink-0 rounded-full ${
                      field.value === "Specify date"
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-2 border-gray-300 bg-white"
                    }`}
                  >
                    {field.value === "Specify date" && (
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
                    Specify date
                  </label>
                </div>
              </div>
            </div>
          )}
        />

        {/* Separate date field that's enabled only when "Specify date" is selected */}
        {watch("depositDueDate") === "Specify date" && (
          <div className="ml-6 mt-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Due Date
            </label>
            <Controller
              name="depositDueSpecificDate"
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
                  onFocus={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            />
          </div>
        )}
      </div>
    </>
  );
}; 