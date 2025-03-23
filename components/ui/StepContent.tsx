import React from 'react';
import { useFormFlow } from '../context/FormContext';
import { getStepByIndex, getSubstepByIndex } from '../config/formConfig';
import { DynamicField } from './DynamicField';
import { PartyField } from './form/PartyField';
import { useParties } from '../hooks/useParties';
import DynamicFormSection from './DynamicFormSection';
import { 
  FinancingConditions, 
  InspectionConditions,
  AdditionalClauses
} from './field-groups';
import { useFormContext } from 'react-hook-form';
import { OfferSummary } from './OfferSummary';

// Define types for substep configurations
interface BaseSubstepConfig {
  id: string;
  title: string;
}

interface FieldsSubstepConfig extends BaseSubstepConfig {
  fields?: Array<{
    id: string;
    type: string;
    label?: string;
    [key: string]: any;
  }>;
}

interface PartySubstepConfig extends BaseSubstepConfig {
  partyType?: 'buyer' | 'seller';
  maxParties?: number;
}

interface SpecializedSubstepConfig extends BaseSubstepConfig {
  specialComponent?: string;
}

interface ReviewSubstepConfig extends BaseSubstepConfig {
  isReview?: boolean;
}

type SubstepConfig = FieldsSubstepConfig & PartySubstepConfig & SpecializedSubstepConfig & ReviewSubstepConfig;

export function StepContent() {
  const { currentStep, currentSubstep, isLocked, formId } = useFormFlow();
  const { control, getValues } = useFormContext();
  const stepConfig = getStepByIndex(currentStep);
  const substepConfig = getSubstepByIndex(currentStep, currentSubstep) as SubstepConfig;
  const { parties, addParty, removeParty, getPartyLabel } = useParties(
    (substepConfig?.partyType as 'buyer' | 'seller') || 'buyer',
    substepConfig?.maxParties || 5
  );
  
  // Handle specialized component mappings
  const specializedComponents: Record<string, React.ReactNode> = {
    'financing': <FinancingConditions />,
    'inspection': <InspectionConditions />,
    'additional-clauses': <AdditionalClauses />
  };
  
  // Check if we need to render a specialized component
  if (substepConfig?.specialComponent && specializedComponents[substepConfig.specialComponent]) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{substepConfig.title}</h2>
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          {specializedComponents[substepConfig.specialComponent]}
        </div>
      </div>
    );
  }
  
  // Handle review step with dynamic offer summary
  if (stepConfig?.id === 'review') {
    return <OfferSummary formId={formId} formData={getValues()} />;
  }
  
  // Render parties section (buyer/seller)
  if (substepConfig?.partyType) {
    const renderParty = (index: number) => (
      <PartyField
        partyType={substepConfig.partyType as 'buyer' | 'seller'}
        index={index}
        label={getPartyLabel(index)}
        onRemove={() => removeParty(index)}
        removable={index > 0}
      />
    );
    
    return (
      <DynamicFormSection
        title={substepConfig.title}
        fieldPrefix={substepConfig.partyType}
        items={parties}
        renderItem={renderParty}
        onAddItem={addParty}
        onRemoveItem={removeParty}
        addButtonText={`Add another ${substepConfig.partyType}`}
        maxItems={substepConfig.maxParties || 5}
      />
    );
  }
  
  // Handle regular fields
  if (substepConfig?.fields) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{substepConfig.title}</h2>
        
        {substepConfig.fields.map((field) => (
          <div key={field.id} className="p-6 border rounded-lg bg-white shadow-sm">
            <DynamicField field={field} disabled={isLocked} />
          </div>
        ))}
      </div>
    );
  }
  
  return <div>No content available for this step</div>;
} 