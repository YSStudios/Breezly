import React from 'react';
import Image from 'next/image';
import formimage from "../public/formimage.png";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

export const substepNames: { [key: number]: { [key: number]: string } } = {
  1: { 1: "" },
  2: { 1: "Location", 2: "Address", 3: "Features", 4: "Additional Details" },
  3: { 1: "Buyer Details", 2: "Seller Details" },
  4: { 1: "Purchase Price", 2: "Deposit", 3: "Escrow Agent", 4: "Closing and Possession", 5: "Conditions", 6: "Condition Details", 7: "Additional Clauses", 8: "Acceptance"},
  5: { 1: "Review and Generate" }
};

export const stepTitles = [
  "Property Type",
  "Property Details",
  "Parties",
  "Terms",
  "Send Offer/Download"
];

interface SidebarProps {
  currentStep: number;
  currentSubstep: number;
  handleSetStep: (step: number, substep?: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentStep, currentSubstep, handleSetStep }) => {
  const stepIcons = [
    HomeIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    DocumentTextIcon,
    PaperAirplaneIcon
  ];

  return (
    <div className="bg-emerald-500 rounded-lg p-4">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((step) => {
          const Icon = stepIcons[step - 1];
          const isCurrentStep = currentStep === step;
          return (
            <div
              key={`step-${step}`}
              className={`group relative rounded-lg p-3 text-sm leading-6 hover:bg-emerald-400/50 transition-colors duration-200 ${isCurrentStep ? 'bg-emerald-400/50' : ''}`}
              onClick={() => handleSetStep(step)}
            >
              <div className="flex items-center gap-x-3 cursor-pointer">
                <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg ${isCurrentStep ? 'bg-white' : 'border border-white group-hover:bg-white'}`}>
                  <Icon className={`h-6 w-6 ${isCurrentStep ? 'text-indigo-600' : 'text-white group-hover:text-indigo-600'}`} />
                </div>
                <div className="font-semibold text-white">{stepTitles[step - 1]}</div>
              </div>
              {isCurrentStep && (
                <div className="space-y-1 pl-[52px]">
                  {Object.entries(substepNames[step]).map(([substep, name]) => (
                    <button
                      key={`substep-${step}-${substep}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetStep(step, Number(substep));
                      }}
                      className={`block w-full text-left text-sm ${currentSubstep === Number(substep)
                        ? 'text-white font-bold'
                        : 'text-emerald-100 hover:text-white'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* <div className="mt-8">
        <Image src={formimage} alt="Form decoration" className="w-full h-auto" />
      </div> */}
    </div>
  );
};

export default Sidebar;