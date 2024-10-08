"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ReactNode, useEffect, useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function StripeWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.error("Stripe publishable key is not set");
      setError("Stripe configuration error");
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}
