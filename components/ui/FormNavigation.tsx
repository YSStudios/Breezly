import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormFlow } from '../context/FormContext';

export function FormNavigation() {
  const { 
    isFirstStep, 
    isFirstSubstep,
    isLastStep,
    isLastSubstep,
    goToPreviousSubstep, 
    goToNextSubstep,
    currentStep
  } = useFormFlow();
  
  const { trigger, formState: { isSubmitting } } = useFormContext();
  
  const handleNext = async () => {
    // For the last step, submit the form
    if (isLastStep && isLastSubstep) {
      // Final form submission would go here
      return;
    }
    
    // Validate current fields before moving forward
    const isValid = await trigger();
    
    if (isValid) {
      goToNextSubstep();
    }
  };
  
  return (
    <div className="mt-8 flex justify-between">
      <button
        type="button"
        onClick={goToPreviousSubstep}
        disabled={isFirstStep && isFirstSubstep}
        className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
      >
        Back
      </button>
      
      <button
        type="button"
        onClick={handleNext}
        disabled={isSubmitting}
        className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {isLastStep && isLastSubstep ? 'Complete' : 'Continue'}
      </button>
    </div>
  );
} 