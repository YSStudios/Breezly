// Step4.tsx
import React, { useState } from 'react';
import FormQuestion from '../shared/FormQuestion';
import { StepProps, Question } from '../types';

const Step4: React.FC<StepProps> = ({ currentSubstep, onInputChange }) => {
	const [purchasePrice, setPurchasePrice] = useState<string>('');
	const [depositAmount, setDepositAmount] = useState<string>('');
	const [depositMethod, setDepositMethod] = useState<string>('');
	const [depositDueDate, setDepositDueDate] = useState<string>('');
	const [escrowAgent, setEscrowAgent] = useState<string>('');
	const [escrowAgentName, setEscrowAgentName] = useState<string>('');
	const [possession, setPossession] = useState<string>('');
	const [closingDate, setClosingDate] = useState<string>('');
	const [hasConditions, setHasConditions] = useState<string>('');
	const [conditions, setConditions] = useState<string[]>([]);
	const [completionDate, setCompletionDate] = useState<string>('');

	const handlePurchasePriceChange = (value: string) => {
		setPurchasePrice(value);
		onInputChange('purchasePrice', value);
	};

	const handleDepositAmountChange = (value: string) => {
		setDepositAmount(value);
		onInputChange('depositAmount', value);
	};

	const handleDepositMethodChange = (questionId: string, value: string, textFields?: { [key: number]: string }) => {
		setDepositMethod(value);
		if (value === 'Other' && textFields && textFields[0]) {
		  onInputChange('depositMethod', `Other: ${textFields[0]}`);
		} else {
		  onInputChange('depositMethod', value);
		}
	  };

	const handleDepositDueDateChange = (questionId: string, value: string, textFields?: { [key: number]: string }) => {
		if (value === 'Specify date' && textFields && textFields[0]) {
		  setDepositDueDate(textFields[0]);
		  onInputChange('depositDueDate', textFields[0]);
		} else {
		  setDepositDueDate(value);
		  onInputChange('depositDueDate', value);
		}
	  };
	  

	const handleEscrowAgentChange = (questionId: string, value: string, textFields?: { [key: number]: string }) => {
		setEscrowAgent(value);
		onInputChange('escrowAgent', value);
		if (textFields && textFields[0]) {
			setEscrowAgentName(textFields[0]);
			onInputChange('escrowAgentName', textFields[0]);
		}
	};

	const handlePossessionChange = (questionId: string, value: string, textFields?: { [key: number]: string }) => {
		setPossession(value);
		onInputChange('possession', value);
		if (textFields) {
		  if (value === 'Upon closing and funding') {
			setClosingDate(textFields[0]);
			onInputChange('closingDate', textFields[0]);
		  } else if (value === 'Before funding, under a temporary lease') {
			onInputChange('possessionDate', textFields[0]);
			setClosingDate(textFields[1]);
			onInputChange('closingDate', textFields[1]);
		  }
		}
	  };

	const handleConditionsChange = (questionId: string, value: string) => {
		setHasConditions(value);
		onInputChange('hasConditions', value);
	};

	const handleSpecificConditionsChange = (questionId: string, value: string) => {
		const selectedConditions = value.split(',');
		setConditions(selectedConditions);
		onInputChange('conditions', value);
	};

	const handleCompletionDateChange = (questionId: string, value: string, textFields?: { [key: number]: string }) => {
		if (textFields && textFields[0]) {
			setCompletionDate(textFields[0]);
			onInputChange('completionDate', textFields[0]);
		}
	};

	const [acceptanceDeadline, setAcceptanceDeadline] = useState<string>('');

	const handleAcceptanceDeadlineChange = (questionId: string, value: string, textFields?: { [key: number]: string }) => {
		if (textFields && textFields[0]) {
			setAcceptanceDeadline(textFields[0]);
			onInputChange('acceptanceDeadline', textFields[0]);
		}
	};

	const purchasePriceQuestion: Question = {
		id: 'purchasePrice',
		description: 'What is the purchase price?',
		options: [
			{
				value: 'price', label: 'Enter price',
				textFields: [{ placeholder: 'e.g. 250,000', prefix: '$' }]
			}
		],
	};

	const depositAmountQuestion: Question = {
		id: 'depositAmount',
		description: 'How much is the initial deposit?',
		options: [
			{
				value: 'amount', label: 'Enter amount',
				textFields: [{ placeholder: 'e.g. 20,000', prefix: '$' }]
			}
		],
	};

	const depositMethodQuestion: Question = {
		id: 'depositMethod',
		description: 'How will the deposit be paid?',
		options: [
		  { value: 'Cash', label: 'Cash' },
		  { value: 'Personal check', label: 'Personal check' },
		  { value: 'Bank draft', label: 'Bank draft' },
		  { value: 'Certified check', label: 'Certified check' },
		  { 
			value: 'Other', 
			label: 'Other', 
			textFields: [
			  { 
				type: 'text', 
				label: 'Payment Type', 
				placeholder: 'e.g. Electronic funds transfer'
			  }
			]
		  },
		],
	  };

	const depositDueDateQuestion: Question = {
		id: 'depositDueDate',
		description: 'When is the deposit due?',
		options: [
		  { value: 'Unsure', label: 'Unsure' },
		  { 
			value: 'Specify date', 
			label: 'Specify date',
			textFields: [{ type: 'date', label: 'Deposit Due Date' }]
		  },
		],
	  };
	  

	const escrowAgentQuestion: Question = {
		id: 'escrowAgent',
		description: 'Who will hold the deposit until the deal is closed?',
		options: [
			{ value: 'Individual', label: 'Individual', textFields: [{ placeholder: 'e.g. Morgan Leigh Brown' }] },
			{ value: 'Corporation/Organization', label: 'Corporation/Organization', textFields: [{ placeholder: 'Full Name' }] },
		],
	};

	const possessionQuestion: Question = {
		id: 'possession',
		description: 'When will the seller provide possession?',
		options: [
		  { 
			value: 'Upon closing and funding', 
			label: 'Upon closing and funding',
			textFields: [{ type: 'date', label: 'Closing (Funding) Date' }]
		  },
		  { 
			value: 'Before funding, under a temporary lease', 
			label: 'Before funding, under a temporary lease',
			textFields: [
			  { type: 'date', label: 'Possession Date' },
			  { type: 'date', label: 'Closing (Funding) Date' }
			]
		  },
		],
	  };

	const closingDateQuestion: Question = {
		id: 'closingDate',
		description: 'Closing (Funding) Date:',
		options: [
			{ value: 'date', label: 'Select date', textFields: [{ placeholder: 'Enter date' }] },
		],
	};

	const conditionsQuestion: Question = {
		id: 'hasConditions',
		description: 'Is this offer subject to any conditions?',
		options: [
			{ value: 'Yes', label: 'Yes' },
			{ value: 'No', label: 'No' },
		],
	};

	const specificConditionsQuestion: Question = {
		id: 'conditions',
		description: 'Which conditions must be satisfied?',
		multiSelect: true,
		options: [
			{ value: 'Satisfactory home inspection', label: 'Satisfactory home inspection' },
			{ value: 'Local ordinance documents', label: 'Local ordinance documents' },
			{ value: 'Proof of marketable title', label: 'Proof of marketable title' },
			{ value: 'Loan approval', label: 'Loan approval' },
			{ value: 'Market value appraisal', label: 'Market value appraisal' },
			{ value: 'Disclosure form', label: 'Disclosure form' },
			{ value: 'The buyer sells their property', label: 'The buyer sells their property' },
			{ value: 'Property is properly zoned', label: 'Property is properly zoned' },
			{ value: 'Specific property repairs', label: 'Specific property repairs' },
			{ value: 'Other conditions not listed here', label: 'Other conditions not listed here' },
		],
	};

	const completionDateQuestion: Question = {
		id: 'completionDate',
		description: 'When do the conditions have to be completed by?',
		options: [
		  { value: 'date', label: 'Select date', textFields: [{ type: 'date', label: 'Completion Date' }] },
		],
	  };

	const acceptanceQuestion: Question = {
		id: 'acceptance',
		description: 'What is the deadline for the seller to accept this offer?',
		options: [
			{
				value: 'deadline', label: 'Acceptance Deadline:',
				textFields: [{ type: 'date', label: 'Acceptance Deadline' }]
			}
		],
	};

	return (
		<div className="space-y-8">
		  {currentSubstep === 1 && (
			<FormQuestion
			  question={purchasePriceQuestion}
			  onChange={handlePurchasePriceChange}
			  title="Purchase Price"
			/>
		  )}
	
		  {currentSubstep === 2 && (
			<>
			  <FormQuestion
				question={depositAmountQuestion}
				onChange={handleDepositAmountChange}
				title="Deposit"
			  />
			  {depositAmount && purchasePrice && (
				<p className="text-sm text-gray-500 mt-1">
				  Balance owing: ${(Number(purchasePrice) - Number(depositAmount)).toLocaleString()}
				</p>
			  )}
			  <FormQuestion
				question={depositMethodQuestion}
				onChange={handleDepositMethodChange}
			  />
			  <FormQuestion
				question={depositDueDateQuestion}
				onChange={handleDepositDueDateChange}
			  />
			</>
		  )}
	
		  {currentSubstep === 3 && (
			<>
			  <h2 className="text-2xl font-bold mb-4">Escrow Agent</h2>
			  <FormQuestion
				question={escrowAgentQuestion}
				onChange={handleEscrowAgentChange}
			  />
			</>
		  )}
	
		  {currentSubstep === 4 && (
			<>
			  <h2 className="text-2xl font-bold mb-4">Closing and Possession</h2>
			  <FormQuestion
				question={possessionQuestion}
				onChange={handlePossessionChange}
			  />
			</>
		  )}
	
		  {currentSubstep === 5 && (
			<>
			  <h2 className="text-2xl font-bold mb-4">Conditions</h2>
			  <FormQuestion
				question={conditionsQuestion}
				onChange={handleConditionsChange}
			  />
			  {hasConditions === 'Yes' && (
				<>
				  <FormQuestion
					question={specificConditionsQuestion}
					onChange={handleSpecificConditionsChange}
				  />
				  <FormQuestion
					question={completionDateQuestion}
					onChange={handleCompletionDateChange}
				  />
				</>
			  )}
			</>
		  )}
	
		  {currentSubstep === 6 && (
			<FormQuestion
			  question={acceptanceQuestion}
			  onChange={handleAcceptanceDeadlineChange}
			  title="Acceptance"
			/>
		  )}
		</div>
	  );
	};

export default Step4;