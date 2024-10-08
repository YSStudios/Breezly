"use client";

import StripeWrapper from "@/components/StripeWrapper";
import CheckoutForm from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <StripeWrapper>
      <CheckoutForm />
    </StripeWrapper>
  );
}
