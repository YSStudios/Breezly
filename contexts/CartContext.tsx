"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  formId: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  planDetails?: {
    id: string;
    features: string[];
  };
  offerDetails?: {
    propertyAddress: string;
    propertyType: string;
    purchasePrice: number | string;
    closingDate: string;
  };
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, formId: string) => void;
  updateCart: () => Promise<void>;
  getCartItemsByFormId: (formId: string) => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart items from localStorage when the component mounts
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart items to localStorage whenever they change
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (newItem: CartItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id && item.formId === newItem.formId,
      );
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (id: string, formId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.formId === formId)),
    );
  };

  const updateCart = async () => {
    // This function can be implemented if you need to perform any asynchronous updates
    console.log("Updating cart...");
    // You can add any additional logic here if needed
  };

  const getCartItemsByFormId = (formId: string) => {
    return cartItems.filter((item) => item.formId === formId);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCart,
    getCartItemsByFormId,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
