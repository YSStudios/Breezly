"use client";

import StripeWrapper from "@/components/StripeWrapper";
import CheckoutForm from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Checkout</h1>
      <StripeWrapper>
        <CheckoutForm />
      </StripeWrapper>
    </div>
  );
}
