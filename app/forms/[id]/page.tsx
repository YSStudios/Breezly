'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MultiStepForm from '@/components/MultiStepForm';
import { loadFormData, saveFormData } from '../../../lib/formStorage';

export default function FormPage() {
  const { id } = useParams();
  const formId = id as string;
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  
  useEffect(() => {
    const loadForm = async () => {
      try {
        setIsLoading(true);
        const data = await loadFormData(formId);
        setFormData(data || {});
        
        // Check if form is locked (e.g., already submitted)
        const status = await fetch(`/api/forms/${formId}/status`).then(res => res.json());
        setIsLocked(status.locked);
      } catch (error) {
        console.error('Error loading form:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadForm();
  }, [formId]);
  
  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [key]: value };
      
      // Autosave form data
      saveFormData(formId, newData);
      
      return newData;
    });
  };
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading form...</div>;
  }
  
  return (
    <MultiStepForm
      formData={formData}
      onInputChange={handleInputChange}
      formId={formId}
      isLocked={isLocked}
    />
  );
} 