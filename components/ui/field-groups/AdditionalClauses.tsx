import React, { useState } from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { TextField } from '../form/TextField';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function AdditionalClauses() {
  const { control } = useFormContext();
  
  // Use React Hook Form's useFieldArray for handling dynamic clauses
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalClauses"
  });
  
  // Standard clause options with templates
  const standardClauses = [
    { 
      title: 'Sale of Buyer\'s Property', 
      text: 'This offer is contingent upon the sale and closing of the Buyer\'s property located at: [BUYER\'S PROPERTY ADDRESS]. The Buyer shall have until [DATE] to sell their property. If Buyer fails to sell their property by such date, either party may terminate this agreement by written notice to the other party.'
    },
    { 
      title: 'Home Warranty', 
      text: 'Seller shall provide to Buyer a home warranty plan at closing, issued by a company selected by Seller, with a basic coverage plan costing no more than $[AMOUNT].'
    },
    { 
      title: 'Closing Cost Credit', 
      text: 'Seller agrees to credit Buyer at closing $[AMOUNT] toward Buyer\'s closing costs, prepaid items, and other fees.'
    }
  ];
  
  const addStandardClause = (clause: { title: string, text: string }) => {
    append({ title: clause.title, text: clause.text });
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Additional Terms & Clauses</h3>
      
      <div className="p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600 mb-3">
          Standard Clauses (click to add)
        </p>
        <div className="flex flex-wrap gap-2">
          {standardClauses.map((clause, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addStandardClause(clause)}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            >
              + {clause.title}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md bg-white relative">
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              aria-label="Remove clause"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            
            <Controller
              name={`additionalClauses.${index}.title`}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 mb-2"
                  placeholder="Clause Title"
                />
              )}
            />
            
            <Controller
              name={`additionalClauses.${index}.text`}
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                  placeholder="Enter clause text here..."
                  rows={4}
                />
              )}
            />
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => append({ title: '', text: '' })}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Custom Clause
        </button>
      </div>
    </div>
  );
} 