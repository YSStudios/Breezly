// types.ts
import { ChangeEvent } from "react";

export interface FormData {
  [key: string]: string;
}

export interface StepProps {
  currentSubstep: number;
  onInputChange: (name: string, value: string) => void;
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
  image?: string;
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
}
