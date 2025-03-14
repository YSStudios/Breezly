import { 
  HomeIcon, 
  BuildingOffice2Icon, 
  BuildingOfficeIcon, 
  HomeModernIcon, 
  TruckIcon, 
  BuildingStorefrontIcon, 
  QuestionMarkCircleIcon 
} from "@heroicons/react/24/outline";

export const FORM_CONFIG = {
  steps: [
    {
      id: 'property-type',
      title: 'Property Type',
      description: 'Select the type of property for your offer',
      substeps: [
        { 
          id: 'select-type', 
          title: 'What type of property?',
          fields: [
            {
              id: 'property-type',
              type: 'radio-cards',
              label: 'What type of property is this offer for?',
              options: [
                { value: "house", label: "House", icon: HomeIcon },
                { value: "apartment", label: "Apartment", icon: BuildingOffice2Icon },
                { value: "condo", label: "Condo", icon: BuildingOfficeIcon },
                { value: "duplex", label: "Duplex", icon: HomeModernIcon },
                { value: "townhouse", label: "Townhouse", icon: HomeModernIcon },
                { value: "mobile-home", label: "Mobile Home", icon: TruckIcon },
                { value: "commercial", label: "Commercial", icon: BuildingStorefrontIcon },
                { value: "other", label: "Other", icon: QuestionMarkCircleIcon },
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'property-details',
      title: 'Property Details',
      description: 'Provide details about the property',
      substeps: [
        { 
          id: 'address', 
          title: 'Property Address',
          fields: [
            {
              id: 'property-address',
              type: 'address',
              label: 'Property Address',
              placeholder: 'Start typing the address...',
              showMap: true,
            }
          ] 
        },
        { 
          id: 'features', 
          title: 'Property Features',
          fields: [
            {
              id: 'property-features',
              type: 'radio',
              label: 'Are there any chattels, fixtures, or improvements included in the purchase?',
              options: [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]
            },
            {
              id: 'additional-features',
              type: 'radio',
              label: 'When would you like to describe the chattels, fixtures or improvements?',
              conditionalDisplay: { field: 'property-features', value: 'yes' },
              options: [
                { value: "attach", label: "Attach separately" },
                { value: "specify", label: "Specify here" },
              ]
            },
            {
              id: 'additional-features-text',
              type: 'textarea',
              placeholder: 'e.g. Refrigerator, Washer, Dryer, Built-in Shelves',
              conditionalDisplay: { field: 'additional-features', value: 'specify' },
            }
          ]
        },
        { 
          id: 'legal', 
          title: 'Legal Description',
          fields: [
            {
              id: 'legal-land-description',
              type: 'textarea',
              label: 'Legal Land Description',
              helperText: 'Please provide the legal land description for the property. This information can typically be found on the property deed or tax records.',
              placeholder: 'e.g. Lot 7, Block 3, Anytown Subdivision, according to the plat thereof recorded in Book 5 of Plats, Page 23, records of Sample County, State',
              rows: 6
            }
          ]
        }
      ]
    },
    {
      id: 'parties',
      title: 'Buyers & Sellers',
      description: 'Provide details about all parties involved',
      substeps: [
        { 
          id: 'buyers', 
          title: 'Buyer Details',
          partyType: 'buyer',
          maxParties: 5
        },
        { 
          id: 'sellers', 
          title: 'Seller Details',
          partyType: 'seller',
          maxParties: 5
        }
      ]
    },
    {
      id: 'terms',
      title: 'Offer Terms',
      description: 'Specify the terms of your offer',
      substeps: [
        { 
          id: 'price', 
          title: 'Purchase Price',
          fields: [
            {
              id: 'purchasePrice',
              type: 'money',
              label: 'Purchase Price',
              placeholder: '0.00'
            }
          ]
        },
        { 
          id: 'deposit', 
          title: 'Earnest Money Deposit',
          fields: [
            {
              id: 'depositAmount',
              type: 'money',
              label: 'Deposit Amount',
              placeholder: '0.00'
            },
            {
              id: 'depositMethod',
              type: 'select',
              label: 'Deposit Method',
              options: [
                { value: 'check', label: 'Personal Check' },
                { value: 'cashier-check', label: 'Cashier\'s Check' },
                { value: 'wire', label: 'Wire Transfer' },
                { value: 'other', label: 'Other' }
              ]
            },
            {
              id: 'depositDueDate',
              type: 'date',
              label: 'Deposit Due Date'
            },
            {
              id: 'escrowAgentName',
              type: 'text',
              label: 'Escrow Agent Name',
              placeholder: 'Name of agent or company holding the deposit'
            }
          ]
        },
        { 
          id: 'dates', 
          title: 'Important Dates',
          fields: [
            {
              id: 'acceptanceDeadline',
              type: 'date',
              label: 'Offer Acceptance Deadline'
            },
            {
              id: 'closingDate',
              type: 'date',
              label: 'Closing Date'
            },
            {
              id: 'possessionDate',
              type: 'date',
              label: 'Possession Date'
            }
          ]
        },
        {
          id: 'financing',
          title: 'Financing Details',
          specialComponent: 'financing'
        },
        {
          id: 'inspection',
          title: 'Inspection Contingency',
          specialComponent: 'inspection'
        },
        {
          id: 'appraisal',
          title: 'Appraisal Contingency',
          specialComponent: 'appraisal'
        },
        {
          id: 'title',
          title: 'Title Contingency',
          specialComponent: 'title'
        },
        {
          id: 'additional-terms',
          title: 'Additional Terms & Clauses',
          specialComponent: 'additional-clauses'
        }
      ]
    },
    {
      id: 'review',
      title: 'Review & Purchase',
      description: 'Review your offer and complete your purchase',
      substeps: [
        { 
          id: 'summary', 
          title: 'Offer Summary',
          isReview: true
        }
      ]
    }
  ]
};

// Helper functions to work with the config
export function getStepById(stepId: string) {
  return FORM_CONFIG.steps.find(step => step.id === stepId);
}

export function getStepByIndex(index: number) {
  return FORM_CONFIG.steps[index - 1];
}

export function getSubstepByIndex(stepIndex: number, substepIndex: number) {
  const step = getStepByIndex(stepIndex);
  return step?.substeps[substepIndex - 1];
}

export function getTotalSubsteps(stepIndex: number) {
  const step = getStepByIndex(stepIndex);
  return step?.substeps.length || 0;
} 