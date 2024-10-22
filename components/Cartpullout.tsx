"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../contexts/CartContext";
import { XMarkIcon } from "@heroicons/react/24/outline";

const CartPullout: React.FC = () => {
  const router = useRouter();
  const { cartItems, removeFromCart, isCartOpen, closeCart } = useCart();

  console.log("CartPullout rendered, isCartOpen:", isCartOpen);
  console.log("Cart Items:", cartItems);

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-xl">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-medium text-gray-900">Shopping cart</h2>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <ul className="mt-8 divide-y divide-gray-200">
          {Array.isArray(cartItems) &&
            cartItems.map((item) => (
              <li key={item.id} className="flex py-6">
                <div className="ml-4 flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.name || "Unnamed Item"}</h3>
                      <p className="ml-4">
                        $
                        {typeof item.price === "number"
                          ? item.price.toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <p className="text-gray-500">Qty {item.quantity || 0}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
        </ul>
        {Array.isArray(cartItems) && cartItems.length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleCheckout}
              className="w-full rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPullout;
