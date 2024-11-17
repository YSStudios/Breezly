import React, { useState, useCallback, useEffect } from 'react';
import { FormQuestionProps, Option, TextField } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const FormQuestion: React.FC<FormQuestionProps> = ({ question, onChange, title, initialValue, initialTextFieldValues = {} }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialValue ? initialValue.split(',') : []);
  const [textFieldValues, setTextFieldValues] = useState<{ [key: number]: string }>(initialTextFieldValues);

  // Update the parent state when selectedOptions or textFieldValues change
  useEffect(() => {
    updateParentState();
  }, [selectedOptions, textFieldValues]);

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
    
    setSelectedOptions(newSelectedOptions);  // Trigger the state update
  };

  const handleTextFieldChange = (fieldIndex: number, textValue: string) => {
    setTextFieldValues(prev => ({
      ...prev,
      [fieldIndex]: textValue
    }));
  };

  const renderTextField = (field: TextField, index: number) => {
    if (field.type === 'date') {
      return (
        <input
          type="date"
          id={`text-field-${index}`}
          value={textFieldValues[index] || ''}
          onChange={(e) => handleTextFieldChange(index, e.target.value)}
          className="w-full mt-1 px-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-xl"
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
          className={`mt-1 px-2 py-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-xl ${field.prefix ? 'pl-7' : ''}`}
        />
      </div>
    );
  };

  const isSingleTextField = question.options.length === 1 && question.options[0].textFields;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const checkboxVariants = {
    checked: { 
      backgroundColor: "#10B981",
      border: "2px solid #10B981",
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    unchecked: { 
      backgroundColor: "white",
      border: "2px solid #D1D5DB",
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const optionVariants = {
    checked: {
      backgroundColor: "rgb(236 253 245)", // emerald-50
      borderColor: "rgb(16 185 129)", // emerald-500
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    },
    unchecked: {
      backgroundColor: "white",
      borderColor: "rgb(229 231 235)", // gray-200
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {title && (
        <motion.h2 variants={itemVariants} className="text-3xl font-bold text-gray-900">
          {title}
        </motion.h2>
      )}
      {question.description && (
        <motion.p variants={itemVariants} className="text-lg text-gray-600">
          {question.description}
        </motion.p>
      )}
      
      {isSingleTextField ? (
        <motion.div variants={itemVariants} className="space-y-4">
          {question.options[0].textFields?.map((field, index) => (
            <div key={index}>
              {field.label && <label htmlFor={`text-field-${index}`} className="block text-sm font-medium text-gray-700">{field.label}</label>}
              {renderTextField(field, index)}
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={containerVariants}
        >
          <AnimatePresence>
            {question.options.map((option: Option, optionIndex: number) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                  delay: optionIndex * 0.1
                }}
                className="flex flex-col p-4 border-2 rounded-lg cursor-pointer"
                onClick={() => handleOptionChange(option.value)}
                style={{
                  backgroundColor: selectedOptions.includes(option.value) ? "rgb(236 253 245)" : "white",
                  borderColor: selectedOptions.includes(option.value) ? "rgb(16 185 129)" : "rgb(229 231 235)",
                }}
              >
                <div className="flex items-start">
                  <motion.div
                    variants={checkboxVariants}
                    initial="unchecked"
                    animate={selectedOptions.includes(option.value) ? "checked" : "unchecked"}
                    className="relative h-5 w-5 rounded-full flex-shrink-0"
                  >
                    <input
                      type={question.multiSelect ? "checkbox" : "radio"}
                      name={question.id}
                      value={option.value}
                      checked={selectedOptions.includes(option.value)}
                      onChange={() => {}}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {selectedOptions.includes(option.value) && (
                      <motion.svg
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 h-full w-full text-white p-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    )}
                  </motion.div>
                  <label className="ml-3 text-lg font-medium text-gray-700 cursor-pointer">
                    {option.label}
                  </label>
                </div>
                {option.textFields && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: selectedOptions.includes(option.value) ? "auto" : 0 }}
                    transition={{ 
                      duration: 0.7,
                      ease: [0.4, 0, 0.2, 1],
                      delay: 0.2
                    }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
                      {option.textFields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="mt-2">
                          {field.label && (
                            <label 
                              htmlFor={`text-field-${optionIndex}-${fieldIndex}`} 
                              className="block text-lg font-medium text-gray-700"
                            >
                              {field.label}
                            </label>
                          )}
                          {renderTextField(field, fieldIndex)}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FormQuestion;
