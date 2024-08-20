import React, { useState, useCallback } from 'react';
import { FormQuestionProps, Option, TextField } from '../types';

const FormQuestion: React.FC<FormQuestionProps> = ({ question, onChange, title, initialValue, initialTextFieldValues = {} }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialValue ? initialValue.split(',') : []);
  const [textFieldValues, setTextFieldValues] = useState<{ [key: number]: string }>(initialTextFieldValues);

  const updateParentState = useCallback(() => {
    if (question.options.length === 1 && question.options[0].textFields) {
      onChange(question.id, textFieldValues[0] || '', textFieldValues);
    } else {
      onChange(question.id, selectedOptions.join(','), textFieldValues);
    }
  }, [question.id, question.options.length, selectedOptions, textFieldValues, onChange]);

  const handleOptionChange = (value: string) => {
    let newSelectedOptions: string[];
    if (question.multiSelect) {
      newSelectedOptions = selectedOptions.includes(value)
        ? selectedOptions.filter(v => v !== value)
        : [...selectedOptions, value];
    } else {
      newSelectedOptions = [value];
    }
    
    setSelectedOptions(newSelectedOptions);
    
    // Call updateParentState after state updates
    setTimeout(() => {
      updateParentState();
    }, 0);
  };

  const handleTextFieldChange = (fieldIndex: number, textValue: string) => {
    setTextFieldValues(prev => {
      const newTextFieldValues = {
        ...prev,
        [fieldIndex]: textValue
      };
      
      // Call updateParentState after state update
      setTimeout(() => {
        updateParentState();
      }, 0);
      
      return newTextFieldValues;
    });
  };

  const renderTextField = (field: TextField, index: number) => {
    if (field.type === 'date') {
      return (
        <input
          type="date"
          id={`text-field-${index}`}
          value={textFieldValues[index] || ''}
          onChange={(e) => handleTextFieldChange(index, e.target.value)}
          className="mt-1 px-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-lg"
        />
      );
    }
    
    return (
      <div className="relative rounded-md shadow-sm">
        {field.prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-lg">{field.prefix}</span>
          </div>
        )}
        <input
          type="text"
          id={`text-field-${index}`}
          placeholder={field.placeholder}
          value={textFieldValues[index] || ''}
          onChange={(e) => handleTextFieldChange(index, e.target.value)}
          className={`mt-1 px-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-lg ${field.prefix ? 'pl-7' : ''}`}
        />
      </div>
    );
  };

  const isSingleTextField = question.options.length === 1 && question.options[0].textFields;

  return (
    <div className="space-y-6">
      {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}
      {question.description && <p className="text-lg text-gray-600">{question.description}</p>}
      
      {isSingleTextField ? (
        <div className="space-y-4">
          {question.options[0].textFields?.map((field, index) => (
            <div key={index}>
              {field.label && <label htmlFor={`text-field-${index}`} className="block text-sm font-medium text-gray-700">{field.label}</label>}
              {renderTextField(field, index)}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {question.options.map((option: Option, optionIndex: number) => (
            <div key={option.value} className={`flex flex-col p-4 border rounded-lg cursor-pointer ${selectedOptions.includes(option.value) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => handleOptionChange(option.value)}>
              <div className="flex items-center">
                <input
                  type={question.multiSelect ? "checkbox" : "radio"}
                  name={question.id}
                  value={option.value}
                  checked={selectedOptions.includes(option.value)}
                  onChange={() => {}}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <label className="ml-3 flex items-center">
                  {option.icon && <option.icon className="h-8 w-8 text-emerald-500 mr-2" />}
                  <span className="text-lg font-medium text-gray-900">{option.label}</span>
                </label>
              </div>
              {selectedOptions.includes(option.value) && option.textFields && (
                <div className="mt-4 space-y-4">
                  {option.textFields.map((field, fieldIndex) => (
                    <div key={fieldIndex}>
                      {field.label && <label htmlFor={`text-field-${optionIndex}-${fieldIndex}`} className="block text-sm font-medium text-gray-700">{field.label}</label>}
                      {renderTextField(field, fieldIndex)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormQuestion;