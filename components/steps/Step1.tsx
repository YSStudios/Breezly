import React, { useState } from "react";
import { StepProps } from "../types";
import {
  HomeIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  HomeModernIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const propertyTypes = [
  { value: "house", label: "House", icon: HomeIcon },
  { value: "apartment", label: "Apartment", icon: BuildingOffice2Icon },
  { value: "condo", label: "Condo", icon: BuildingOfficeIcon },
  { value: "duplex", label: "Duplex", icon: HomeModernIcon },
  { value: "townhouse", label: "Townhouse", icon: HomeModernIcon },
  { value: "mobile-home", label: "Mobile Home", icon: TruckIcon },
  { value: "commercial", label: "Commercial", icon: BuildingStorefrontIcon },
  { value: "other", label: "Other", icon: QuestionMarkCircleIcon },
];

const Step1: React.FC<StepProps> = ({
  currentSubstep,
  onInputChange,
  formData,
  onPropertySelect,
}) => {
  const handlePropertyClick = (property: any) => {
    onInputChange("property-type", property.value);
    onPropertySelect(property);
  };

  return (
    <div className="mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Offer to Purchase Real Estate
      </h1>
      {currentSubstep === 1 && (
        <div>
          <p className="mb-6 text-lg text-gray-600">
            What type of property is this offer for?
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData["property-type"] === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => handlePropertyClick(type)}
                  className={`
                    relative transform overflow-hidden 
                    rounded-xl px-4 py-5 text-sm
                    font-bold transition-all duration-300
                    ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg animate-gradient-pulse"
                        : "bg-white text-gray-700 shadow"
                    }
                  `}
                >
                  <div
                    className={`
                    absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0
                    transition-opacity duration-300 ease-in-out
                    ${!isSelected && "group-hover:opacity-100"}
                  `}
                  />
                  <div className="relative flex flex-col items-center justify-center">
                    <Icon
                      className={`mb-2 h-10 w-10 ${
                        isSelected
                          ? "text-white"
                          : "text-gray-500 group-hover:text-white"
                      }`}
                    />
                    <span>{type.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1;
