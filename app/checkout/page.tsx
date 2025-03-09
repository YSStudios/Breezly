"use client";

import StripeWrapper from "@/components/StripeWrapper";
import CheckoutForm from "@/components/CheckoutForm";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCart, addItem } from "@/app/store/slices/cartSlice";

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Ensure only one offer is in the cart
    if (cartItems.length === 0) {
      router.push('/dashboard');
    } else if (cartItems.length > 1) {
      // Keep only the most recent offer
      const mostRecentOffer = cartItems[cartItems.length - 1];
      dispatch(clearCart());
      dispatch(addItem(mostRecentOffer));
    }
  }, [cartItems, router, dispatch]);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-2xl font-bold">Checkout</h1>

      {/* Single Offer Summary */}
      {cartItems.length > 0 && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
          <div className="mb-4 border-b pb-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{cartItems[0].name}</h3>
                <p className="text-sm text-gray-600">{cartItems[0].description}</p>
                {cartItems[0].offerDetails && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Property: {cartItems[0].offerDetails.propertyAddress}</p>
                    <p>Type: {cartItems[0].offerDetails.propertyType}</p>
                    <p>Purchase Price: ${cartItems[0].offerDetails.purchasePrice}</p>
                    <p>Closing Date: {cartItems[0].offerDetails.closingDate}</p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium">${cartItems[0].price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Qty: 1</p>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold">
                ${cartItems[0].price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Checkout Form */}
      <StripeWrapper>
        <CheckoutForm />
      </StripeWrapper>
    </div>
  );
}
