// FormQuestion.tsx
import React, { useState, useEffect } from 'react';
import { FormQuestionProps, Option } from '../types';

const FormQuestion: React.FC<FormQuestionProps> = ({ question, onChange, title }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textFieldValues, setTextFieldValues] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (selectedOption) {
      onChange(question.id, selectedOption, textFieldValues);
    }
  }, [selectedOption, textFieldValues]);

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    setTextFieldValues({}); // Reset text field values when option changes
  };

  const handleTextFieldChange = (fieldIndex: number, textValue: string) => {
    setTextFieldValues(prev => ({
      ...prev,
      [fieldIndex]: textValue
    }));
  };

  return (
    <div className="space-y-6">
      {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
      <h2 className="text-2xl text-gray-900">{question.title}</h2>
      {question.description && <p className="text-lg text-gray-600">{question.description}</p>}
      
      <div className="space-y-4">
        {question.options.map((option: Option) => (
          <div key={option.value} className={`flex items-center p-4 border rounded-lg cursor-pointer ${selectedOption === option.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => handleOptionChange(option.value)}>
            <input
              type="radio"
              name={question.id}
              value={option.value}
              checked={selectedOption === option.value}
              onChange={() => {}}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
            />
            <label className="ml-3 flex items-center">
              {option.image && <img src={option.image} alt={option.label} className="w-10 h-10 mr-3" />}
              <span className="text-lg font-medium text-gray-900">{option.label}</span>
            </label>
          </div>
        ))}
      </div>
      
      {selectedOption && question.options.find(opt => opt.value === selectedOption)?.textFields && (
        <div className="mt-6 space-y-4">
          {question.options.find(opt => opt.value === selectedOption)?.textFields?.map((field, index) => (
            <div key={index}>
              <label htmlFor={`text-field-${index}`} className="block text-lg font-medium text-gray-700">{field.label || 'Additional Information:'}</label>
              <input
                type="text"
                id={`text-field-${index}`}
                placeholder={field.placeholder}
                onChange={(e) => handleTextFieldChange(index, e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-lg"
              />
              {field.helperText && <p className="mt-2 text-sm text-gray-500">{field.helperText}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormQuestion;