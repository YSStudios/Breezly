import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  items: any[];
}

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<any>) => {
      state.items.push(action.payload);
    },
  },
});

export const { addItem } = cartSlice.actions;
export default cartSlice.reducer;