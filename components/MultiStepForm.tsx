import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
// ... other imports

const MultiStepForm = ({ formData, onInputChange }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubstep, setCurrentSubstep] = useState(1);
  
  // Create form methods
  const methods = useForm({
    defaultValues: {
      ...formData
    }
  });
  
  // Hook to sync react-hook-form state with parent state
  React.useEffect(() => {
    const subscription = methods.watch((value) => {
      // This will update parent state whenever form values change
      // You may want to debounce this in a real application
      if (value) {
        Object.entries(value).forEach(([key, val]) => {
          if (val !== undefined && val !== formData[key]) {
            onInputChange(key, val);
          }
        });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [methods, onInputChange, formData]);
  
  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < 4) {
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
    // Add logic here based on which step we're on
    const maxSubsteps = currentStep === 4 ? 8 : 3; // Example
    if (currentSubstep < maxSubsteps) {
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
  
  return (
    <FormProvider {...methods}>
      <div className="container mx-auto px-4 py-8">
        {/* Step navigation UI */}
        <div className="mb-8">
          {/* Your step indicators */}
        </div>
        
        {/* Form Steps */}
        {currentStep === 1 && <Step1 currentSubstep={currentSubstep} formData={formData} onInputChange={onInputChange} />}
        {currentStep === 2 && <Step2 currentSubstep={currentSubstep} formData={formData} onInputChange={onInputChange} />}
        {currentStep === 3 && <Step3 currentSubstep={currentSubstep} formData={formData} onInputChange={onInputChange} />}
        {currentStep === 4 && <Step4 currentSubstep={currentSubstep} formData={formData} onInputChange={onInputChange} />}
        
        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={goToPreviousSubstep}
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
          >
            Back
          </button>
          <button
            onClick={goToNextSubstep}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            Continue
          </button>
        </div>
      </div>
    </FormProvider>
  );
};

export default MultiStepForm; 