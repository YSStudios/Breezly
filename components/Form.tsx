// Form.tsx
"use client";
import React, { useState } from 'react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import generatePDF from '../utils/generatePDF';
import { FormData, StepProps } from './types';
import { Container } from '@/components/Container';
import formimage from "../public/formimage.png";
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  PaperAirplaneIcon 
} from '@heroicons/react/24/outline';
import next from 'next';

const Form: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentSubstep, setCurrentSubstep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({});

  const totalSteps = 5; // Total number of main steps

  const handleNextSubstep = (): void => {
    const maxSubsteps = getMaxSubsteps(currentStep);
    if (currentSubstep < maxSubsteps) {
      setCurrentSubstep((prevSubstep) => prevSubstep + 1);
    } else {
      handleNextStep();
    }
  };

  const handlePreviousSubstep = (): void => {
    if (currentSubstep > 1) {
      setCurrentSubstep((prevSubstep) => prevSubstep - 1);
    } else if (currentStep > 1) {
      handlePreviousStep();
    }
  };

  const handleNextStep = (): void => {
    if (currentStep < totalSteps) {
      setCurrentStep((prevStep) => prevStep + 1);
      setCurrentSubstep(1);
    }
  };

  const handlePreviousStep = (): void => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1);
      setCurrentSubstep(getMaxSubsteps(currentStep - 1));
    }
  };

  const handleSkip = (): void => {
    const maxSubsteps = getMaxSubsteps(currentStep);
    if (currentSubstep < maxSubsteps) {
      setCurrentSubstep(currentSubstep + 1);
    } else {
      handleNextStep();
    }
  };

  const handleSetStep = (step: number): void => {
    setCurrentStep(step);
    setCurrentSubstep(1);
  };

  const handleInputChange = (name: string, value: string): void => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    generatePDF(formData); // Generate the PDF with form data
  };

  const getMaxSubsteps = (step: number): number => {
    switch (step) {
      case 1: return 1;
      case 2: return 3;
      case 3: return 2;
      case 4: return 6;
      case 5: return 1;
      default: return 1;
    }
  };

  const stepProps: StepProps = {
    currentSubstep,
    onInputChange: handleInputChange
  };

  const stepIcons = [
    HomeIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    DocumentTextIcon,
    PaperAirplaneIcon
  ];

  const stepTitles = [
    "Get Started",
    "Property Details",
    "Parties",
    "Terms",
    "Send Offer/Download"
  ];

  return (
    <Container>
      <div className="w-full mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="lg:col-start-2 min-h-[45em] col-span-12 lg:col-span-10 grid grid-cols-6 gap-y-10 pb-12 mx-auto">
            
            {/* Sidebar */}
            <div style={{ backgroundImage: `url(${formimage.src})` }} className="bg-[length:60%_auto] bg-no-repeat bg-bottom p-4 col-span-6 md:col-span-2 bg-emerald-500 rounded-l-2xl">
              <div className="grid grid-cols-5 space-y-4">
                {[1, 2, 3, 4, 5].map((step) => {
                  const Icon = stepIcons[step - 1];
                  return (
                    <div key={`step-${step}`} className={`md:col-span-5 group relative flex items-left gap-x-6 rounded-lg p-3 text-sm leading-6 ${currentStep === step ? 'bg-slate-50/50 text-indigo-600' : 'text-white'}`}>
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white mx-auto md:mx-0">
                        <Icon className={`h-6 w-6 ${currentStep === step ? 'text-indigo-600' : 'text-gray-600'} group-hover:text-indigo-600`} />
                      </div>
                      <div className="flex-auto hidden md:block">
                        <button type="button" onClick={() => handleSetStep(step)} className="text-left block font-semibold">
                          <p>Step {step}</p>
                          {stepTitles[step - 1]}
                          <span className="absolute inset-0"></span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <div className="p-10 col-span-6 md:col-span-4 bg-gray-100 rounded-r-2xl flex flex-col">
              <div className="flex-grow">
                {currentStep === 1 && <Step1 {...stepProps} />}
                {currentStep === 2 && <Step2 {...stepProps} />}
                {currentStep === 3 && <Step3 {...stepProps} />}
                {currentStep === 4 && <Step4 {...stepProps} />}
                {currentStep === 5 && <div>Final Step: Review and Send</div>}
              </div>

              {/* Form navigation buttons */}
              <div className="mt-6 flex items-center justify-end gap-x-6">
                {!(currentStep === 1 && currentSubstep === 1) && (
                  <button type="button" onClick={handlePreviousSubstep} className="mr-auto rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Previous</button>
                )}
                <button type="button" onClick={handleNextSubstep} className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Save & Continue
                </button>
                {currentStep < totalSteps && (
                  <button type="button" onClick={handleSkip} className="text-sm font-semibold leading-6 text-gray-900">Skip this step</button>
                )}
                {currentStep === totalSteps && currentSubstep === getMaxSubsteps(currentStep) && (
                  <button type="button" onClick={handleSubmit} className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Generate PDF</button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default Form;