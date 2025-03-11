// Step4.tsx
import React, { useState } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  KeyIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import DynamicFormSection from "../ui/DynamicFormSection";

interface Step4Props {
  currentSubstep: number;
  isLocked?: boolean;
}

const Step4: React.FC<Step4Props> = ({ currentSubstep, isLocked }) => {
  const { control, watch, setValue, getValues } = useFormContext();
  
  // Watch values for conditional rendering
  const depositMethod = watch("depositMethod");
  const hasConditions = watch("hasConditions");
  
  // Define option configurations
  const depositMethodOptions = [
      { value: "Cash", label: "Cash", icon: CurrencyDollarIcon },
    { value: "Personal check", label: "Personal check", icon: DocumentTextIcon },
      { value: "Bank draft", label: "Bank draft", icon: ReceiptRefundIcon },
    { value: "Certified check", label: "Certified check", icon: CreditCardIcon },
      {
        value: "Other",
        label: "Other",
        icon: QuestionMarkCircleIcon,
      hasTextField: true,
    },
  ];

  const depositDueDateOptions = [
      { value: "Unsure", label: "Unsure", icon: QuestionMarkCircleIcon },
      {
        value: "Specify date",
        label: "Specify date",
        icon: CalendarIcon,
      hasTextField: true,
      textFieldType: "date",
      textFieldName: "depositDueDate",
    },
  ];

  const escrowAgentOptions = [
      {
        value: "Individual",
        label: "Individual",
        icon: UserIcon,
      hasTextField: true,
      textFieldName: "escrowAgentName",
      textFieldPlaceholder: "e.g. Morgan Leigh Brown",
      },
      {
        value: "Corporation/Organization",
        label: "Corporation/Organization",
        icon: BuildingOfficeIcon,
      hasTextField: true,
      textFieldName: "escrowAgentName",
      textFieldPlaceholder: "Full Name",
    },
  ];

  const possessionOptions = [
      {
        value: "Upon closing and funding",
        label: "Upon closing and funding",
        icon: KeyIcon,
      hasTextField: true,
      textFieldType: "date",
      textFieldName: "closingDate",
      textFieldLabel: "Closing (Funding) Date",
      },
      {
        value: "Before funding, under a temporary lease",
        label: "Before funding, under a temporary lease",
        icon: DocumentTextIcon,
      hasTextField: true,
      textFieldType: "date",
      textFieldName: "possessionDate",
      textFieldLabel: "Possession Date",
      secondTextField: {
        type: "date",
        name: "closingDate",
        label: "Closing (Funding) Date",
      },
    },
  ];

  const conditionsOptions = [
      { value: "Yes", label: "Yes", icon: ClipboardDocumentCheckIcon },
      { value: "No", label: "No", icon: QuestionMarkCircleIcon },
  ];

  const additionalClauseOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const acceptanceOptions = [
      {
        value: "deadline",
      label: "Acceptance Deadline",
      hasTextField: true,
      textFieldType: "date",
      textFieldName: "acceptanceDeadline",
      textFieldLabel: "When is the deadline for acceptance?",
    },
  ];

  // Render radio options with conditional text fields
  const renderRadioOptions = (
    name: string,
    options: any[],
    textFieldName?: string
  ) => (
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
                <label className="ml-3 cursor-pointer text-lg font-medium text-gray-700">
                  {option.label}
                </label>
              </div>

              {option.hasTextField && field.value === option.value && (
                <div className="mt-4">
                  {option.textFieldLabel && (
                    <label className="block text-sm font-medium text-gray-700">
                      {option.textFieldLabel}
                    </label>
                  )}
                  <Controller
                    name={option.textFieldName || textFieldName || `${name}Other`}
                    control={control}
                    render={({ field: textField }) => (
                      <input
                        type={option.textFieldType || "text"}
                        placeholder={option.textFieldPlaceholder || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        {...textField}
                      />
                    )}
                  />
                  
                  {option.secondTextField && (
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
                            {...textField2}
                          />
                        )}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    />
  );

  // Render money input field
  const renderMoneyField = (name: string, label: string, placeholder: string) => (
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
              value={field.value || ''}
              onChange={(e) => {
                // Format as currency, remove non-numeric
                const value = e.target.value.replace(/[^\d.]/g, '');
                field.onChange(value);
              }}
            />
          </div>
        </div>
      )}
    />
  );

  // Render ConditionDetails component
  const ConditionDetails = () => {
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

  // Render additional conditions component with loan details, inspection, appraisal, etc.
  const AdditionalConditionDetails = () => {
    // Check if conditions are selected
    const conditionsValues = watch("conditions") || {};
    
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Condition Details</h2>
        
        {/* Loan Condition Details */}
        {conditionsValues.newLoan && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold">Loan Conditions</h3>
            <div className="space-y-4">
              <Controller
                name="loanCondition.amount"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Loan Amount
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="e.g. 200,000"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </div>
                  </div>
                )}
              />
              
              <Controller
                name="loanCondition.interestRate"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Maximum Interest Rate
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 pr-7 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="e.g. 4.5"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        )}
        
        {/* Inspection Condition Details */}
        {conditionsValues.inspection && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold">Inspection Details</h3>
            <Controller
              name="inspectionCondition.details"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Inspection Requirements
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Specify any specific inspection requirements"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </div>
              )}
            />
          </div>
        )}
        
        {/* Appraisal Condition Details */}
        {conditionsValues.appraisal && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold">Appraisal Details</h3>
            <Controller
              name="appraisalCondition.minimumValue"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Appraisal Value
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="e.g. 250,000"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </div>
                </div>
              )}
            />
          </div>
        )}
      </div>
    );
  };

  // Render additional clauses component
  const AdditionalClauses = () => {
    const { control, getValues } = useFormContext();
    
    // Initialize clauseIds based on existing form data
    const [clauseIds, setClauseIds] = useState<number[]>(() => {
      const formValues = getValues();
      const clauseKeys = Object.keys(formValues || {})
        .filter(key => key.startsWith('clause-title-') || key.startsWith('clause-content-'));
      
      if (clauseKeys.length === 0) {
        return [0];
      }
      
      // Extract indices from field names
      const indices = clauseKeys.map(key => {
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
        setClauseIds(clauseIds.filter(clauseId => clauseId !== id));
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Additional Clauses</h2>
        
        {/* Toggle section */}
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-medium">Would you like to add any additional clauses to this offer?</h3>
          <Controller
            name="clauseEnabled"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {toggleOptions.map(option => (
                  <div
                    key={option.value}
                    className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 ${
                      field.value === option.value ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                    }`}
                    onClick={() => field.onChange(option.value)}
                  >
                    <div className="flex items-start">
                      <div 
                        className={`relative h-5 w-5 flex-shrink-0 rounded-full ${
                          field.value === option.value ? "bg-emerald-500 border-emerald-500" : "bg-white border-2 border-gray-300"
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
              <div key={`clause-${id}`} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {id === 0 ? "Clause" : `Clause ${id + 1}`}
                  </h3>
                  {id > 0 && (
                    <button
                      type="button"
                      onClick={() => removeClause(id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      aria-label="Remove clause"
                    >
                      Remove
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                + Add another clause
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {currentSubstep === 1 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Purchase Price</h2>
          {renderMoneyField(
            "purchasePrice",
            "What is the purchase price?",
            "e.g. 250,000"
          )}
        </div>
      )}

      {currentSubstep === 2 && (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-bold">Deposit</h2>
            {renderMoneyField(
              "depositAmount",
              "How much is the initial deposit?",
              "e.g. 20,000"
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-medium">How will the deposit be paid?</h3>
            {renderRadioOptions("depositMethod", depositMethodOptions, "depositMethodOther")}
          </div>
          
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-medium">When is the deposit due?</h3>
            {renderRadioOptions("depositDueDate", depositDueDateOptions)}
          </div>
        </>
      )}

      {currentSubstep === 3 && (
        <>
          <h2 className="mb-4 text-2xl font-bold">Escrow Agent</h2>
          <h3 className="mb-2 text-lg font-medium">Who will hold the deposit until the deal is closed?</h3>
          {renderRadioOptions("escrowAgent", escrowAgentOptions)}
        </>
      )}

      {currentSubstep === 4 && (
        <>
          <h2 className="mb-4 text-2xl font-bold">Closing and Possession</h2>
          <h3 className="mb-2 text-lg font-medium">When will the seller provide possession?</h3>
          {renderRadioOptions("possession", possessionOptions)}
        </>
      )}

      {currentSubstep === 5 && (
        <>
          <h2 className="mb-4 text-2xl font-bold">Conditions</h2>
          <h3 className="mb-2 text-lg font-medium">Is this offer subject to any conditions?</h3>
          {renderRadioOptions("hasConditions", conditionsOptions)}
          
          {hasConditions === "Yes" && <ConditionDetails />}
        </>
      )}

      {currentSubstep === 6 && <AdditionalConditionDetails />}
      
      {currentSubstep === 7 && <AdditionalClauses />}

      {currentSubstep === 8 && (
        <>
          <h2 className="mb-4 text-2xl font-bold">Acceptance</h2>
          <h3 className="mb-2 text-lg font-medium">What is the deadline for the seller to accept this offer?</h3>
          {renderRadioOptions("acceptanceMethod", acceptanceOptions)}
        </>
      )}
    </div>
  );
};

export default Step4;
