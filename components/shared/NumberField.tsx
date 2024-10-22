import React from 'react';

interface NumberFieldProps {
  id: string;
  label?: string;
  placeholder?: string;
  prefix?: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

const NumberField: React.FC<NumberFieldProps> = ({ id, label, placeholder, prefix, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
    onChange(isNaN(numValue) ? null : numValue);
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="mt-1 relative rounded-md shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type="text"
          id={id}
          className={`block w-full p-3 border-gray-300 rounded-md ${
            prefix ? 'pl-7' : ''
          }`}
          placeholder={placeholder}
          value={value !== null ? value.toLocaleString() : ''}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default NumberField;
