"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "contexts/CartContext";

const CartPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cartItems, removeFromCart, updateCartItem } = useCart();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateCartItem(id, newQuantity);
    } else {
      removeFromCart(id);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null; // or a message saying "Please log in to view your cart"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="mb-4 rounded-lg bg-white p-6 shadow-md"
            >
              <h2 className="mb-2 text-xl font-semibold">{item.name}</h2>
              <p className="mb-2">Price: ${item.price.toFixed(2)}</p>
              <p className="mb-2">Quantity: {item.quantity}</p>
              <button
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
              <button
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          <p className="mt-4 text-xl font-bold">
            Total: $
            {cartItems
              .reduce((total, item) => total + item.price * item.quantity, 0)
              .toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default CartPage;
