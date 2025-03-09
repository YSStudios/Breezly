// Step4.tsx
import React, { useState, useEffect } from "react";
import FormQuestion from "../shared/FormQuestion";
import NumberField from "../shared/NumberField";
import { StepProps, Question } from "../types";
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
import ConditionDetails from "./ConditionDetails";

const Step4: React.FC<StepProps> = ({
  currentSubstep,
  onInputChange,
  formData,
}) => {
  // Helper function to process the conditions from form data
  const processConditionsFromFormData = (data: any): string[] => {
    // First check for the array version (preferred for checkboxes)
    if (data.conditions_array) {
      if (typeof data.conditions_array === "string") {
        return data.conditions_array
          .split(",")
          .filter((c: string) => c.trim() !== "");
      }
      if (Array.isArray(data.conditions_array)) {
        return data.conditions_array;
      }
    }

    // Fall back to the string version
    if (data.conditions) {
      if (typeof data.conditions === "string") {
        return data.conditions
          .split(",")
          .filter((c: string) => c.trim() !== "");
      }
    }

    return [];
  };

  // Initialize state from formData
  const [purchasePrice, setPurchasePrice] = useState<number | null>(
    formData.purchasePrice ? Number(formData.purchasePrice) : null,
  );
  const [depositAmount, setDepositAmount] = useState<number | null>(
    formData.depositAmount ? Number(formData.depositAmount) : null,
  );
  const [depositMethod, setDepositMethod] = useState<string>(
    formData.depositMethod || "",
  );
  const [depositDueDate, setDepositDueDate] = useState<string>(
    formData.depositDueDate || "",
  );
  const [escrowAgent, setEscrowAgent] = useState<string>(
    formData.escrowAgent || "",
  );
  const [escrowAgentName, setEscrowAgentName] = useState<string>("");
  const [possession, setPossession] = useState<string>(
    formData.possession || "",
  );
  const [closingDate, setClosingDate] = useState<string>(
    formData.closingDate || "",
  );
  const [hasConditions, setHasConditions] = useState<string>(
    formData.hasConditions || "",
  );
  // Initialize with processed conditions
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    processConditionsFromFormData(formData),
  );
  const [completionDate, setCompletionDate] = useState<string>(
    formData.completionDate || "",
  );
  const [acceptanceDeadline, setAcceptanceDeadline] = useState<string>(
    formData.acceptanceDeadline || "",
  );
  const [additionalClauses, setAdditionalClauses] = useState<string[]>(
    formData.additionalClauses
      ? typeof formData.additionalClauses === "string"
        ? formData.additionalClauses.split("|")
        : formData.additionalClauses
      : [],
  );

  // Initialize checkbox state from formData when it changes
  useEffect(() => {
    if (formData.hasConditions) {
      setHasConditions(formData.hasConditions);
    }

    // Update selected conditions when formData changes
    setSelectedConditions(processConditionsFromFormData(formData));
  }, [formData]);

  const handlePurchasePriceChange = (value: number | null) => {
    setPurchasePrice(value);
    onInputChange("purchasePrice", value !== null ? value.toString() : "");
  };

  const handleDepositAmountChange = (value: number | null) => {
    setDepositAmount(value);
    onInputChange("depositAmount", value !== null ? value.toString() : "");
  };

  const handleDepositMethodChange = (
    questionId: string,
    value: string,
    textFields?: { [key: number]: string },
  ) => {
    setDepositMethod(value);
    if (value === "Other" && textFields && textFields[0]) {
      onInputChange("depositMethod", `Other: ${textFields[0]}`);
    } else {
      onInputChange("depositMethod", value);
    }
  };

  const handleDepositDueDateChange = (
    questionId: string,
    value: string,
    textFields?: { [key: number]: string },
  ) => {
    if (value === "Specify date" && textFields && textFields[0]) {
      setDepositDueDate(textFields[0]);
      onInputChange("depositDueDate", textFields[0]);
    } else {
      setDepositDueDate(value);
      onInputChange("depositDueDate", value);
    }
  };

  const handleEscrowAgentChange = (
    questionId: string,
    value: string,
    textFields?: { [key: number]: string },
  ) => {
    setEscrowAgent(value);
    onInputChange("escrowAgent", value);
    if (textFields && textFields[0]) {
      setEscrowAgentName(textFields[0]);
      onInputChange("escrowAgentName", textFields[0]);
    }
  };

  const handlePossessionChange = (
    questionId: string,
    value: string,
    textFields?: { [key: number]: string },
  ) => {
    setPossession(value);
    onInputChange("possession", value);
    if (textFields) {
      if (value === "Upon closing and funding") {
        setClosingDate(textFields[0]);
        onInputChange("closingDate", textFields[0]);
      } else if (value === "Before funding, under a temporary lease") {
        onInputChange("possessionDate", textFields[0]);
        setClosingDate(textFields[1]);
        onInputChange("closingDate", textFields[1]);
      }
    }
  };

  const handleConditionsChange = (questionId: string, value: string) => {
    setHasConditions(value);
    onInputChange("hasConditions", value);
  };

  const handleSpecificConditionsChange = (
    questionId: string,
    value: string,
  ) => {
    console.log("Conditions changed:", value);

    // Convert to array - the value will be a comma-separated string
    const selectedConditions = value
      ? value.split(",").filter((c) => c.trim() !== "")
      : [];

    setSelectedConditions(selectedConditions);

    // Save both formats - string for display and array for easier data handling
    onInputChange("conditions", value);

    // Log what's being saved
    console.log("Saving conditions:", value);
  };

  const handleCompletionDateChange = (
    questionId: string,
    value: string,
    textFields?: { [key: number]: string },
  ) => {
    if (textFields && textFields[0]) {
      setCompletionDate(textFields[0]);
      onInputChange("completionDate", textFields[0]);
    }
  };

  const handleAcceptanceDeadlineChange = (
    questionId: string,
    value: string,
    textFields?: { [key: number]: string },
  ) => {
    if (textFields && textFields[0]) {
      setAcceptanceDeadline(textFields[0]);
      onInputChange("acceptanceDeadline", textFields[0]);
    }
  };

  const handleAddClause = () => {
    if (additionalClauses.length < 10) {
      setAdditionalClauses([...additionalClauses, ""]);
    }
  };

  const handleRemoveClause = (index: number) => {
    if (additionalClauses.length > 1) {
      const newClauses = additionalClauses.filter((_, i) => i !== index);
      setAdditionalClauses(newClauses);
      onInputChange("additionalClauses", JSON.stringify(newClauses));
    }
  };

  const handleClauseChange = (index: number, value: string) => {
    const newClauses = [...additionalClauses];
    newClauses[index] = value;
    setAdditionalClauses(newClauses);
    onInputChange("additionalClauses", JSON.stringify(newClauses));
  };

  const depositMethodQuestion: Question = {
    id: "depositMethod",
    description: "How will the deposit be paid?",
    tooltip:
      "Select the method you will use to pay the deposit. This should be a secure form of payment that can be verified by all parties.",
    options: [
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
        textFields: [
          {
            type: "text",
            label: "Payment Type",
            placeholder: "e.g. Electronic funds transfer",
          },
        ],
      },
    ],
  };

  const depositDueDateQuestion: Question = {
    id: "depositDueDate",
    description: "When is the deposit due?",
    tooltip:
      "Specify when you will provide the deposit. This is typically within 24-72 hours of offer acceptance.",
    options: [
      { value: "Unsure", label: "Unsure", icon: QuestionMarkCircleIcon },
      {
        value: "Specify date",
        label: "Specify date",
        icon: CalendarIcon,
        textFields: [{ type: "date", label: "Deposit Due Date" }],
      },
    ],
  };

  const escrowAgentQuestion: Question = {
    id: "escrowAgent",
    description: "Who will hold the deposit until the deal is closed?",
    tooltip:
      "An escrow agent is a neutral third party who holds the deposit money until closing. This can be a title company, real estate broker, or attorney.",
    options: [
      {
        value: "Individual",
        label: "Individual",
        icon: UserIcon,
        textFields: [{ placeholder: "e.g. Morgan Leigh Brown" }],
      },
      {
        value: "Corporation/Organization",
        label: "Corporation/Organization",
        icon: BuildingOfficeIcon,
        textFields: [{ placeholder: "Full Name" }],
      },
    ],
  };

  const possessionQuestion: Question = {
    id: "possession",
    description: "When will the seller provide possession?",
    tooltip:
      "Specify when you will take possession of the property. This is typically upon closing and funding, but can be negotiated for earlier or later dates.",
    options: [
      {
        value: "Upon closing and funding",
        label: "Upon closing and funding",
        icon: KeyIcon,
        textFields: [{ type: "date", label: "Closing (Funding) Date" }],
      },
      {
        value: "Before funding, under a temporary lease",
        label: "Before funding, under a temporary lease",
        icon: DocumentTextIcon,
        textFields: [
          { type: "date", label: "Possession Date" },
          { type: "date", label: "Closing (Funding) Date" },
        ],
      },
    ],
  };

  const conditionsQuestion: Question = {
    id: "hasConditions",
    description: "Is this offer subject to any conditions?",
    tooltip:
      "Conditions (also called contingencies) protect the buyer by making the offer dependent on certain requirements being met, such as a satisfactory home inspection or mortgage approval.",
    options: [
      { value: "Yes", label: "Yes", icon: ClipboardDocumentCheckIcon },
      { value: "No", label: "No", icon: QuestionMarkCircleIcon },
    ],
  };

  const specificConditionsQuestion: Question = {
    id: "conditions",
    description: "Which conditions must be satisfied?",
    tooltip:
      "Select all conditions that must be met before the sale can proceed. These protect your interests as a buyer but may make your offer less competitive.",
    multiSelect: true,
    options: [
      {
        value: "Buyer must obtain a new loan",
        label: "Buyer must obtain a new loan",
      },
      {
        value: "Buyer must receive approval to assume existing loan",
        label: "Buyer must receive approval to assume existing loan",
      },
      {
        value: "Buyer must receive third party approval",
        label: "Buyer must receive third party approval",
      },
      {
        value: "Buyer sells their property",
        label: "Buyer sells their property",
      },
      { value: "Disclosure form", label: "Disclosure form" },
      { value: "Loan approval", label: "Loan approval" },
      {
        value: "Local ordinance documents",
        label: "Local ordinance documents",
      },
      { value: "Market value appraisal", label: "Market value appraisal" },
      {
        value: "Proof of marketable title",
        label: "Proof of marketable title",
      },
      {
        value: "Property is properly zoned",
        label: "Property is properly zoned",
      },
      {
        value: "Satisfactory home inspection",
        label: "Satisfactory home inspection",
      },
      {
        value: "Specific property repairs",
        label: "Specific property repairs",
      },
      {
        value: "Other conditions not listed here",
        label: "Other conditions not listed here",
      },
    ],
  };

  const completionDateQuestion: Question = {
    id: "completionDate",
    description: "When do the conditions have to be completed by?",
    tooltip:
      "This is the deadline for all conditions to be satisfied. Typically 7-14 days after offer acceptance for most conditions.",
    options: [
      {
        value: "date",
        label: "Select date",
        textFields: [{ type: "date", label: "Completion Date" }],
      },
    ],
  };

  const acceptanceQuestion: Question = {
    id: "acceptance",
    description: "What is the deadline for the seller to accept this offer?",
    tooltip:
      "Set a deadline for the seller to respond to your offer. This is typically 24-48 hours from when you submit the offer.",
    options: [
      {
        value: "deadline",
        label: "Acceptance Deadline:",
        textFields: [{ type: "date", label: "Acceptance Deadline" }],
      },
    ],
  };

  // Add a useEffect to log the form data and selected conditions whenever they change
  useEffect(() => {
    console.log("Current formData.conditions:", formData.conditions);
    console.log("Current selectedConditions:", selectedConditions);
  }, [formData.conditions, selectedConditions]);

  return (
    <div className="space-y-8">
      {currentSubstep === 1 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Purchase Price</h2>
          <NumberField
            id="purchasePrice"
            label="What is the purchase price?"
            placeholder="e.g. 250,000"
            prefix="$"
            value={purchasePrice}
            onChange={handlePurchasePriceChange}
          />
        </div>
      )}

      {currentSubstep === 2 && (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-bold">Deposit</h2>
            <NumberField
              id="depositAmount"
              label="How much is the initial deposit?"
              placeholder="e.g. 20,000"
              prefix="$"
              value={depositAmount}
              onChange={handleDepositAmountChange}
            />
          </div>
          {depositAmount !== null && purchasePrice !== null && (
            <p className="mt-1 text-sm text-gray-500">
              Balance owing: ${(purchasePrice - depositAmount).toLocaleString()}
            </p>
          )}
          <FormQuestion
            question={depositMethodQuestion}
            onChange={handleDepositMethodChange}
            initialValue={depositMethod}
            initialTextFieldValues={
              depositMethod.startsWith("Other:")
                ? { 0: depositMethod.split(": ")[1] }
                : {}
            }
          />
          <FormQuestion
            question={depositDueDateQuestion}
            onChange={handleDepositDueDateChange}
            initialValue={depositDueDate ? "Specify date" : "Unsure"}
            initialTextFieldValues={{ 0: depositDueDate }}
          />
        </>
      )}

      {currentSubstep === 3 && (
        <>
          <h2 className="mb-4 text-2xl font-bold">Escrow Agent</h2>
          <FormQuestion
            question={escrowAgentQuestion}
            onChange={handleEscrowAgentChange}
            initialValue={escrowAgent}
            initialTextFieldValues={{ 0: escrowAgentName }}
          />
        </>
      )}

      {currentSubstep === 4 && (
        <>
          <h2 className="mb-4 text-2xl font-bold">Closing and Possession</h2>
          <FormQuestion
            question={possessionQuestion}
            onChange={handlePossessionChange}
            initialValue={possession}
            initialTextFieldValues={
              possession === "Upon closing and funding"
                ? { 0: closingDate }
                : possession === "Before funding, under a temporary lease"
                ? { 0: formData.possessionDate, 1: closingDate }
                : {}
            }
          />
        </>
      )}

      {currentSubstep === 5 && (
        <>
          <h2 className="mb-4 text-2xl font-bold">Conditions</h2>
          <FormQuestion
            question={conditionsQuestion}
            onChange={handleConditionsChange}
            initialValue={hasConditions}
          />
          {hasConditions === "Yes" && (
            <>
              <FormQuestion
                question={specificConditionsQuestion}
                onChange={handleSpecificConditionsChange}
                initialValue={
                  formData.conditions || selectedConditions.join(",")
                }
                key={`conditions-${
                  formData.conditions || selectedConditions.join(",")
                }`}
              />
              <FormQuestion
                question={completionDateQuestion}
                onChange={handleCompletionDateChange}
                initialValue={completionDate ? "date" : ""}
                initialTextFieldValues={{ 0: completionDate }}
              />
            </>
          )}
        </>
      )}

      {currentSubstep === 6 && (
        <ConditionDetails
          selectedConditions={selectedConditions}
          onInputChange={onInputChange}
          formData={formData}
        />
      )}

      {currentSubstep === 7 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Additional Clauses
          </h2>
          {additionalClauses.map((clause, index) => (
            <div key={index} className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Clause {index + 1}
                </h3>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveClause(index)}
                    className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label={`Remove Clause ${index + 1}`}
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
              <textarea
                id={`clause-${index}`}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter clause text here"
                value={clause}
                onChange={(e) => handleClauseChange(index, e.target.value)}
              />
            </div>
          ))}
          {additionalClauses.length < 10 && (
            <button
              type="button"
              onClick={handleAddClause}
              className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Another Clause
            </button>
          )}
        </div>
      )}

      {currentSubstep === 8 && (
        <FormQuestion
          question={acceptanceQuestion}
          onChange={handleAcceptanceDeadlineChange}
          title="Acceptance"
          initialValue={acceptanceDeadline ? "deadline" : ""}
          initialTextFieldValues={{ 0: acceptanceDeadline }}
        />
      )}
    </div>
  );
};

export default Step4;
