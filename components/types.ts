// types.ts
import { ElementType } from 'react';

// Add Stripe Pricing Table type declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'pricing-table-id'?: string;
        'publishable-key'?: string;
      }, HTMLElement>;
    }
  }
}

// Basic Types
export type EmailTemplate = 'offer-confirmation' | 'offer-notification' | 'welcome' | 'reset-password';

export interface FormData {
  [key: string]: string;
}

// Field Types
export interface TextField {
  label?: string;
  placeholder?: string;
  helperText?: string;
  prefix?: string;
  type?: 'text' | 'date' | 'mapbox-autocomplete';
  accessToken?: string;
  additionalComponent?: React.ReactNode;
}

export interface NumberFieldProps {
  id: string;
  label?: string;
  placeholder?: string;
  prefix?: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

// Form and Question Types
export interface Option {
  value: string;
  label: string;
  icon?: ElementType;
  textFields?: TextField[];
}

export interface Question {
  id: string;
  description: string;
  tooltip?: string;
  options: Option[];
  multiSelect?: boolean;
}

export interface FormQuestionProps {
  question: Question;
  onChange: (
    questionId: string,
    value: string,
    textFields?: { [key: number]: string },
  ) => void;
  title?: string;
  initialValue?: string;
  initialTextFieldValues?: { [key: number]: string };
}

export interface StepProps {
  currentSubstep: number;
  onInputChange: (name: string, value: string) => void;
  formData: FormData;
  onPropertySelect: (property: any) => void;
}

export interface ConditionDetailsProps {
  selectedConditions: string[];
  onInputChange: (name: string, value: string) => void;
  formData: FormData;
}

// Mapbox Types
export interface MapboxFeature {
  id: string;
  place_name: string;
  geometry: {
    coordinates: [number, number];
  };
}