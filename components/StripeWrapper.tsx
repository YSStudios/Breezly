"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ReactNode, useEffect, useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const appearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#0f766e',
  },
};

export default function StripeWrapper({ children }: { children: ReactNode }) {
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 2000 }), // $20.00
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      });
  }, []);

  if (!clientSecret) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="text-gray-600">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      {children}
    </Elements>
  );
}
