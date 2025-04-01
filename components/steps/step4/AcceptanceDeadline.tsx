import React from "react";
import { useFormContext, Controller } from "react-hook-form";

export const AcceptanceDeadline: React.FC = () => {
  const { control } = useFormContext();

  return (
    <>
      <h2 className="mb-4 text-2xl font-bold">Acceptance Deadline</h2>
      <h3 className="mb-2 text-lg font-medium">
        What is the deadline for the seller to accept this offer?
      </h3>
      <div className="mt-4">
        <Controller
          name="acceptanceDeadline"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Acceptance Deadline
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                value={field.value || ""}
                onChange={(e) => {
                  field.onChange(e);
                }}
              />
              <p className="mt-2 text-sm text-gray-500">
                Select the date by which the seller must accept or reject
                this offer. Click Next to proceed to review your offer.
              </p>
            </div>
          )}
        />
      </div>
    </>
  );
}; 