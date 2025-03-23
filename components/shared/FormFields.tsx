import React from "react";
import { useFormContext, Controller, Control, useWatch, FieldValues } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Option, TextField } from "../types";

// Add these types at the top of FormFields.tsx
interface RadioFieldProps {
  name: string;
  options: Array<{
    value: string;
    label: string;
    icon?: React.ComponentType<any>;
  }>;
  label?: string; // Make label optional
  description?: string;
  tooltip?: string; // Make tooltip optional
  control?: Control<any, any>; // Add control prop
}

interface RadioFieldWithTextProps {
  name: string;
  options: Array<{
    value: string;
    label: string;
    icon?: React.ComponentType<any>;
    textFields?: Array<{
      type?: string;
      label?: string;
      placeholder?: string;
      prefix?: string;
    }>;
  }>;
  label?: string; // Make label optional
  description?: string;
  textFieldName?: string;
  title?: string; // Add title property
  control?: Control<any, any>; // Add control prop
}

interface CheckboxFieldProps {
  name: string;
  options: Array<{
    value: string;
    label: string;
    icon?: React.ComponentType<any>;
  }>;
  label?: string; // Make label optional
  description?: string;
  control?: Control<any, any>; // Add control prop
}

interface MoneyFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  control?: Control<any, any>; // Add control prop
}

// RadioField component for radio button groups
export const RadioField: React.FC<RadioFieldProps> = ({ name, options, label, description, tooltip, control }) => {
  const formContext = useFormContext();
  const controlToUse = control || (formContext ? formContext.control : undefined);
  
  return (
    <div className="space-y-4">
      {label && <h2 className="text-3xl font-bold text-gray-900">{label}</h2>}
      {description && <p className="text-lg text-gray-600">{description}</p>}

      <Controller
        name={name}
        control={controlToUse}
        render={({ field }) => (
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            <AnimatePresence>
              {options.map((option, index) => (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    delay: index * 0.1,
                  }}
                  className="flex cursor-pointer flex-col rounded-lg border-2 p-4"
                  onClick={() => field.onChange(option.value)}
                  style={{
                    backgroundColor: field.value === option.value ? "rgb(236 253 245)" : "white",
                    borderColor: field.value === option.value ? "rgb(16 185 129)" : "rgb(229 231 235)",
                  }}
                >
                  <div className="flex items-start">
                    <motion.div
                      variants={{
                        checked: {
                          backgroundColor: "#10B981",
                          border: "2px solid #10B981",
                        },
                        unchecked: {
                          backgroundColor: "white",
                          border: "2px solid #D1D5DB",
                        },
                      }}
                      initial="unchecked"
                      animate={field.value === option.value ? "checked" : "unchecked"}
                      className="relative h-5 w-5 flex-shrink-0 rounded-full"
                    >
                      <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => {}}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      {field.value === option.value && (
                        <motion.svg
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 h-full w-full p-1 text-white"
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
                    <label className="ml-3 cursor-pointer text-lg font-medium text-gray-700">
                      {option.label}
                    </label>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      />
    </div>
  );
};

// RadioFieldWithText component for radio buttons with text fields
export const RadioFieldWithText: React.FC<RadioFieldWithTextProps> = ({ 
  name, options, label, description, textFieldName, title, control
}) => {
  const formContext = useFormContext();
  const controlToUse = control || (formContext ? formContext.control : null);
  
  // Using null coalescing for control
  const value = useWatch({
    control: controlToUse ?? undefined,
    name,
    defaultValue: ""
  });
  
  if (!controlToUse) {
    console.error("No form control available. Make sure the component is within a FormProvider.");
    return <div>Error: Form control not available</div>;
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}
      {label && <h2 className="text-3xl font-bold text-gray-900">{label}</h2>}
      {description && <p className="text-lg text-gray-600">{description}</p>}

      <Controller
        name={name}
        control={controlToUse}
        render={({ field }) => (
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            <AnimatePresence>
              {options.map((option, optionIndex) => (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    delay: optionIndex * 0.1,
                  }}
                  className="flex cursor-pointer flex-col rounded-lg border-2 p-4"
                  onClick={() => field.onChange(option.value)}
                  style={{
                    backgroundColor: field.value === option.value ? "rgb(236 253 245)" : "white",
                    borderColor: field.value === option.value ? "rgb(16 185 129)" : "rgb(229 231 235)",
                  }}
                >
                  <div className="flex items-start">
                    <motion.div
                      variants={{
                        checked: {
                          backgroundColor: "#10B981",
                          border: "2px solid #10B981",
                        },
                        unchecked: {
                          backgroundColor: "white",
                          border: "2px solid #D1D5DB",
                        },
                      }}
                      initial="unchecked"
                      animate={field.value === option.value ? "checked" : "unchecked"}
                      className="relative h-5 w-5 flex-shrink-0 rounded-full"
                    >
                      <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => {}}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      {field.value === option.value && (
                        <motion.svg
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 h-full w-full p-1 text-white"
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
                    <label className="ml-3 cursor-pointer text-lg font-medium text-gray-700">
                      {option.label}
                    </label>
                  </div>

                  {option.textFields && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: field.value === option.value ? "auto" : 0,
                      }}
                      transition={{
                        duration: 0.7,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.2,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4">
                        {option.textFields.map((fieldItem, fieldIndex) => (
                          <div key={fieldIndex} className="mt-2">
                            {fieldItem.label && (
                              <label
                                htmlFor={`text-field-${optionIndex}-${fieldIndex}`}
                                className="block text-lg font-medium text-gray-700"
                              >
                                {fieldItem.label}
                              </label>
                            )}
                            <Controller
                              name={`${textFieldName || name}_text_${fieldIndex}`}
                              control={controlToUse}
                              render={({ field: textField }) => (
                                <div className="relative rounded-md shadow-sm">
                                  {fieldItem.prefix && (
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                      <span className="text-gray-500 sm:text-lg">{fieldItem.prefix}</span>
                                    </div>
                                  )}
                                  <input
                                    type={fieldItem.type === "date" ? "date" : "text"}
                                    id={`text-field-${optionIndex}-${fieldIndex}`}
                                    placeholder={fieldItem.placeholder}
                                    {...textField}
                                    className={`mt-1 block w-full rounded-md border-gray-300 px-2 py-2 text-xl shadow-sm focus:border-emerald-500 focus:ring-emerald-500 ${
                                      fieldItem.prefix ? "pl-7" : ""
                                    }`}
                                  />
                                </div>
                              )}
                            />
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
      />
    </div>
  );
};

// CheckboxField component for multi-select options
export const CheckboxField: React.FC<CheckboxFieldProps> = ({ name, options, label, description, control }) => {
  const formContext = useFormContext();
  const controlToUse = control || (formContext ? formContext.control : null);
  
  // Using null coalescing for control
  const watchedValue = useWatch({
    control: controlToUse ?? undefined,
    name,
    defaultValue: []
  });
  
  if (!controlToUse) {
    console.error("No form control available. Make sure the component is within a FormProvider.");
    return <div>Error: Form control not available</div>;
  }
  
  // Convert string to array if needed
  const selectedValues = typeof watchedValue === 'string' 
    ? watchedValue.split(',').filter(v => v.trim() !== '')
    : Array.isArray(watchedValue) ? watchedValue : [];

  return (
    <div className="space-y-4">
      {label && <h2 className="text-3xl font-bold text-gray-900">{label}</h2>}
      {description && <p className="text-lg text-gray-600">{description}</p>}

      <Controller
        name={name}
        control={controlToUse}
        render={({ field }) => (
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            <AnimatePresence>
              {options.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                
                return (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                      delay: index * 0.1,
                    }}
                    className="flex cursor-pointer flex-col rounded-lg border-2 p-4"
                    onClick={() => {
                      const newValues = isSelected
                        ? selectedValues.filter(v => v !== option.value)
                        : [...selectedValues, option.value];
                      field.onChange(newValues.join(','));
                    }}
                    style={{
                      backgroundColor: isSelected ? "rgb(236 253 245)" : "white",
                      borderColor: isSelected ? "rgb(16 185 129)" : "rgb(229 231 235)",
                    }}
                  >
                    <div className="flex items-start">
                      <motion.div
                        variants={{
                          checked: {
                            backgroundColor: "#10B981",
                            border: "2px solid #10B981",
                          },
                          unchecked: {
                            backgroundColor: "white",
                            border: "2px solid #D1D5DB",
                          },
                        }}
                        initial="unchecked"
                        animate={isSelected ? "checked" : "unchecked"}
                        className="relative h-5 w-5 flex-shrink-0 rounded-md"
                      >
                        <input
                          type="checkbox"
                          name={`${name}[${option.value}]`}
                          checked={isSelected}
                          onChange={() => {}}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                        {isSelected && (
                          <motion.svg
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 h-full w-full p-1 text-white"
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
                      <label className="ml-3 cursor-pointer text-lg font-medium text-gray-700">
                        {option.label}
                      </label>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      />
    </div>
  );
};

// MoneyField component for currency inputs
export const MoneyField: React.FC<MoneyFieldProps> = ({ name, label, placeholder, control }) => {
  const formContext = useFormContext();
  const controlToUse = control || (formContext ? formContext.control : null);
  
  if (!controlToUse) {
    console.error("No form control available. Make sure the component is within a FormProvider.");
    return <div>Error: Form control not available</div>;
  }
  
  return (
    <div>
      {label && <label className="block text-lg font-medium text-gray-700">{label}</label>}
      <Controller
        name={name}
        control={controlToUse}
        render={({ field }) => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            // Process input, removing non-numeric characters except dots
            const value = e.target.value.replace(/[^0-9.]/g, '');
            field.onChange(value);
          };
          
          return (
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-lg">$</span>
              </div>
              <input
                type="text"
                {...field}
                onChange={handleChange}
                placeholder={placeholder}
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-emerald-500 focus:ring-emerald-500 sm:text-lg"
              />
            </div>
          );
        }}
      />
    </div>
  );
}; 