// Step2.tsx
import React, { useState, useCallback, useEffect } from 'react';
import FormQuestion from '../shared/FormQuestion';
import StateSelectionQuestion from '../shared/StateSelector';
import { StepProps, Question } from '../types';

const Step2: React.FC<StepProps> = ({ currentSubstep, onInputChange, formData }) => {
	const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(false);

	useEffect(() => {
		setShowAdditionalFeatures(formData['property-features'] === 'yes');
	}, [formData]);

	const handleStateSelect = useCallback((state: string) => {
		onInputChange('property-location', state);
	}, [onInputChange]);

	const handleInputChange = useCallback((questionId: string, value: string, textFieldValues?: { [key: number]: string }) => {
		if (questionId === 'address-option' && value === 'now' && textFieldValues) {
			const propertyAddress = textFieldValues[0]; // Assuming the property address is in the first text field
			onInputChange('property-address', propertyAddress);
		} else if (questionId === 'additional-features') {
			onInputChange(questionId, value);
			if (value === 'specify' && textFieldValues) {
				onInputChange('additional-features-text', textFieldValues[0]);
			}
		} else if (questionId === 'legal-land-description') {
			onInputChange(questionId, value);
			if (value === 'specify' && textFieldValues) {
				onInputChange('legal-land-description-text', textFieldValues[0]);
			}
		} else {
			onInputChange(questionId, value);
		}
	}, [onInputChange]);

	const addressOptionQuestion: Question = {
		id: 'address-option',
		description: 'When would you like to add the house address?',
		options: [
			{
				value: 'later',
				label: 'After printing or downloading',
			},
			{
				value: 'now',
				label: 'Now',
				textFields: [
					{
						label: 'Property Address',
						placeholder: 'e.g., Street, City, State ZIP Code',
						helperText: 'Enter the address of the property you are purchasing'
					}
				]
			}
		]
	};

	const legalLandDescriptionQuestion: Question = {
		id: 'legal-land-description',
		description: "When would you like to add the house's legal land description?",
		options: [
			{
				value: 'attach',
				label: 'Attach Separately',
			},
			{
				value: 'specify',
				label: 'Specify Here',
				textFields: [
					{
						label: 'What is the legal land description?',
						placeholder: 'e.g. Lot number, block number, additions, city, county, state',
					}
				]
			}
		]
	};

	const PropertyFeaturesQuestion: Question = {
		id: 'property-features',
		description: "Are there any chattels, fixtures, or improvements included in the purchase?",
		options: [
			{
				value: 'yes',
				label: 'Yes',
			},
			{
				value: 'no',
				label: 'No',
			}
		]
	};

	const AdditionalFeaturesQuestion: Question = {
		id: 'additional-features',
		description: "When would you like to describe the chattels, fixtures or improvements?",
		options: [
			{
				value: 'attach',
				label: 'Attach separately',
			},
			{
				value: 'specify',
				label: 'Specify here',
				textFields: [
					{
						label: 'What chattels, fixtures, and improvements are included?',
						placeholder: 'e.g. Refrigerator, Washer, Dryer, Built-in Shelves',
						helperText: 'Separate items with commas'
					}
				]
			}
		]
	};

	const handlePropertyFeaturesChange = useCallback((questionId: string, value: string) => {
		onInputChange(questionId, value);
		setShowAdditionalFeatures(value === 'yes');
	}, [onInputChange]);

	return (
		<div className="mx-auto grid grid-cols-2 gap-x-8 gap-y-10">
			{currentSubstep === 1 && (
				<div className="col-span-2 sm:col-span-2">
					<StateSelectionQuestion onStateSelect={handleStateSelect} formData={{
						state: undefined
					}} />
				</div>
			)}

			{currentSubstep === 2 && (
				<div className="col-span-2 sm:col-span-2">
					<FormQuestion
						question={addressOptionQuestion}
						onChange={handleInputChange}
						title="Property Address"
						initialValue={formData['property-address'] ? 'now' : 'later'}
						initialTextFieldValues={{ 0: formData['property-address'] }}
					/>
				</div>
			)}

			{currentSubstep === 3 && (
				<div className="col-span-2 sm:col-span-2">
					<FormQuestion
						question={legalLandDescriptionQuestion}
						onChange={handleInputChange}
						title="Legal Land Description"
						initialValue={formData['legal-land-description-text'] ? 'specify' : formData['legal-land-description']}
						initialTextFieldValues={{ 0: formData['legal-land-description-text'] }}
					/>
				</div>
			)}

			{currentSubstep === 4 && (
				<div className="col-span-2 sm:col-span-2 space-y-6">
					<FormQuestion
						question={PropertyFeaturesQuestion}
						onChange={handlePropertyFeaturesChange}
						title="Property Features"
						initialValue={formData['property-features']}
					/>
					{showAdditionalFeatures && (
						<FormQuestion
							question={AdditionalFeaturesQuestion}
							onChange={handleInputChange}
							initialValue={formData['additional-features-text'] ? 'specify' : formData['additional-features']}
							initialTextFieldValues={{ 0: formData['additional-features-text'] }}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default Step2;