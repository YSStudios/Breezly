// types.ts
import { ElementType } from 'react';

export interface FormData {
  [key: string]: string;
}

export interface StepProps {
  currentSubstep: number;
  onInputChange: (name: string, value: string) => void;
  formData: FormData;
}

export interface TextField {
	label?: string;
	placeholder?: string;
	helperText?: string;
	prefix?: string;
	type?: 'text' | 'date';
}

export interface Option {
	value: string;
	label: string;
	icon?: ElementType;
	textFields?: TextField[];
}

export interface Question {
  id: string;
  description?: string;
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
