import React from "react";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

type StepConfig = {
  title: string;
  icon: typeof HomeIcon;
  substeps: { [key: number]: string };
};

type StepConfigs = {
  [key: number]: StepConfig;
};

const baseStepConfigs: StepConfigs = {
  1: {
    title: "Property Type",
    icon: HomeIcon,
    substeps: { 1: "" },
  },
  2: {
    title: "Property Details",
    icon: BuildingOfficeIcon,
    substeps: {
      1: "Address",
      2: "Features",
      3: "Additional Details",
    },
  },
  3: {
    title: "Parties",
    icon: UserGroupIcon,
    substeps: {
      1: "Buyer Details",
      2: "Seller Details",
    },
  },
  4: {
    title: "Terms",
    icon: DocumentTextIcon,
    substeps: {
      1: "Purchase Price",
      2: "Deposit",
      3: "Escrow Agent",
      4: "Closing and Possession",
      5: "Conditions",
    },
  },
  5: {
    title: "Review & Send",
    icon: PaperAirplaneIcon,
    substeps: {},
  },
};

export const stepTitles = Object.values(baseStepConfigs).map(
  (config) => config.title,
);

const getStepConfigs = (hasConditions: string | undefined): StepConfigs => {
  const configs = { ...baseStepConfigs };

  // Dynamically update step 4's substeps based on conditions
  configs[4] = {
    ...configs[4],
    substeps: {
      ...configs[4].substeps,
      ...(hasConditions === "Yes"
        ? {
            6: "Additional Clauses",
            7: "Acceptance Deadline",
          }
        : {
            6: "Additional Clauses",
            7: "Acceptance Deadline",
          }),
    },
  };

  return configs;
};

export const getSubstepNames = (hasConditions: string | undefined) => {
  const configs = getStepConfigs(hasConditions);
  return Object.entries(configs).reduce((acc, [step, config]) => {
    acc[Number(step)] = config.substeps;
    return acc;
  }, {} as { [key: number]: { [key: number]: string } });
};

export const substepNames = getSubstepNames(undefined);

interface SidebarProps {
  currentStep: number;
  currentSubstep: number;
  handleSetStep: (step: number, substep?: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentStep,
  currentSubstep,
  handleSetStep,
}) => {
  const { watch } = useFormContext();
  const hasConditions = watch("hasConditions");
  const stepConfigs = getStepConfigs(hasConditions);

  return (
    <div className="rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 p-4">
      <div className="space-y-4">
        {Object.entries(stepConfigs).map(([step, config]) => {
          const stepNumber = Number(step);
          const Icon = config.icon;
          const isCurrentStep = currentStep === stepNumber;

          return (
            <div
              key={`step-${step}`}
              className={`group relative rounded-lg p-3 text-sm leading-6 transition-colors duration-200 hover:bg-emerald-400/50 ${
                isCurrentStep ? "bg-emerald-400/50" : ""
              }`}
              onClick={() => handleSetStep(stepNumber)}
            >
              <div className="flex cursor-pointer items-center gap-x-3">
                <div
                  className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg ${
                    isCurrentStep
                      ? "bg-white"
                      : "border border-white group-hover:bg-white"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isCurrentStep
                        ? "text-indigo-600"
                        : "text-white group-hover:text-indigo-600"
                    }`}
                  />
                </div>
                <div className="font-semibold text-white">{config.title}</div>
              </div>
              {isCurrentStep && (
                <div className="space-y-1 pl-[52px]">
                  {Object.entries(config.substeps).map(([substep, name]) => (
                    <button
                      key={`substep-${step}-${substep}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetStep(stepNumber, Number(substep));
                      }}
                      className={`block w-full text-left text-sm ${
                        currentSubstep === Number(substep)
                          ? "font-bold text-white"
                          : "text-emerald-100 hover:text-white"
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
