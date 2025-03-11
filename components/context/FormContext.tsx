import React, { createContext, useContext, useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FORM_CONFIG } from '../config/formConfig';

interface FormContextProps {
  currentStep: number;
  currentSubstep: number;
  totalSteps: number;
  totalSubsteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isFirstSubstep: boolean;
  isLastSubstep: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToNextSubstep: () => void;
  goToPreviousSubstep: () => void;
  goToStep: (step: number, substep?: number) => void;
  formId: string;
  isLocked: boolean;
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

export function useFormFlow() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormFlow must be used within a FormFlowProvider');
  }
  return context;
}

interface FormFlowProviderProps {
  children: React.ReactNode;
  formId?: string;
  isLocked?: boolean;
  initialValues?: Record<string, any>;
  onFormChange?: (values: Record<string, any>) => void;
}

export function FormFlowProvider({
  children,
  formId = '',
  isLocked = false,
  initialValues = {},
  onFormChange
}: FormFlowProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial step and substep from URL or defaults
  const initialStep = parseInt(searchParams.get('step') || '1');
  const initialSubstep = parseInt(searchParams.get('substep') || '1');
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [currentSubstep, setCurrentSubstep] = useState(initialSubstep);
  
  // Get total steps and current step's total substeps
  const totalSteps = FORM_CONFIG.steps.length;
  const totalSubsteps = FORM_CONFIG.steps[currentStep - 1]?.substeps.length || 1;
  
  // Create form methods with initialValues
  const methods = useForm({
    defaultValues: initialValues
  });
  
  // Sync form changes with parent component if needed
  useEffect(() => {
    if (onFormChange) {
      const subscription = methods.watch((values) => {
        onFormChange(values);
      });
      return () => subscription.unsubscribe();
    }
  }, [methods, onFormChange]);
  
  // Update URL when step/substep changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', currentStep.toString());
    params.set('substep', currentSubstep.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [currentStep, currentSubstep, router, searchParams]);
  
  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setCurrentSubstep(1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setCurrentSubstep(1);
    }
  };
  
  const goToNextSubstep = () => {
    if (currentSubstep < totalSubsteps) {
      setCurrentSubstep(prev => prev + 1);
    } else {
      goToNextStep();
    }
  };
  
  const goToPreviousSubstep = () => {
    if (currentSubstep > 1) {
      setCurrentSubstep(prev => prev - 1);
    } else {
      goToPreviousStep();
    }
  };
  
  const goToStep = (step: number, substep: number = 1) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
      const maxSubstep = FORM_CONFIG.steps[step - 1]?.substeps.length || 1;
      setCurrentSubstep(Math.min(substep, maxSubstep));
    }
  };
  
  // Derived state
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const isFirstSubstep = currentSubstep === 1;
  const isLastSubstep = currentSubstep === totalSubsteps;
  
  const value = {
    currentStep,
    currentSubstep,
    totalSteps,
    totalSubsteps,
    isFirstStep,
    isLastStep,
    isFirstSubstep,
    isLastSubstep,
    goToNextStep,
    goToPreviousStep,
    goToNextSubstep,
    goToPreviousSubstep,
    goToStep,
    formId,
    isLocked
  };
  
  return (
    <FormContext.Provider value={value}>
      <FormProvider {...methods}>
        {children}
      </FormProvider>
    </FormContext.Provider>
  );
} 