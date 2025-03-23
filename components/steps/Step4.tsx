// Step4.tsx
import React, { useState } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  KeyIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

interface Step4Props {
  currentSubstep: number;
  isLocked?: boolean;
  handleSetStep: (step: number, substep: number) => void;
}

const Step4: React.FC<Step4Props> = ({
  currentSubstep,
  isLocked,
  handleSetStep,
}) => {
  const { control, watch } = useFormContext();
  const hasConditions = watch("hasConditions");

  // Define option configurations
  const depositMethodOptions = [
    { value: "Cash", label: "Cash", icon: CurrencyDollarIcon },
    {
      value: "Personal check",
      label: "Personal check",
      icon: DocumentTextIcon,
    },
    { value: "Bank draft", label: "Bank draft", icon: ReceiptRefundIcon },
    {
      value: "Certified check",
      label: "Certified check",
      icon: CreditCardIcon,
    },
    {
      value: "Other",
      label: "Other",
      icon: QuestionMarkCircleIcon,
      hasTextField: true,
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
      hasDateField: true,
      dateFieldName: "closingDate",
      dateFieldLabel: "Closing (Funding) Date",
    },
    {
      value: "Before funding, under a temporary lease",
      label: "Before funding, under a temporary lease",
      icon: DocumentTextIcon,
      hasDateField: true,
      dateFieldName: "possessionDate",
      dateFieldLabel: "Possession Date",
      secondDateField: {
        name: "closingDate",
        label: "Closing (Funding) Date",
      },
    },
  ];

  const conditionsOptions = [
    { value: "Yes", label: "Yes", icon: ClipboardDocumentCheckIcon },
    { value: "No", label: "No", icon: QuestionMarkCircleIcon },
  ];

  // Add this new component for date fields
  const DateField = ({ name, label }: { name: string; label?: string }) => {
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
                field.onChange(e);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        />
      </div>
    );
  };

  // Render radio options with conditional text fields
  const renderRadioOptions = (
    name: string,
    options: any[],
    textFieldName?: string,
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
                          onChange={textField.onChange}
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
                        onChange={textField2.onChange}
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

  // Render money input field
  const renderMoneyField = (
    name: string,
    label: string,
    placeholder: string,
  ) => (
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
                // Format as currency, remove non-numeric
                const value = e.target.value.replace(/[^\d.]/g, "");
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

    return (
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium">
            Which conditions must be satisfied?
          </h3>
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
    const [openConditions, setOpenConditions] = useState<{
      [key: string]: boolean;
    }>({});

    const toggleCondition = (conditionKey: string) => {
      setOpenConditions((prev) => ({
        ...prev,
        [conditionKey]: !prev[conditionKey],
      }));
    };

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Condition Details</h2>

        {/* Loan Condition Details */}
        {conditionsValues.newLoan && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("newLoan")}
            >
              New Loan Details
            </h3>
            {openConditions.newLoan && (
              <div className="space-y-4">
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
                          onChange={(e) => field.onChange(e.target.value)}
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
                        onChange={(e) => field.onChange(e.target.value)}
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
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                />

                <Controller
                  name="loanCondition.amortizationPeriod"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        The amortization period is
                      </label>
                      <input
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="years"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      <span className="text-sm text-gray-500">years.</span>
                    </div>
                  )}
                />

                <Controller
                  name="loanCondition.applicationTime"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        The maximum time for a new loan application is
                      </label>
                      <input
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="days"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      <span className="text-sm text-gray-500">days.</span>
                    </div>
                  )}
                />

                <Controller
                  name="loanCondition.furtherConditions"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          id="further-conditions"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="further-conditions"
                          className="font-medium text-gray-700"
                        >
                          Are there further loan conditions that need to be
                          satisfied?
                        </label>
                      </div>
                    </div>
                  )}
                />

                {conditionsValues.loanCondition &&
                  conditionsValues.loanCondition.furtherConditions && (
                    <Controller
                      name="loanCondition.furtherConditionsDetails"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Conditions:
                          </label>
                          <textarea
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="e.g. Loan will require a credit score approval check"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </div>
                      )}
                    />
                  )}
              </div>
            )}
          </div>
        )}

        {/* Assume Loan Condition Details */}
        {conditionsValues.assumeLoan && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("assumeLoan")}
            >
              Loan Assumption Details
            </h3>
            {openConditions.assumeLoan && (
              <div className="space-y-4">
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
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="assumeLoanCondition.details"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Assumption Requirements
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Specify any specific assumption requirements"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
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
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Third Party Approval Details */}
        {conditionsValues.thirdPartyApproval && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("thirdPartyApproval")}
            >
              Third Party Approval Details
            </h3>
            {openConditions.thirdPartyApproval && (
              <div className="space-y-4">
                <Controller
                  name="thirdPartyApprovalCondition.partyName"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Third Party Name/Entity
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="e.g. HOA, Co-owner"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="thirdPartyApprovalCondition.details"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Approval Requirements
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Specify any specific approval requirements"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="thirdPartyApprovalCondition.deadline"
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
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Buyer Sells Property Details */}
        {conditionsValues.sellProperty && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("sellProperty")}
            >
              Property Sale Details
            </h3>
            {openConditions.sellProperty && (
              <div className="space-y-4">
                <Controller
                  name="sellPropertyCondition.address"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Property Address to be Sold
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Enter property address"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="sellPropertyCondition.deadline"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sale Deadline
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="sellPropertyCondition.details"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Requirements
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Any other conditions related to the property sale"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Disclosure Form Details */}
        {conditionsValues.disclosureForm && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("disclosureForm")}
            >
              Disclosure Form Details
            </h3>
            {openConditions.disclosureForm && (
              <div className="space-y-4">
                <Controller
                  name="disclosureFormCondition.formType"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Type of Disclosure Form
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="e.g. Seller's Property Disclosure"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="disclosureFormCondition.details"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Specific Requirements
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Specify any disclosure requirements or concerns"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Loan Approval Details */}
        {conditionsValues.loanApproval && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("loanApproval")}
            >
              Loan Approval Details
            </h3>
            {openConditions.loanApproval && (
              <div className="space-y-4">
                <Controller
                  name="loanApprovalCondition.loanType"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Type of Loan
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="e.g. Conventional, FHA, VA"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="loanApprovalCondition.details"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Approval Requirements
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Specify any approval requirements"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="loanApprovalCondition.deadline"
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
                          field.onChange(e);
                        }}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Local Ordinance Documents Details */}
        {conditionsValues.localOrdinanceDocuments && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("localOrdinanceDocuments")}
            >
              Local Ordinance Documents
            </h3>
            {openConditions.localOrdinanceDocuments && (
              <div className="space-y-4">
                <Controller
                  name="localOrdinanceDocumentsCondition.documentTypes"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Required Documents
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="List required documents (e.g. zoning permits, certificates of occupancy)"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="localOrdinanceDocumentsCondition.deadline"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Submission Deadline
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Market Value Appraisal Details */}
        {conditionsValues.marketValueAppraisal && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("marketValueAppraisal")}
            >
              Appraisal Details
            </h3>
            {openConditions.marketValueAppraisal && (
              <div className="space-y-4">
                <Controller
                  name="marketValueAppraisalCondition.minimumValue"
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
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                />

                <Controller
                  name="marketValueAppraisalCondition.appraiserRequirements"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Appraiser Requirements
                      </label>
                      <textarea
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Any specific requirements for the appraiser"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="marketValueAppraisalCondition.deadline"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Appraisal Deadline
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Proof of Marketable Title Details */}
        {conditionsValues.proofOfMarketableTitle && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("proofOfMarketableTitle")}
            >
              Title Requirements
            </h3>
            {openConditions.proofOfMarketableTitle && (
              <div className="space-y-4">
                <Controller
                  name="proofOfMarketableTitleCondition.titleCompany"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Preferred Title Company
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="e.g. First American Title"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="proofOfMarketableTitleCondition.requirements"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title Requirements
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Specify any title requirements or exceptions"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="proofOfMarketableTitleCondition.deadline"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title Verification Deadline
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Property Zoning Details */}
        {conditionsValues.properlyZoned && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("properlyZoned")}
            >
              Zoning Requirements
            </h3>
            {openConditions.properlyZoned && (
              <div className="space-y-4">
                <Controller
                  name="properlyZonedCondition.requiredZoning"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Required Zoning Classification
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="e.g. Residential, Commercial"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="properlyZonedCondition.intendedUse"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Intended Use of Property
                      </label>
                      <textarea
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Describe the intended use of the property"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="properlyZonedCondition.verificationDeadline"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Verification Deadline
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Home Inspection Details */}
        {conditionsValues.satisfactoryHomeInspection && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("satisfactoryHomeInspection")}
            >
              Home Inspection Details
            </h3>
            {openConditions.satisfactoryHomeInspection && (
              <div className="space-y-4">
                <Controller
                  name="satisfactoryHomeInspectionCondition.inspectorRequirements"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Inspector Requirements
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="e.g. Licensed, Certified"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="satisfactoryHomeInspectionCondition.areas"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Areas to be Inspected
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="List specific areas requiring inspection (e.g. roof, foundation, HVAC)"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="satisfactoryHomeInspectionCondition.deadline"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Inspection Deadline
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Specific Property Repairs Details */}
        {conditionsValues.specificPropertyRepairs && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3
              className="mb-4 cursor-pointer text-xl font-semibold"
              onClick={() => toggleCondition("specificPropertyRepairs")}
            >
              Property Repairs Requirements
            </h3>
            {openConditions.specificPropertyRepairs && (
              <div className="space-y-4">
                <Controller
                  name="specificPropertyRepairsCondition.repairs"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Required Repairs
                      </label>
                      <textarea
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="List specific repairs required (e.g. fix roof leak, replace HVAC system)"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="specificPropertyRepairsCondition.responsible"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Party Responsible for Repairs
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={field.value || ""}
                        onChange={field.onChange}
                      >
                        <option value="">Select responsible party</option>
                        <option value="seller">Seller</option>
                        <option value="buyer">Buyer</option>
                        <option value="shared">Shared Responsibility</option>
                      </select>
                    </div>
                  )}
                />

                <Controller
                  name="specificPropertyRepairsCondition.deadline"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Repairs Completion Deadline
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="specificPropertyRepairsCondition.budget"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Maximum Repair Budget
                      </label>
                      <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500">$</span>
                        </div>
                        <input
                          type="text"
                          className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="e.g. 5,000"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
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

  return (
    <div className="space-y-8">
      {currentSubstep === 1 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Purchase Price</h2>
          {renderMoneyField(
            "purchasePrice",
            "What is the purchase price?",
            "e.g. 250,000",
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
              "e.g. 20,000",
            )}
          </div>

          <div className="mt-6">
            <h3 className="mb-2 text-lg font-medium">
              How will the deposit be paid?
            </h3>
            {renderRadioOptions(
              "depositMethod",
              depositMethodOptions,
              "depositMethodOther",
            )}
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
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            )}
          </div>
        </>
      )}

      {currentSubstep === 3 && (
        <>
          <h2 className="mb-4 text-2xl font-bold">Escrow Agent</h2>
          <h3 className="mb-2 text-lg font-medium">
            Who will hold the deposit until the deal is closed?
          </h3>
          {renderRadioOptions("escrowAgent", escrowAgentOptions)}
        </>
      )}

      {currentSubstep === 4 && (
        <>
          <h2 className="mb-4 text-2xl font-bold">Closing and Possession</h2>
          <h3 className="mb-2 text-lg font-medium">
            When will the seller provide possession?
          </h3>
          {renderRadioOptions("possession", possessionOptions)}
        </>
      )}

      {currentSubstep === 5 && (
        <>
          <h2 className="mb-4 text-2xl font-bold">Conditions</h2>
          <h3 className="mb-2 text-lg font-medium">
            Is this offer subject to any conditions?
          </h3>
          {renderRadioOptions("hasConditions", conditionsOptions)}

          {hasConditions === "Yes" && <ConditionDetails />}
        </>
      )}

      {currentSubstep === 6 && (
        <>
          {hasConditions === "Yes" ? (
            <AdditionalConditionDetails />
          ) : (
            <AdditionalClauses />
          )}
        </>
      )}

      {currentSubstep === 7 && hasConditions === "Yes" && <AdditionalClauses />}

      {((currentSubstep === 8 && hasConditions === "Yes") ||
        (currentSubstep === 7 && hasConditions === "No")) && (
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
      )}
    </div>
  );
};

export default Step4;
