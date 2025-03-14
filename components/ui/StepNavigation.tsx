import { useFormFlow } from '../context/FormContext';
import { getStepByIndex } from '../config/formConfig';
import { CheckIcon } from '@heroicons/react/24/solid';

export function StepNavigation() {
  const { 
    currentStep, 
    currentSubstep, 
    totalSteps, 
    goToStep,
    isLocked 
  } = useFormFlow();
  
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNumber = idx + 1;
          const stepConfig = getStepByIndex(stepNumber);
          const stepStatus = 
            stepNumber < currentStep ? 'complete' :
            stepNumber === currentStep ? 'current' : 
            'upcoming';
            
          return (
            <li key={stepConfig?.id} className="md:flex-1">
              <button
                type="button"
                onClick={() => !isLocked && stepStatus !== 'upcoming' && goToStep(stepNumber)}
                disabled={isLocked || stepStatus === 'upcoming'}
                className={`
                  group flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0
                  ${stepStatus === 'complete' ? 'border-emerald-500' : ''}
                  ${stepStatus === 'current' ? 'border-emerald-600' : ''}
                  ${stepStatus === 'upcoming' ? 'border-gray-200' : ''}
                `}
              >
                <span className="flex items-center text-sm font-medium">
                  <span className={`
                    flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full
                    ${stepStatus === 'complete' ? 'bg-emerald-500 group-hover:bg-emerald-600' : ''}
                    ${stepStatus === 'current' ? 'border-2 border-emerald-600 bg-white' : ''}
                    ${stepStatus === 'upcoming' ? 'border-2 border-gray-300 bg-white' : ''}
                  `}>
                    {stepStatus === 'complete' ? (
                      <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                    ) : (
                      <span className={`
                        ${stepStatus === 'current' ? 'text-emerald-600' : 'text-gray-500'}
                      `}>
                        {stepNumber}
                      </span>
                    )}
                  </span>
                  <span className={`ml-3 text-sm font-medium ${
                    stepStatus === 'complete' ? 'text-emerald-500' :
                    stepStatus === 'current' ? 'text-emerald-600' :
                    'text-gray-500'
                  }`}>
                    {stepConfig?.title}
                  </span>
                </span>
                <span className="mt-0.5 ml-12 md:ml-9 text-xs text-gray-500">
                  {stepConfig?.description}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 