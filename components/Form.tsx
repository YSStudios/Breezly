'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Sidebar, { substepNames } from './Sidebar';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import { FormData } from './types';
import generatePDF from '../utils/generatePDF';

const DEBUG = process.env.NODE_ENV === 'development';

const Form: React.FC = () => {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [currentSubstep, setCurrentSubstep] = useState(1);
	const [formData, setFormData] = useState<FormData>({});
	const [formId, setFormId] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const { data: session, status } = useSession();
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

  // New useEffect hook to log formData whenever it changes
  useEffect(() => {
    console.log('Current formData:', formData);
  }, [formData]);

  const fetchFormData = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/form/get?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched form data:', data);
        setFormData(data);
      } else if (response.status === 404) {
        console.log('Form not found, creating a new one');
        const newFormId = uuidv4();
        setFormId(newFormId);
        localStorage.setItem('currentFormId', newFormId);
        setFormData({});
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

    if (!session) {
      setSaveError("You must be logged in to save the form. Please log in and try again.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      console.log('Saving form data:');
      console.log('FormId:', formId);
      console.log('Form data:', JSON.stringify(formData, null, 2));
      console.log('Session status:', status);
      console.log('Session user:', JSON.stringify(session?.user, null, 2));

      const response = await fetch('/api/form/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          formId, 
          data: formData
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Save response:', result);
        router.push('/dashboard');
      } else {
        console.error('Error saving form:', result);
        let errorMessage = `Failed to save form: ${result.message}`;
        if (result.error) {
          errorMessage += DEBUG ? `\nError details: ${result.error}` : '';
        }
        setSaveError(errorMessage);
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

  const handleSetStep = (step: number, substep: number = 1) => {
    setCurrentStep(step);
    setCurrentSubstep(substep);
  };

  const getPreviousSubstepName = (): string | null => {
    if (currentSubstep > 1) {
      return substepNames[currentStep]?.[currentSubstep - 1] || null;
    } else if (currentStep > 1) {
      const previousStepSubsteps = substepNames[currentStep - 1];
      const lastSubstepOfPreviousStep = Math.max(...Object.keys(previousStepSubsteps).map(Number));
      return previousStepSubsteps[lastSubstepOfPreviousStep] || null;
    }
    return null;
  };

  const nextSubstep = () => {
    const maxSubsteps = getMaxSubsteps(currentStep);
    if (currentSubstep < maxSubsteps) {
      setCurrentSubstep(currentSubstep + 1);
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setCurrentSubstep(1);
    }
  };

  const prevSubstep = () => {
    if (currentSubstep > 1) {
      setCurrentSubstep(currentSubstep - 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setCurrentSubstep(getMaxSubsteps(currentStep - 1));
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
    console.log('Rendering step, formData:', formData);
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

  const handleGeneratePDF = () => {
    generatePDF(formData);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <div className="sticky top-20 pt-4">
            <Sidebar 
              currentStep={currentStep}
              currentSubstep={currentSubstep}
              handleSetStep={handleSetStep}
            />
          </div>
        </div>
        <div className="md:w-3/4 h-full">
          {getPreviousSubstepName() && (
            <button
              onClick={() => handleSetStep(currentStep, currentSubstep - 1)}
              className="pt-4 flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {getPreviousSubstepName()}
            </button>
          )}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            {renderStep()}
          </div>
          <div className="flex justify-between items-center">
            {currentStep > 1 || currentSubstep > 1 ? (
              <button
                onClick={prevSubstep}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition-colors duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
            ) : (
              <div></div>
            )}
            <div className="flex space-x-4">
              <button
                onClick={saveFormData}
                disabled={isSaving}
                className={`px-6 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors duration-300 flex items-center ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                {isSaving ? 'Saving...' : 'Save Progress'}
              </button>
              {currentStep === 5 ? (
                <button
                  onClick={handleGeneratePDF}
                  className="px-6 py-3 bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600 transition-colors duration-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Offer
                </button>
              ) : (
                <button
                  onClick={nextSubstep}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-full font-bold hover:from-emerald-500 hover:to-teal-600 transition-colors duration-300 flex items-center"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {saveError && (
            <div className="text-red-500 mt-4 p-4 bg-red-100 rounded-lg">
              <p>{saveError}</p>
              {DEBUG && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">Debug Information</summary>
                  <pre className="mt-2 text-xs overflow-auto">{JSON.stringify({ session, formId, formData }, null, 2)}</pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;