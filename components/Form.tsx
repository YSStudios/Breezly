// Form.tsx
"use client";
import React, { useState } from 'react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import generatePDF from '../utils/generatePDF';
import { FormData, StepProps } from './types';
import { Container } from '@/components/Container';
import formimage from "../public/formimage.png";

const Form: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentSubstep, setCurrentSubstep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({});

  const handleNextSubstep = (): void => {
    setCurrentSubstep((prevSubstep) => prevSubstep + 1);
  };

  const handlePreviousSubstep = (): void => {
    setCurrentSubstep((prevSubstep) => Math.max(prevSubstep - 1, 1));
  };

  const handleSkip = (): void => {
    handleNextSubstep();
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

  const stepProps: StepProps = {
    currentSubstep,
    onInputChange: handleInputChange
  };

  const stepIcons = [
	<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />,
	<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />,
	<path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />,
	<path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />,
	<path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
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
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className={`md:col-span-5 group relative flex items-left gap-x-6 rounded-lg p-3 text-sm leading-6 ${currentStep === step ? 'bg-slate-50/50 text-indigo-600' : 'text-white'}`}>
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white mx-auto md:mx-0">
						<svg className={`h-6 w-6 ${currentStep === step ? 'text-indigo-600' : 'text-gray-600'} group-hover:text-indigo-600`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        	{stepIcons[step - 1]}
                      	</svg>
                    </div>
                    <div className="flex-auto hidden md:block">
                      <button type="button" onClick={() => handleSetStep(step)} className="text-left block font-semibold">
                        <p>Step {step}</p>
                        {stepTitles[step - 1]}
                        <span className="absolute inset-0"></span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="p-10 col-span-6 md:col-span-4 bg-gray-100 rounded-r-2xl flex flex-col">
              <div className="flex-grow">
                {currentStep === 1 && <Step1 {...stepProps} />}
                {currentStep === 2 && <Step2 {...stepProps} />}
				{currentStep === 3 && <Step3 currentSubstep={currentSubstep} onInputChange={handleInputChange} />}
                {/* Add similar lines for other steps */}
              </div>

              {/* Form navigation buttons */}
              <div className="mt-6 flex items-center justify-end gap-x-6">
                {!(currentStep === 1 && currentSubstep === 1) && (
                  <button type="button" onClick={handlePreviousSubstep} className="mr-auto rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Previous</button>
                )}
                <button type="submit" className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save and continue</button>
                {currentStep < 5 && (
                  <button type="button" onClick={handleSkip} className="text-sm font-semibold leading-6 text-gray-900">Skip this step</button>
                )}
                {currentStep === 5 && (
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