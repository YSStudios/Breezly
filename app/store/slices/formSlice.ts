import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormState {
  currentStep: number;
  currentSubstep: number;
  formData: any;
  formId: string | null;
}

const initialState: FormState = {
  currentStep: 1,
  currentSubstep: 1,
  formData: {},
  formId: null,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setSubstep: (state, action: PayloadAction<number>) => {
      state.currentSubstep = action.payload;
    },
    setFormData: (state, action: PayloadAction<any>) => {
      state.formData = action.payload;
    },
    setFormId: (state, action: PayloadAction<string | null>) => {
      state.formId = action.payload;
    },
    updateFormState: (state, action: PayloadAction<Partial<FormState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setStep, setSubstep, setFormData, setFormId, updateFormState } = formSlice.actions;
export default formSlice.reducer;
