// Form.tsx
"use client";
import React, { useState } from 'react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
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

const Form: React.FC = () => {
	const [currentStep, setCurrentStep] = useState<number>(1);
	const [currentSubstep, setCurrentSubstep] = useState<number>(1);
	const [formData, setFormData] = useState<FormData>({});

	const totalSteps = 5;

	const substepNames: { [key: number]: { [key: number]: string } } = {
		1: { 1: "Personal Information" },
		2: { 1: "Location", 2: "Address", 3: "Features" },
		3: { 1: "Buyer Details", 2: "Seller Details" },
		4: { 1: "Purchase Price", 2: "Deposit", 3: "Escrow Agent", 4: "Closing and Possession", 5: "Conditions", 6: "Acceptance" },
		5: { 1: "Review and Generate" }
	};

	const handleNextSubstep = (): void => {
		const maxSubsteps = getMaxSubsteps(currentStep);
		if (currentSubstep < maxSubsteps) {
			setCurrentSubstep((prevSubstep) => prevSubstep + 1);
		} else {
			handleNextStep();
		}
	};

	const handlePreviousSubstep = (e: React.MouseEvent): void => {
		e.preventDefault();
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

	const handleSetStep = (step: number, substep: number = 1): void => {
		setCurrentStep(step);
		setCurrentSubstep(substep);
	};

	const handleInputChange = (name: string, value: string): void => {
		setFormData((prevData) => ({
			...prevData,
			[name]: value
		}));
	};

	const handleSubmit = (e: React.FormEvent): void => {
		e.preventDefault();
		generatePDF(formData);
	};

	const getMaxSubsteps = (step: number): number => {
		return Object.keys(substepNames[step]).length;
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
					<div className="lg:col-start-2 min-h-[50em] col-span-12 lg:col-span-10 grid grid-cols-6 gap-y-10 pb-12 mx-auto">

						{/* Sidebar */}
						<div style={{ backgroundImage: `url(${formimage.src})` }} className="bg-[length:60%_auto] bg-no-repeat bg-bottom p-4 col-span-6 md:col-span-2 bg-emerald-500 rounded-l-2xl">
							<div className="grid grid-cols-5 space-y-4">
								{[1, 2, 3, 4, 5].map((step) => {
									const Icon = stepIcons[step - 1];
									const isCurrentStep = currentStep === step;
									return (
										<div
											key={`step-${step}`}
											className={`md:col-span-5 group relative rounded-lg p-3 text-sm leading-6 hover:bg-emerald-400/50 transition-colors duration-200 ${isCurrentStep ? 'bg-emerald-400/50' : ''}`}
											onClick={() => handleSetStep(step)}
										>
											<div className="flex items-center gap-x-6 cursor-pointer">
												<div className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg ${isCurrentStep ? 'bg-white' : 'border border-white group-hover:bg-white'}`}>
													<Icon className={`h-6 w-6 ${isCurrentStep ? 'text-indigo-600' : 'text-white group-hover:text-indigo-600'}`} />
												</div>
												<div className="flex-auto hidden md:block">
													<p className="font-semibold text-lg text-white">{stepTitles[step - 1]}</p>
												</div>
											</div>
											{isCurrentStep && (
												<div className="mt-3 space-y-1 pl-[68px]">
													{Object.entries(substepNames[step]).map(([substep, name]) => (
														<button
															key={`substep-${step}-${substep}`}
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																handleSetStep(step, Number(substep));
															}}
															className={`block w-full text-left text-sm ${currentSubstep === Number(substep)
																	? 'text-white font-bold'
																	: 'text-emerald-100 hover:text-white'
																}`}
														>
															{name}
														</button>
													))}
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>

						{/* Form */}
						<div className="p-10 col-span-6 md:col-span-4 bg-gray-100 rounded-r-2xl flex flex-col">
							{getPreviousSubstepName() && (
								<button
									onClick={handlePreviousSubstep}
									className="flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
										<path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
									</svg>
									{getPreviousSubstepName()}
								</button>
							)}
							<div className="flex-grow">
								{currentStep === 1 && <Step1 {...stepProps} />}
								{currentStep === 2 && <Step2 {...stepProps} />}
								{currentStep === 3 && <Step3 {...stepProps} />}
								{currentStep === 4 && <Step4 {...stepProps} />}
								{currentStep === 5 && (
									<div>
										<h2 className="text-2xl font-bold mb-4">Review Your Offer</h2>
										<Step5 formData={formData} />
									</div>
								)}
							</div>

							{/* Form navigation buttons */}
							<div className="mt-6 flex items-center justify-end gap-x-6">
								{currentStep < totalSteps && (
									<button type="button" onClick={handleSkip} className="text-sm font-semibold leading-6 text-gray-900">
										Skip this step
									</button>
								)}
								{currentStep < totalSteps && (
									<button
										type="button"
										onClick={handleNextSubstep}
										className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
									>
										Save & Continue
									</button>
								)}
								{currentStep === totalSteps && (
									<button
										type="button"
										onClick={handleSubmit}
										className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
									>
										Generate PDF
									</button>
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