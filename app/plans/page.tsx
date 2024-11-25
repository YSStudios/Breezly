"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";

const PlansPage: React.FC = () => {
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    console.log("Current cart items:", cartItems);

    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;

    // Add event listener for plan selection
    script.onload = () => {
      const pricingTable = document.querySelector("stripe-pricing-table");
      if (pricingTable) {
        pricingTable.addEventListener("price-selected", async (event: any) => {
          console.log("Selected price:", event.detail);

          // Create checkout session with cart data
          try {
            const response = await fetch("/api/create-checkout-session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                priceId: event.detail.priceId,
                cartItems: cartItems,
              }),
            });

            const { url } = await response.json();
            window.location.href = url;
          } catch (error) {
            console.error("Error creating checkout session:", error);
          }
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [cartItems, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Choose a Plan</h1>

      <stripe-pricing-table
        pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
        publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      ></stripe-pricing-table>
    </div>
  );
};

export default PlansPage;
