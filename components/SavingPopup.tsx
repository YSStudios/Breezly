import React from "react";

interface SavingPopupProps {
  isVisible: boolean;
}

const SavingPopup: React.FC<SavingPopupProps> = ({ isVisible }) => {
  return (
    <div
      className={`absolute left-1/2 top-full mt-4 -translate-x-1/2 transform rounded-lg bg-emerald-500 p-4 text-white shadow-lg transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="flex items-center space-x-2">
        <svg
          className="h-5 w-5 animate-spin text-white"
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
        <span className="text-xl">Saving...</span>
      </div>
    </div>
  );
};

export default SavingPopup;
