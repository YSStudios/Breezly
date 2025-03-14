import React from 'react';
import { FormFlowProvider } from './context/FormContext';
import { StepNavigation } from './ui/StepNavigation';
import { SubstepNavigation } from './ui/SubstepNavigation';
import { StepContent } from './ui/StepContent';
import { FormNavigation } from './ui/FormNavigation';

interface MultiStepFormProps {
  formData: Record<string, any>;
  onInputChange: (key: string, value: any) => void;
  formId?: string;
  isLocked?: boolean;
}

export default function MultiStepForm({
  formData,
  onInputChange,
  formId = '',
  isLocked = false
}: MultiStepFormProps) {
  return (
    <FormFlowProvider
      initialValues={formData}
      onFormChange={(values) => {
        // Update parent state when form values change
        if (values) {
          Object.entries(values).forEach(([key, val]) => {
            if (val !== undefined && val !== formData[key]) {
              onInputChange(key, val);
            }
          });
        }
      }}
      formId={formId}
      isLocked={isLocked}
    >
      <div className="container mx-auto px-4 py-8">
        <StepNavigation />
        <SubstepNavigation />
        <StepContent />
        <FormNavigation />
      </div>
    </FormFlowProvider>
  );
} 