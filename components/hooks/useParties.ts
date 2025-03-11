import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export function useParties(
  partyType: 'buyer' | 'seller',
  maxParties: number = 5
) {
  const { watch, setValue } = useFormContext();
  const [parties, setParties] = useState([0]);

  // Initialize party arrays from form data when component mounts
  useEffect(() => {
    // Look for existing party data
    const formValues = watch();
    const keys = Object.keys(formValues || {}).filter(key => 
      key.startsWith(`${partyType}-type-`)
    );
    
    if (keys.length > 0) {
      const indices = keys.map(key => parseInt(key.split('-').pop() || '0'));
      const maxIndex = Math.max(...indices);
      setParties(Array.from({ length: maxIndex + 1 }, (_, i) => i));
    }
  }, [watch, partyType]);

  const addParty = () => {
    if (parties.length < maxParties) {
      setParties(prev => [...prev, prev.length]);
    }
  };

  const removeParty = (indexToRemove: number) => {
    if (parties.length > 1) {
      // Remove the party
      setParties(prev => {
        const newParties = prev.filter((_, index) => index !== indexToRemove);
        return newParties.map((_, index) => index);
      });
      
      // Clear form data for the removed party
      setValue(`${partyType}-type-${indexToRemove}`, undefined);
      setValue(`name-${partyType}-${indexToRemove}`, undefined);
      setValue(`address-${partyType}-${indexToRemove}`, undefined);
    }
  };

  const getPartyLabel = (index: number) => {
    if (parties.length === 1) return '';
    const labels = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
    return `${labels[index]} ${partyType.charAt(0).toUpperCase() + partyType.slice(1)}`;
  };

  return {
    parties,
    addParty,
    removeParty,
    getPartyLabel
  };
} 