import React from "react";

interface DynamicFormSectionProps {
  title: string;
  fieldPrefix: string;
  items: number[];
  renderItem: (index: number) => React.ReactNode;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  addButtonText: string;
  maxItems: number;
}

const DynamicFormSection: React.FC<DynamicFormSectionProps> = ({
  title,
  fieldPrefix,
  items,
  renderItem,
  onAddItem,
  onRemoveItem,
  addButtonText,
  maxItems
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      
      {items.map((item, index) => (
        <div key={`${fieldPrefix}-${index}`} className="p-6 border rounded-lg bg-white shadow-sm">
          {renderItem(index)}
        </div>
      ))}
      
      {items.length < maxItems && (
        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {addButtonText}
        </button>
      )}
    </div>
  );
};

export default DynamicFormSection; 