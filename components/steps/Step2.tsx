import React, { useState } from 'react';

const Step2 = ({ currentSubstep, onInputChange }) => {
  const [showStateSelection, setShowStateSelection] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [addAddressNow, setAddAddressNow] = useState(false);
  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
    'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  const handleStateSelect = (state) => {
    onInputChange({ target: { name: 'property-location', value: state } });
    setSelectedState(state);
    setShowStateSelection(false);
  };

  const handleAddressOption = (option) => {
    setAddAddressNow(option === 'now');
  };

  return (
    <div className="mx-auto grid grid-cols-2 gap-x-8 gap-y-10">
      <h1 className="col-span-2 sm:col-span-2 text-3xl font-bold text-gray-900">Property Location</h1>
      {currentSubstep === 1 && (
        <div className="col-span-2 sm:col-span-2">
          <label htmlFor="property-location" className="block text-xl font-medium leading-6 text-gray-900">Where is the house located?</label>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowStateSelection(true)}
              className="mt-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
        </div>
      )}

      {currentSubstep === 2 && (
        <div className="col-span-2 sm:col-span-2">
          <label htmlFor="address-option" className="block text-xl font-medium leading-6 text-gray-900">When would you like to add the house address?</label>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => handleAddressOption('later')}
              className={`mt-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${!addAddressNow ? 'bg-emerald-500 text-gray-900' : 'text-gray-500'}`}
            >
              After printing or downloading
            </button>
            <button
              type="button"
              onClick={() => handleAddressOption('now')}
              className={`mt-2 ml-4 rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${addAddressNow ? 'bg-emerald-500 text-gray-900' : 'text-gray-500'}`}
            >
              Now
            </button>
          </div>
          {addAddressNow && (
            <div className="mt-8">
              <label htmlFor="full-address" className="block text-sm font-medium leading-6 text-gray-900">Full Address:</label>
              <input
                type="text"
                name="full-address"
                id="full-address"
                placeholder="e.g., Street, City, State ZIP Code"
                className="block w-full rounded-md border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:outline-none focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                onChange={onInputChange}
              />
            </div>
          )}
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

export default Step2;
