// Form.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import FormQuestion from './shared/FormQuestion';
import { FormData } from './types';

const Form: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubstep, setCurrentSubstep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [formId, setFormId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initForm = async () => {
      const urlFormId = searchParams?.get('id');
      if (urlFormId) {
        setFormId(urlFormId);
        await fetchFormData(urlFormId);
      } else {
        const storedFormId = localStorage.getItem('currentFormId');
        if (storedFormId) {
          setFormId(storedFormId);
          await fetchFormData(storedFormId);
        } else {
          const newFormId = uuidv4();
          setFormId(newFormId);
          localStorage.setItem('currentFormId', newFormId);
        }
      }
    };

    initForm();
  }, [searchParams]);

  const fetchFormData = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/form/get?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        console.error('Error fetching form data:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFormData = async () => {
    if (!formId) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch('/api/form/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, data: formData, userId: session?.user?.id }),
      });

      if (response.ok) {
        console.log('Form saved successfully');
        if (session) {
          router.push('/dashboard');
        } else {
          console.log('Form saved. You can access it later using this ID:', formId);
        }
      } else {
        const errorText = await response.text();
        console.error('Error saving form:', errorText);
        setSaveError('Failed to save form. Please try again.');
      }
    } catch (error) {
      console.error('Error saving form data:', error);
      setSaveError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setCurrentSubstep(1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setCurrentSubstep(1);
    }
  };

  const nextSubstep = () => {
    const maxSubsteps = getMaxSubsteps(currentStep);
    if (currentSubstep < maxSubsteps) {
      setCurrentSubstep(currentSubstep + 1);
    } else {
      nextStep();
    }
  };

  const prevSubstep = () => {
    if (currentSubstep > 1) {
      setCurrentSubstep(currentSubstep - 1);
    } else {
      prevStep();
    }
  };

  const getMaxSubsteps = (step: number): number => {
    switch (step) {
      case 1: return 1;
      case 2: return 4;
      case 3: return 2;
      case 4: return 8;
      case 5: return 1;
      default: return 1;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 currentSubstep={currentSubstep} onInputChange={handleInputChange} formData={formData} />;
      case 2:
        return <Step2 currentSubstep={currentSubstep} onInputChange={handleInputChange} formData={formData} />;
      case 3:
        return <Step3 currentSubstep={currentSubstep} onInputChange={handleInputChange} formData={formData} />;
      case 4:
        return <Step4 currentSubstep={currentSubstep} onInputChange={handleInputChange} formData={formData} />;
      case 5:
        return <Step5 formData={formData} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Real Estate Offer Form</h1>
      {renderStep()}
      <div className="mt-6 flex justify-between">
        {currentStep > 1 || currentSubstep > 1 ? (
          <button
            onClick={prevSubstep}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          >
            Previous
          </button>
        ) : (
          <div></div>
        )}
        {currentStep < 5 || (currentStep === 5 && currentSubstep < getMaxSubsteps(5)) ? (
          <button
            onClick={nextSubstep}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={saveFormData}
            disabled={isSaving}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-green-300"
          >
            {isSaving ? 'Saving...' : 'Save and Finish'}
          </button>
        )}
      </div>
      {saveError && <p className="text-red-500 mt-2">{saveError}</p>}
    </div>
  );
};

export default Form;