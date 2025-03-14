import { useFormFlow } from '../context/FormContext';
import { getStepByIndex, getSubstepByIndex } from '../config/formConfig';

export function SubstepNavigation() {
  const { 
    currentStep, 
    currentSubstep, 
    totalSubsteps, 
    goToStep, 
    isLocked 
  } = useFormFlow();
  
  const stepConfig = getStepByIndex(currentStep);
  
  if (totalSubsteps <= 1) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
        {Array.from({ length: totalSubsteps }).map((_, idx) => {
          const substepNumber = idx + 1;
          const substepConfig = getSubstepByIndex(currentStep, substepNumber);
          const isActive = substepNumber === currentSubstep;
          
          return (
            <button
              key={substepConfig?.id}
              type="button"
              onClick={() => !isLocked && goToStep(currentStep, substepNumber)}
              disabled={isLocked}
              className={`
                flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium 
                ${isActive ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              {substepConfig?.title}
            </button>
          );
        })}
      </div>
    </div>
  );
} 