import React from "react";
import { useForm, FormProvider as RHFProvider } from "react-hook-form";
import { useEffect } from "react";

// This type should match your existing formData structure
interface FormValues {
  // Basic information
  purchasePrice: string;
  
  // Deposit information
  depositAmount: string;
  depositMethod: string;
  depositDueDate: string;
  
  // Escrow information
  escrowAgent: string;
  escrowAgentName: string;
  
  // Possession information
  possession: string;
  possessionDate: string;
  closingDate: string;
  
  // Conditions
  hasConditions: string;
  conditions: string;
  completionDate: string;
  
  // Additional clauses
  additionalClauses: string[];
  
  // Acceptance
  acceptanceDeadline: string;
}

interface FormProviderProps {
  formData: Partial<FormValues>;
  onInputChange: (field: string, value: any) => void;
  children: React.ReactNode;
}

const FormProvider: React.FC<FormProviderProps> = ({
  formData,
  onInputChange,
  children,
}) => {
  const methods = useForm<FormValues>({
    defaultValues: {
      purchasePrice: formData.purchasePrice || "",
      depositAmount: formData.depositAmount || "",
      depositMethod: formData.depositMethod || "",
      depositDueDate: formData.depositDueDate || "",
      escrowAgent: formData.escrowAgent || "",
      escrowAgentName: formData.escrowAgentName || "",
      possession: formData.possession || "",
      possessionDate: formData.possessionDate || "",
      closingDate: formData.closingDate || "",
      hasConditions: formData.hasConditions || "",
      conditions: formData.conditions || "",
      completionDate: formData.completionDate || "",
      additionalClauses: formData.additionalClauses || [],
      acceptanceDeadline: formData.acceptanceDeadline || "",
    },
  });

  // Watch for changes and update parent state
  const watchedValues = methods.watch();
  
  useEffect(() => {
    // Create a debounced update function to avoid too many updates
    const timeoutId = setTimeout(() => {
      // Get all changed values
      const formValues = methods.getValues();
      
      // For each changed value, update the parent state
      Object.entries(formValues).forEach(([field, value]) => {
        if (value !== formData[field as keyof typeof formData]) {
          onInputChange(field, value);
        }
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [watchedValues, methods, formData, onInputChange]);

  return <RHFProvider {...methods}>{children}</RHFProvider>;
};

export default FormProvider; 