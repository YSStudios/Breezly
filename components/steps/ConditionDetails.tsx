// ConditionDetails.tsx
import React from 'react';
import FormQuestion from '../shared/FormQuestion';
import { Question } from '../types';

interface ConditionDetailsProps {
  selectedConditions: string[];
  onInputChange: (name: string, value: string) => void;
}

const ConditionDetails: React.FC<ConditionDetailsProps> = ({ selectedConditions, onInputChange }) => {
  const renderConditionDetails = (condition: string) => {
    switch (condition) {
      case 'The buyer sells their property':
        return (
          <>
            <FormQuestion
              question={{
                id: 'buyer-property-address',
                description: "Address of Buyer's property to be sold:",
                options: [{ value: 'address', label: 'Address', textFields: [{ placeholder: 'e.g. 42 Evergreen Way, Santa Fe, New Mexico' }] }],
              }}
              onChange={onInputChange}
            />
            <FormQuestion
              question={{
                id: 'buyer-property-sale-date',
                description: 'Date that Buyer must sell by:',
                options: [{ value: 'date', label: 'Date', textFields: [{ type: 'date' }] }],
              }}
              onChange={onInputChange}
            />
          </>
        );
      case 'Disclosure form':
        return (
          <FormQuestion
            question={{
              id: 'disclosure-form-date',
              description: 'Date disclosure form is due to be delivered:',
              options: [{ value: 'date', label: 'Date', textFields: [{ type: 'date' }] }],
            }}
            onChange={onInputChange}
          />
        );
      case 'Buyer must obtain a new loan':
        return (
          <>
            <FormQuestion
              question={{
                id: 'new-loan-amount',
                description: 'Amount of new loan:',
                options: [{ value: 'amount', label: 'Amount', textFields: [{ placeholder: 'e.g. 125,000.00', prefix: '$' }] }],
              }}
              onChange={onInputChange}
            />
            <FormQuestion
              question={{
                id: 'new-loan-term',
                description: 'Term of the loan (in months):',
                options: [{ value: 'term', label: 'Term', textFields: [{ placeholder: 'e.g. 60' }] }],
              }}
              onChange={onInputChange}
            />
            <FormQuestion
              question={{
                id: 'new-loan-interest-rate',
                description: 'Maximum interest rate of loan (in %):',
                options: [{ value: 'rate', label: 'Rate', textFields: [{ placeholder: 'e.g. 4.5' }] }],
              }}
              onChange={onInputChange}
            />
            <FormQuestion
              question={{
                id: 'new-loan-amortization',
                description: 'Amortization period of the loan (in years):',
                options: [{ value: 'period', label: 'Period', textFields: [{ placeholder: 'e.g. 10' }] }],
              }}
              onChange={onInputChange}
            />
            <FormQuestion
              question={{
                id: 'new-loan-approval-time',
                description: 'Maximum time for application to be approved (in days):',
                options: [{ value: 'days', label: 'Days', textFields: [{ placeholder: 'e.g. 90' }] }],
              }}
              onChange={onInputChange}
            />
          </>
        );
      case 'Buyer must receive approval to assume existing loan':
        return (
          <FormQuestion
            question={{
              id: 'assume-loan-approval-deadline',
              description: 'Deadline to receive approval:',
              options: [{ value: 'date', label: 'Date', textFields: [{ type: 'date' }] }],
            }}
            onChange={onInputChange}
          />
        );
      case 'Buyer must receive third party approval':
        return (
          <>
            <FormQuestion
              question={{
                id: 'third-party-name',
                description: 'Name of person:',
                options: [{ value: 'name', label: 'Name', textFields: [{ placeholder: 'e.g. John Doe' }] }],
              }}
              onChange={onInputChange}
            />
            <FormQuestion
              question={{
                id: 'third-party-is-attorney',
                description: 'Is the person an attorney?',
                options: [
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ],
              }}
              onChange={onInputChange}
            />
            <FormQuestion
              question={{
                id: 'third-party-approval-deadline',
                description: 'Approval must be received by:',
                options: [{ value: 'date', label: 'Date', textFields: [{ type: 'date' }] }],
              }}
              onChange={onInputChange}
            />
            <FormQuestion
              question={{
                id: 'third-party-approval-notice',
                description: 'Is the Buyer required to notify the Seller once third party approval has been obtained?',
                options: [
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ],
              }}
              onChange={onInputChange}
            />
          </>
        );
      case 'Satisfactory home inspection':
        return (
          <>
            <FormQuestion
              question={{
                id: 'home-inspection-deadline',
                description: 'Date inspection must be completed by:',
                options: [{ value: 'date', label: 'Date', textFields: [{ type: 'date' }] }],
              }}
              onChange={onInputChange}
            />
            <FormQuestion
              question={{
                id: 'home-inspection-payer',
                description: 'Who will pay for the home inspection?',
                options: [
                  { value: 'Buyer', label: 'Buyer' },
                  { value: 'Seller', label: 'Seller' },
                  { value: 'Split', label: 'Split between Buyer and Seller' },
                ],
              }}
              onChange={onInputChange}
            />
          </>
        );
      case 'Market value appraisal':
        return (
          <FormQuestion
            question={{
              id: 'appraisal-details',
              description: 'The sale is contingent upon an appraisal valuing the Property for at least the amount of the purchase price.',
              options: [{ value: 'acknowledged', label: 'Acknowledged' }],
            }}
            onChange={onInputChange}
          />
        );
      case 'Specific property repairs':
        return (
          <>
            <FormQuestion
              question={{
                id: 'specific-repairs',
                description: 'What repairs does the Buyer want completed?',
                options: [{ value: 'repairs', label: 'Repairs', textFields: [{ placeholder: 'e.g. re-shingle the roof, re-seed the lawn in the backyard, repaint the basement, replace ensuite toilet, etc.' }] }],
              }}
              onChange={onInputChange}
            />
            <FormQuestion
              question={{
                id: 'repairs-completion-date',
                description: 'What date must repairs be completed by?',
                options: [{ value: 'date', label: 'Date', textFields: [{ type: 'date' }] }],
              }}
              onChange={onInputChange}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Condition Details</h2>
      {selectedConditions.map((condition) => (
        <div key={condition} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{condition}</h3>
          {renderConditionDetails(condition)}
        </div>
      ))}
    </div>
  );
};

export default ConditionDetails;