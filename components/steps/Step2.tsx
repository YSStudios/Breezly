// Step2.tsx
import React, {useState} from 'react';
import FormQuestion from '../shared/FormQuestion';
import StateSelectionQuestion from '../shared/StateSelector';
import { StepProps, Question } from '../types';

const Step2: React.FC<StepProps> = ({ currentSubstep, onInputChange }) => {
	const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(false);

	const handleStateSelect = (state: string) => {
		onInputChange('property-location', state);
	};

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
						label: 'Full Address',
						placeholder: 'e.g., Street, City, State ZIP Code',
						helperText: 'Enter the full address of the property'
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

	const handlePropertyFeaturesChange = (questionId: string, value: string) => {
		onInputChange(questionId, value);
		setShowAdditionalFeatures(value === 'yes');
	};

	return (
		<div className="mx-auto grid grid-cols-2 gap-x-8 gap-y-10">
			{currentSubstep === 1 && (
				<div className="col-span-2 sm:col-span-2">
					<StateSelectionQuestion onStateSelect={handleStateSelect} />
				</div>
			)}

			{currentSubstep === 2 && (
				<div className="col-span-2 sm:col-span-2">
					<FormQuestion
						question={addressOptionQuestion}
						onChange={onInputChange}
						title="Property Address"
					/>
				</div>
			)}

			{currentSubstep === 3 && (
				<div className="col-span-2 sm:col-span-2">
					<FormQuestion
						question={legalLandDescriptionQuestion}
						onChange={onInputChange}
						title="Legal Land Description"
					/>
				</div>
			)}

			{currentSubstep === 4 && (
				<div className="col-span-2 sm:col-span-2 space-y-6">
					<FormQuestion
						question={PropertyFeaturesQuestion}
						onChange={handlePropertyFeaturesChange}
						title="Property Features"
					/>
					{showAdditionalFeatures && (
						<FormQuestion
							question={AdditionalFeaturesQuestion}
							onChange={onInputChange}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default Step2;