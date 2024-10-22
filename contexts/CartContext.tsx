"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

// Export the CartItem interface
export interface CartItem {
  id: string;
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
    purchasePrice: number;
    closingDate: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  removeFromCart: (id: string) => void;
  isCartOpen: boolean;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const removeFromCart = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        removeFromCart,
        isCartOpen,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
