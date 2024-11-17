import React from "react";

interface SavingPopupProps {
  isVisible: boolean;
}

const SavingPopup: React.FC<SavingPopupProps> = ({ isVisible }) => {
  return (
    <div
      className={`fixed bottom-8 right-8 transform rounded-full bg-white px-6 py-3 
      shadow-lg transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-center space-x-3">
        <svg
          className="h-4 w-4 animate-spin text-emerald-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-sm font-medium text-gray-700">Saving changes...</span>
      </div>
    </div>
  );
};

export default SavingPopup;
