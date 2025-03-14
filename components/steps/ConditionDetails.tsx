// ConditionDetails.tsx
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

const ConditionDetails: React.FC = () => {
  const { control, watch } = useFormContext();
  
  const conditions = [
    { value: "newLoan", label: "Buyer must obtain a new loan" },
    { value: "assumeLoan", label: "Buyer must receive approval to assume existing loan" },
    { value: "inspection", label: "Property inspection" },
    { value: "appraisal", label: "Property appraisal" },
    { value: "titleSearch", label: "Title search" },
    { value: "sellerDisclosure", label: "Seller disclosure" },
  ];

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium">Which conditions must be satisfied?</h3>
        <div className="mt-2 space-y-2">
          {conditions.map((condition) => (
            <Controller
              key={condition.value}
              name={`conditions.${condition.value}`}
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      id={`condition-${condition.value}`}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor={`condition-${condition.value}`}
                      className="font-medium text-gray-700"
                    >
                      {condition.label}
                    </label>
                  </div>
                </div>
              )}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium">When do the conditions have to be completed by?</h3>
        <Controller
          name="completionDate"
          control={control}
          render={({ field }) => (
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              {...field}
            />
          )}
        />
      </div>
    </div>
  );
};

export default ConditionDetails;
