"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const PlansPage: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Choose a Plan</h1>
      
      <stripe-pricing-table 
        pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
        publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      >
      </stripe-pricing-table>
    </div>
  );
};

export default PlansPage;
