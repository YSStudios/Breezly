// Step3.tsx
import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import DynamicFormSection from '../ui/DynamicFormSection';

const MAX_PARTIES = 5;

interface Step3Props {
  currentSubstep: number;
  isLocked?: boolean;
}

const Step3: React.FC<Step3Props> = ({ currentSubstep, isLocked }) => {
    const { control, watch, setValue } = useFormContext();
    const [buyers, setBuyers] = useState([0]);
    const [sellers, setSellers] = useState([0]);

    // Initialize party arrays from form data when component mounts
    useEffect(() => {
        // Look for existing buyer/seller data
        const formValues = watch();
        const buyerKeys = Object.keys(formValues || {}).filter(key => key.startsWith('buyer-type-'));
        const sellerKeys = Object.keys(formValues || {}).filter(key => key.startsWith('seller-type-'));
        
        if (buyerKeys.length > 0) {
            const buyerIndices = buyerKeys.map(key => parseInt(key.split('-').pop() || '0'));
            const maxBuyerIndex = Math.max(...buyerIndices);
            setBuyers(Array.from({ length: maxBuyerIndex + 1 }, (_, i) => i));
        }
        
        if (sellerKeys.length > 0) {
            const sellerIndices = sellerKeys.map(key => parseInt(key.split('-').pop() || '0'));
            const maxSellerIndex = Math.max(...sellerIndices);
            setSellers(Array.from({ length: maxSellerIndex + 1 }, (_, i) => i));
        }
    }, [watch]);

    const partyTypeOptions = [
        {
            value: 'individual',
            label: 'Individual',
            icon: UserIcon
        },
        {
            value: 'corporation',
            label: 'Corporation/Organization',
            icon: BuildingOfficeIcon
        }
    ];

    const handleAddParty = (partyType: 'buyer' | 'seller') => {
        if (partyType === 'buyer' && buyers.length < MAX_PARTIES) {
            setBuyers(prev => [...prev, prev.length]);
        } else if (partyType === 'seller' && sellers.length < MAX_PARTIES) {
            setSellers(prev => [...prev, prev.length]);
        }
    };

    const handleRemoveParty = (partyType: 'buyer' | 'seller', indexToRemove: number) => {
        const setParties = partyType === 'buyer' ? setBuyers : setSellers;
        const parties = partyType === 'buyer' ? buyers : sellers;

        if (parties.length > 1) {
            // Remove the party
            setParties(prev => {
                const newParties = prev.filter((_, index) => index !== indexToRemove);
                return newParties.map((_, index) => index);
            });
            
            // Clear form data for the removed party
            setValue(`${partyType}-type-${indexToRemove}`, undefined);
            setValue(`name-${partyType}-${indexToRemove}`, undefined);
            setValue(`address-${partyType}-${indexToRemove}`, undefined);
        }
    };

    const getPartyLabel = (partyType: 'buyer' | 'seller', index: number) => {
        const parties = partyType === 'buyer' ? buyers : sellers;
        if (parties.length === 1) return '';
        const labels = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
        return `${labels[index]} ${partyType.charAt(0).toUpperCase() + partyType.slice(1)}`;
    };

    const renderPartySection = (partyType: 'buyer' | 'seller') => {
        const parties = partyType === 'buyer' ? buyers : sellers;
        
        const renderParty = (index: number) => (
            <>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{getPartyLabel(partyType, index)}</h3>
                    {index > 0 && (
                        <button
                            type="button"
                            onClick={() => handleRemoveParty(partyType, index)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            aria-label={`Remove ${partyType}`}
                        >
                            Remove
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
                
                {/* Party Type Selection */}
                <div className="mb-6">
                    <h4 className="mb-2 text-lg font-medium">Who is the {partyType}?</h4>
                    <Controller
                        name={`${partyType}-type-${index}`}
                        control={control}
                        render={({ field }) => (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {partyTypeOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <div
                                            key={option.value}
                                            className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 ${
                                                field.value === option.value
                                                    ? "border-emerald-500 bg-emerald-50"
                                                    : "border-gray-200"
                                            }`}
                                            onClick={() => field.onChange(option.value)}
                                        >
                                            <div className="flex items-start">
                                                <div
                                                    className={`relative h-5 w-5 flex-shrink-0 rounded-full ${
                                                        field.value === option.value
                                                            ? "bg-emerald-500 border-emerald-500"
                                                            : "bg-white border-2 border-gray-300"
                                                    }`}
                                                >
                                                    {field.value === option.value && (
                                                        <svg
                                                            className="absolute inset-0 h-full w-full p-1 text-white"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="ml-3 flex items-center">
                                                    <Icon className="mr-2 h-5 w-5 text-gray-500" />
                                                    <label className="cursor-pointer text-lg font-medium text-gray-700">
                                                        {option.label}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    />
                </div>
                
                {/* Name and Address Fields */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor={`name-${partyType}-${index}`} className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <Controller
                            name={`name-${partyType}-${index}`}
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="text"
                                    id={`name-${partyType}-${index}`}
                                    placeholder={`Enter ${partyType}'s name`}
                                    className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    title="Enter the full legal name as it should appear on official documents"
                                    {...field}
                                />
                            )}
                        />
                    </div>
                    <div>
                        <label htmlFor={`address-${partyType}-${index}`} className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
                        <Controller
                            name={`address-${partyType}-${index}`}
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="text"
                                    id={`address-${partyType}-${index}`}
                                    placeholder="e.g. Street, City, State ZIP Code"
                                    className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    title={`Enter the complete mailing address for the ${partyType}`}
                                    {...field}
                                />
                            )}
                        />
                    </div>
                </div>
            </>
        );

        return (
            <DynamicFormSection
                title={`${partyType.charAt(0).toUpperCase() + partyType.slice(1)} Details`}
                fieldPrefix={partyType}
                items={parties}
                renderItem={renderParty}
                onAddItem={() => handleAddParty(partyType)}
                onRemoveItem={(index) => handleRemoveParty(partyType, index)}
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