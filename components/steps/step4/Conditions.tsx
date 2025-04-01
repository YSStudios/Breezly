import React, { useState, useEffect, useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { RadioOptions } from "./FormComponents";
import { CONDITIONS_OPTIONS } from "../Step4";

interface ConditionsProps {
  showConditionDetails: boolean;
}

export const Conditions: React.FC<ConditionsProps> = ({ showConditionDetails }) => {
  return (
    <>
      <h2 className="mb-4 text-2xl font-bold">Conditions</h2>
      <h3 className="mb-2 text-lg font-medium">
        Is this offer subject to any conditions?
      </h3>
      <RadioOptions name="hasConditions" options={CONDITIONS_OPTIONS} />

      {showConditionDetails && <ConditionDetails />}
    </>
  );
};

// Extracted into a separate component
const ConditionDetails: React.FC = () => {
  const { control, watch, getValues } = useFormContext();
  const [openConditions, setOpenConditions] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleCondition = (conditionKey: string, forceState?: boolean) => {
    setOpenConditions((prev) => ({
      ...prev,
      [conditionKey]: forceState !== undefined ? forceState : !prev[conditionKey],
    }));
  };

  // Define required fields for each condition type
  const requiredFields: Record<string, string[]> = {
    newLoan: ["loanCondition.amount", "loanCondition.term", "loanCondition.maxInterestRate"],
    assumeLoan: ["assumeLoanCondition.lender", "assumeLoanCondition.deadline"],
    thirdPartyApproval: ["thirdPartyCondition.approver", "thirdPartyCondition.deadline"],
    sellProperty: ["sellPropertyCondition.address", "sellPropertyCondition.deadline"],
    // Add required fields for other condition types as needed
  };

  // Check if a condition is complete
  const isConditionComplete = (conditionKey: string) => {
    if (!requiredFields[conditionKey]) return false;
    
    const values = getValues();
    return requiredFields[conditionKey].every((field: string) => {
      const value = field.split('.').reduce((obj: any, key: string) => obj?.[key], values);
      return value && value.trim !== "" && value !== undefined;
    });
  };

  const conditions = [
    { value: "newLoan", label: "Buyer must obtain a new loan" },
    {
      value: "assumeLoan",
      label: "Buyer must receive approval to assume existing loan",
    },
    {
      value: "thirdPartyApproval",
      label: "Buyer must receive third party approval",
    },
    { value: "sellProperty", label: "Buyer sells their property" },
    { value: "disclosureForm", label: "Disclosure form" },
    { value: "loanApproval", label: "Loan approval" },
    { value: "localOrdinanceDocuments", label: "Local ordinance documents" },
    { value: "marketValueAppraisal", label: "Market value appraisal" },
    { value: "proofOfMarketableTitle", label: "Proof of marketable title" },
    { value: "properlyZoned", label: "Property is properly zoned" },
    {
      value: "satisfactoryHomeInspection",
      label: "Satisfactory home inspection",
    },
    { value: "specificPropertyRepairs", label: "Specific property repairs" },
  ];

  // Watch changes specifically for opening/closing conditions
  const watchedConditions = watch("conditions");
  
  // Use useMemo to avoid creating a new object on every render
  const conditionsValues = useMemo(() => watchedConditions || {}, [watchedConditions]);

  // Auto-open condition details when newly selected, without re-rendering on every field change
  useEffect(() => {
    Object.keys(conditionsValues).forEach(key => {
      if (conditionsValues[key] && openConditions[key] === undefined) {
        setOpenConditions(prev => ({
          ...prev,
          [key]: true
        }));
      }
    });
  }, [conditionsValues, openConditions]);

  return (
    <div className="mt-6 space-y-8">
      <div>
        <h3 className="text-lg font-medium">
          Which conditions must be satisfied?
        </h3>
        <div className="mt-2 space-y-2">
          {conditions.map((condition) => {
            // Pre-compute some values for this condition
            const isSelected = conditionsValues[condition.value];
            const isComplete = isSelected && 
              requiredFields[condition.value] && 
              isConditionComplete(condition.value);
            
            return (
              <div 
                key={condition.value} 
                className={`rounded-lg border p-4 shadow-sm transition-colors ${
                  isSelected && requiredFields[condition.value] && isComplete
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-gray-200'
                }`}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    e.preventDefault();
                  }
                }}
              >
                <Controller
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
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                            if (e.target.checked) {
                              toggleCondition(condition.value, true);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          id={`condition-${condition.value}`}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor={`condition-${condition.value}`}
                          className="cursor-pointer font-medium text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle the checkbox when clicking on the label
                            const newValue = !field.value;
                            field.onChange(newValue);
                            if (newValue) {
                              toggleCondition(condition.value, true);
                            }
                          }}
                        >
                          {condition.label}
                        </label>
                      </div>
                      
                      {/* Add subtle completion indicator */}
                      {field.value && requiredFields[condition.value] && (
                        <div className="ml-auto">
                          {isComplete ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}
                />

                {/* Render condition details inline when condition is selected */}
                {isSelected && (
                  <div 
                    className={`mt-4 ml-7 ${openConditions[condition.value] ? 'block' : 'hidden'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {condition.value === "newLoan" && (
                      <NewLoanFields />
                    )}

                    {condition.value === "assumeLoan" && (
                      <AssumeLoanFields />
                    )}
                  </div>
                )}
                
                {isSelected && (
                  <div className="mt-2 ml-7 flex items-center justify-between">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleCondition(condition.value);
                      }}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                    >
                      {openConditions[condition.value] ? 'Hide details' : 'Show details'}
                    </button>
                    
                    {/* Subtle indication of completion status when collapsed */}
                    {!openConditions[condition.value] && requiredFields[condition.value] && (
                      <div className="text-sm text-gray-500">
                        {isComplete ? (
                          <span className="text-emerald-600">✓ Complete</span>
                        ) : (
                          <span className="text-gray-400">Incomplete</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">
          When do the conditions have to be completed by?
        </h3>
        <Controller
          name="completionDate"
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
    </div>
  );
};

// Further breaking down condition field components
const NewLoanFields: React.FC = () => {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-4 border-l-2 border-emerald-200 pl-4"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Controller
        name="loanCondition.amount"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              What is the loan amount?
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="e.g. 250,000"
                value={field.value || ""}
                onChange={(e) => {
                  e.stopPropagation();
                  field.onChange(e.target.value);
                }}
                onFocus={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      />

      <Controller
        name="loanCondition.term"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              The loan term is
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="months"
              value={field.value || ""}
              onChange={(e) => {
                e.stopPropagation();
                field.onChange(e.target.value);
              }}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm text-gray-500">months.</span>
          </div>
        )}
      />

      <Controller
        name="loanCondition.maxInterestRate"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              The maximum interest rate of the loan is
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500">%</span>
              </div>
              <input
                type="number"
                className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="0.00"
                value={field.value || ""}
                onChange={(e) => {
                  e.stopPropagation();
                  field.onChange(e.target.value);
                }}
                onFocus={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      />
    </div>
  );
};

const AssumeLoanFields: React.FC = () => {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-4 border-l-2 border-emerald-200 pl-4"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Controller
        name="assumeLoanCondition.lender"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Lender
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="e.g. Bank of America"
              value={field.value || ""}
              onChange={(e) => {
                e.stopPropagation();
                field.onChange(e.target.value);
              }}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      />
      
      <Controller
        name="assumeLoanCondition.deadline"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Approval Deadline
            </label>
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
          </div>
        )}
      />
    </div>
  );
}; 