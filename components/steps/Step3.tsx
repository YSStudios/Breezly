// Step3.tsx
import React, { useState } from 'react';
import FormQuestion from '../shared/FormQuestion';
import { StepProps, Question } from '../types';

const MAX_PARTIES = 5;

const Step3: React.FC<StepProps> = ({ currentSubstep, onInputChange }) => {
    const [buyers, setBuyers] = useState([0]);
    const [sellers, setSellers] = useState([0]);
    const [selectedBuyerTypes, setSelectedBuyerTypes] = useState<{ [key: number]: string }>({});
    const [selectedSellerTypes, setSelectedSellerTypes] = useState<{ [key: number]: string }>({});

    const partyTypeQuestion = (partyType: 'buyer' | 'seller'): Question => ({
        id: `${partyType}-type`,
        description: `Who is the ${partyType}?`,
        options: [
            {
                value: 'individual',
                label: 'Individual',
                image: '/icons/individual.svg'
            },
            {
                value: 'corporation',
                label: 'Corporation/Organization',
                image: '/icons/corporation.svg'
            }
        ]
    });

    const handlePartyTypeChange = (partyType: 'buyer' | 'seller', partyIndex: number) => (questionId: string, value: string) => {
        if (partyType === 'buyer') {
            setSelectedBuyerTypes(prev => ({ ...prev, [partyIndex]: value }));
        } else {
            setSelectedSellerTypes(prev => ({ ...prev, [partyIndex]: value }));
        }
        onInputChange(`${questionId}-${partyIndex}`, value);
    };

    const handleAddParty = (partyType: 'buyer' | 'seller') => {
        if (partyType === 'buyer' && buyers.length < MAX_PARTIES) {
            setBuyers(prev => [...prev, prev.length]);
        } else if (partyType === 'seller' && sellers.length < MAX_PARTIES) {
            setSellers(prev => [...prev, prev.length]);
        }
    };

    const handleRemoveParty = (partyType: 'buyer' | 'seller', indexToRemove: number) => {
        const setParties = partyType === 'buyer' ? setBuyers : setSellers;
        const setSelectedTypes = partyType === 'buyer' ? setSelectedBuyerTypes : setSelectedSellerTypes;
        const parties = partyType === 'buyer' ? buyers : sellers;

        if (parties.length > 1) {
            setParties(prev => {
                const newParties = prev.filter((_, index) => index !== indexToRemove);
                return newParties.map((_, index) => index);
            });
            setSelectedTypes(prev => {
                const newTypes = { ...prev };
                for (let i = indexToRemove; i < parties.length - 1; i++) {
                    newTypes[i] = newTypes[i + 1];
                }
                delete newTypes[parties.length - 1];
                return newTypes;
            });
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
        const selectedTypes = partyType === 'buyer' ? selectedBuyerTypes : selectedSellerTypes;

        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">{partyType === 'buyer' ? 'Buyer' : 'Seller'} Details</h2>
                {parties.map((partyIndex) => (
                    <div key={partyIndex} className="bg-white p-6 rounded-lg shadow">
                        {getPartyLabel(partyType, partyIndex) && (
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">{getPartyLabel(partyType, partyIndex)}</h3>
                                {partyIndex > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveParty(partyType, partyIndex)}
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
                        )}
                        <FormQuestion
                            question={partyTypeQuestion(partyType)}
                            onChange={handlePartyTypeChange(partyType, partyIndex)}
                        />
                        
                        {selectedTypes[partyIndex] && (
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label htmlFor={`name-${partyType}-${partyIndex}`} className="block text-sm font-medium text-gray-700">
                                        {selectedTypes[partyIndex] === 'individual' ? 'Full Name:' : 'Name:'}
                                    </label>
                                    <input
                                        type="text"
                                        id={`name-${partyType}-${partyIndex}`}
                                        name={`name-${partyType}-${partyIndex}`}
                                        placeholder={selectedTypes[partyIndex] === 'individual' 
                                            ? (partyType === 'buyer' ? 'e.g. Alex Garcia Smith' : 'e.g. John Doe') 
                                            : (partyType === 'buyer' ? 'e.g. ABC Ltd.' : 'e.g. XYZ Corp')}
                                        onChange={(e) => onInputChange(`name-${partyType}-${partyIndex}`, e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`address-${partyType}-${partyIndex}`} className="block text-sm font-medium text-gray-700">Address:</label>
                                    <input
                                        type="text"
                                        id={`address-${partyType}-${partyIndex}`}
                                        name={`address-${partyType}-${partyIndex}`}
                                        placeholder="e.g. Street, City, State ZIP Code"
                                        onChange={(e) => onInputChange(`address-${partyType}-${partyIndex}`, e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {parties.length < MAX_PARTIES && (
                    <button
                        type="button"
                        onClick={() => handleAddParty(partyType)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        + Add another {partyType}
                    </button>
                )}
            </div>
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