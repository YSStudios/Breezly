"use client";
import React from "react";
import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      setError(error.message ?? "Payment failed");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md p-6">
      <PaymentElement />
      {error && <div className="mt-4 text-sm text-red-500">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="mt-4 w-full rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 disabled:bg-gray-400"
      >
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
