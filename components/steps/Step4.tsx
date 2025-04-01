// Step4.tsx
import React from "react";
import { useFormContext } from "react-hook-form";
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

// Use dynamic imports with require to avoid TypeScript path resolution issues
const PurchasePrice = require("./step4/PurchasePrice").PurchasePrice;
const Deposit = require("./step4/Deposit").Deposit;
const EscrowAgent = require("./step4/EscrowAgent").EscrowAgent;
const ClosingAndPossession = require("./step4/ClosingAndPossession").ClosingAndPossession;
const Conditions = require("./step4/Conditions").Conditions;
const AdditionalClauses = require("./step4/AdditionalClauses").AdditionalClauses;
const AcceptanceDeadline = require("./step4/AcceptanceDeadline").AcceptanceDeadline;

// Shared option definitions moved to a constants file
export const DEPOSIT_METHOD_OPTIONS = [
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

export const ESCROW_AGENT_OPTIONS = [
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

export const POSSESSION_OPTIONS = [
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

export const CONDITIONS_OPTIONS = [
  { value: "Yes", label: "Yes", icon: ClipboardDocumentCheckIcon },
  { value: "No", label: "No", icon: QuestionMarkCircleIcon },
];

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
  const { watch } = useFormContext();
  const hasConditions = watch("hasConditions");

  return (
    <div className="space-y-8">
      {currentSubstep === 1 && <PurchasePrice />}
      {currentSubstep === 2 && <Deposit />}
      {currentSubstep === 3 && <EscrowAgent />}
      {currentSubstep === 4 && <ClosingAndPossession />}
      {currentSubstep === 5 && (
        <Conditions showConditionDetails={hasConditions === "Yes"} />
      )}
      {currentSubstep === 6 && <AdditionalClauses />}
      {currentSubstep === 7 && <AcceptanceDeadline />}
    </div>
  );
};

export default Step4;
