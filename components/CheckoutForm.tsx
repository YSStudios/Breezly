"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <PaymentElement />
      {error && (
        <div className="text-red-500 text-sm mt-4">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-teal-600 text-white py-2 px-4 rounded mt-4 hover:bg-teal-700 disabled:bg-gray-400"
      >
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
