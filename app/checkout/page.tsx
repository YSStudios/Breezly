"use client";

import StripeWrapper from "@/components/StripeWrapper";
import CheckoutForm from "@/components/CheckoutForm";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    // Debug logs
    console.log("Checkout page mounted");
    console.log("Checkout page - Cart items:", cartItems);
    console.log("Cart items length:", cartItems.length);
    console.log("Cart items content:", JSON.stringify(cartItems, null, 2));

    if (cartItems.length === 0) {
      console.log("No items in cart");
      // Optionally redirect if cart is empty
      // router.push('/plans');
    }
  }, [cartItems]);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-2xl font-bold">Checkout</h1>

      {/* Cart Summary */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.id} className="mb-4 border-b pb-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                {item.offerDetails && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Property: {item.offerDetails.propertyAddress}</p>
                    <p>Type: {item.offerDetails.propertyType}</p>
                    <p>Purchase Price: ${item.offerDetails.purchasePrice}</p>
                    <p>Closing Date: {item.offerDetails.closingDate}</p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium">${item.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="font-semibold">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Stripe Checkout Form */}
      <StripeWrapper>
        <CheckoutForm />
      </StripeWrapper>
    </div>
  );
}
