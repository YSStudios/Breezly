import React from 'react';
import { StepProps } from '../types';
import { HomeIcon, BuildingOffice2Icon, BuildingOfficeIcon, HomeModernIcon, TruckIcon, BuildingStorefrontIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const propertyTypes = [
  { value: 'house', label: 'House', icon: HomeIcon },
  { value: 'apartment', label: 'Apartment', icon: BuildingOffice2Icon },
  { value: 'condo', label: 'Condo', icon: BuildingOfficeIcon },
  { value: 'duplex', label: 'Duplex', icon: HomeModernIcon },
  { value: 'townhouse', label: 'Townhouse', icon: HomeModernIcon },
  { value: 'mobile-home', label: 'Mobile Home', icon: TruckIcon },
  { value: 'commercial', label: 'Commercial', icon: BuildingStorefrontIcon },
  { value: 'other', label: 'Other', icon: QuestionMarkCircleIcon },
];

const Step1: React.FC<StepProps> = ({ currentSubstep, onInputChange, formData }) => {
  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Offer to Purchase Real Estate</h1>
      {currentSubstep === 1 && (
        <>
          <p className="text-lg text-gray-600 mb-6">What type of property is this offer for?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData['property-type'] === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => onInputChange('property-type', type.value)}
                  className={`
                    relative overflow-hidden rounded-xl 
                    px-4 py-5 text-sm font-bold
                    transition-all duration-300 ease-in-out
                    transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300
                    ${isSelected
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 shadow'
                    }
                  `}
                >
                  <div className={`
                    absolute inset-0 opacity-0 transition-opacity duration-300 ease-in-out
                    bg-gradient-to-r from-indigo-500 to-purple-500
                    ${!isSelected && 'group-hover:opacity-100'}
                  `} />
                  <div className="relative flex flex-col items-center justify-center">
                    <Icon className={`w-10 h-10 mb-2 ${isSelected ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                    <span>{type.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Step1;