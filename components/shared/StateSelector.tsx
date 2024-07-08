// StateSelector.tsx
import React, { useState } from 'react';

interface StateSelectorProps {
  onStateSelect: (state: string) => void;
}

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
  'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const StateSelector: React.FC<StateSelectorProps> = ({ onStateSelect }) => {
  const [showStateSelection, setShowStateSelection] = useState(false);
  const [selectedState, setSelectedState] = useState('');

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setShowStateSelection(false);
    onStateSelect(state);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Property Location</h1>
      <label htmlFor="property-location" className="block text-xl font-medium leading-6 text-gray-900">Where is the house located?</label>
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowStateSelection(true)}
          className="mt-2 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Choose your state
        </button>
      </div>
      {selectedState && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <label htmlFor="selected-state" className="block text-sm font-medium leading-6 text-gray-900">Selected State:</label>
            <p id="selected-state" className="text-xl font-semibold">{selectedState}</p>
            <p>Each state has its own set of rules and regulations. Your Offer to Purchase Real Estate will be tailored specifically for {selectedState}.</p>
          </div>
        </div>
      )}

      {showStateSelection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
            <h2 className="text-xl font-bold mb-4">Select your state</h2>
            <div className="grid grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
              {states.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => handleStateSelect(state)}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-300"
                >
                  {state}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowStateSelection(false)}
              className="mt-4 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateSelector;