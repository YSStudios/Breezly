// Step3.tsx
import React from 'react';
import DynamicFormSection from '../ui/DynamicFormSection';
import { PartyField } from '../ui/form/PartyField';
import { useParties } from '../hooks/useParties';

const MAX_PARTIES = 5;

interface Step3Props {
  currentSubstep: number;
  isLocked?: boolean;
}

const Step3: React.FC<Step3Props> = ({ currentSubstep, isLocked }) => {
    const {
      parties: buyers,
      addParty: addBuyer,
      removeParty: removeBuyer,
      getPartyLabel: getBuyerLabel
    } = useParties('buyer', MAX_PARTIES);
    
    const {
      parties: sellers,
      addParty: addSeller,
      removeParty: removeSeller,
      getPartyLabel: getSellerLabel
    } = useParties('seller', MAX_PARTIES);

    const renderPartySection = (partyType: 'buyer' | 'seller') => {
        const parties = partyType === 'buyer' ? buyers : sellers;
        const getLabel = partyType === 'buyer' ? getBuyerLabel : getSellerLabel;
        const removeParty = partyType === 'buyer' ? removeBuyer : removeSeller;
        
        const renderParty = (index: number) => (
            <PartyField
              partyType={partyType}
              index={index}
              label={getLabel(index)}
              onRemove={() => removeParty(index)}
              removable={index > 0}
            />
        );

        return (
            <DynamicFormSection
                title={`${partyType.charAt(0).toUpperCase() + partyType.slice(1)} Details`}
                fieldPrefix={partyType}
                items={parties}
                renderItem={renderParty}
                onAddItem={() => partyType === 'buyer' ? addBuyer() : addSeller()}
                onRemoveItem={(index) => removeParty(index)}
                addButtonText={`Add another ${partyType}`}
                maxItems={MAX_PARTIES}
            />
        );
    };

    return (
        <div className="space-y-10">
            {currentSubstep === 1 && renderPartySection('buyer')}
            {currentSubstep === 2 && renderPartySection('seller')}
        </div>
    );
};

export default Step3;