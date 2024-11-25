import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormOffer {
  id: string;
  propertyAddress: string;
  propertyType: string;
  purchasePrice: number | string;
  closingDate: string;
}

export interface CartItem {
  id: string;
  formId: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  offerDetails?: FormOffer;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.formId === action.payload.formId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;