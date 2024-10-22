"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  planDetails: any;
  offerDetails: any;
  imageUrl: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateCartItem: (id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart items from localStorage when the component mounts
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    console.log("Loading cart from localStorage:", storedCart);
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    setIsLoaded(true);
  }, []);

  // Update localStorage whenever cartItems changes
  useEffect(() => {
    if (isLoaded) {
      console.log("Saving cart to localStorage:", cartItems);
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateCartItem = (id: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
