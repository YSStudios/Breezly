import React, { useState } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";

export const AdditionalClauses: React.FC = () => {
  const { control, getValues } = useFormContext();

  // Initialize clauseIds based on existing form data
  const [clauseIds, setClauseIds] = useState<number[]>(() => {
    const formValues = getValues();
    const clauseKeys = Object.keys(formValues || {}).filter(
      (key) =>
        key.startsWith("clause-title-") || key.startsWith("clause-content-"),
    );

    if (clauseKeys.length === 0) {
      return [0];
    }

    // Extract indices from field names
    const indices = clauseKeys.map((key) => {
      const match = key.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    });

    // Get unique, sorted indices
    const uniqueIndices = [...new Set(indices)].sort((a, b) => a - b);
    return uniqueIndices.length > 0 ? uniqueIndices : [0];
  });

  // Watch only the clauseEnabled field using useWatch
  const clauseEnabled = useWatch({
    control,
    name: "clauseEnabled",
    defaultValue: "no",
  });

  // Simple toggle options
  const toggleOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  // Add clause handler
  const addClause = () => {
    const nextId = Math.max(...clauseIds) + 1;
    setClauseIds([...clauseIds, nextId]);
  };

  // Remove clause handler
  const removeClause = (id: number) => {
    if (clauseIds.length > 1) {
      setClauseIds(clauseIds.filter((clauseId) => clauseId !== id));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Additional Clauses</h2>

      {/* Toggle section */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-medium">
          Would you like to add any additional clauses to this offer?
        </h3>
        <Controller
          name="clauseEnabled"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {toggleOptions.map((option) => (
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
                </div>
              ))}
            </div>
          )}
        />
      </div>

      {/* Clauses section */}
      {clauseEnabled === "yes" && (
        <div className="space-y-6">
          {clauseIds.map((id) => (
            <div
              key={`clause-${id}`}
              className="rounded-lg bg-white p-6 shadow"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {id === 0 ? "Clause" : `Clause ${id + 1}`}
                </h3>
                {id > 0 && (
                  <button
                    type="button"
                    onClick={() => removeClause(id)}
                    className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Remove clause"
                  >
                    Remove
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Controller
                    name={`clause-title-${id}`}
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Clause Title
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="e.g. Home Inspection, Financing Contingency"
                          {...field}
                        />
                      </div>
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name={`clause-content-${id}`}
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Clause Content
                        </label>
                        <textarea
                          rows={5}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="Enter the details of this clause..."
                          {...field}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          ))}

          {clauseIds.length < 10 && (
            <button
              type="button"
              onClick={addClause}
              className="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              + Add another clause
            </button>
          )}
        </div>
      )}
    </div>
  );
}; 