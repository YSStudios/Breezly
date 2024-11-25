"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "@/app/store/slices/cartSlice";

export default function PaymentSuccessPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear the cart after successful payment
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Payment Successful!</h1>
      <p>Your offer has been submitted successfully.</p>
    </div>
  );
}
