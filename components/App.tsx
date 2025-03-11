import React, { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import MultiStepForm from "./MultiStepForm";

function App() {
  const [formData, setFormData] = useState({});
  
  // Initialize form methods with formData as defaultValues
  const methods = useForm({
    defaultValues: formData
  });
  
  // When formData changes externally, reset the form with new values
  useEffect(() => {
    methods.reset(formData);
  }, [formData]);
  
  // When form values change, update the app state
  useEffect(() => {
    const subscription = methods.watch((value) => {
      if (value) {
        // Use a timeout to avoid too many updates
        // and potential circular updates
        const timer = setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            ...value
          }));
        }, 100);
        
        return () => clearTimeout(timer);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [methods]);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <FormProvider {...methods}>
      <MultiStepForm 
        formData={formData} 
        onInputChange={handleInputChange} 
      />
    </FormProvider>
  );
}

export default App; 