"use client";
import React from "react";
import { useRouter } from "next/navigation";

const PlansPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Choose a Plan</h1>
      
      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      <stripe-pricing-table 
        pricing-table-id="prctbl_1QLG2BEgn55dkaBZQdbRuNMC"
        publishable-key="pk_test_51Q6bxAEgn55dkaBZOpy8gV2iqWs99cv0c93B76vGSgzdDzdVh6M43GDBs61yswR5RjKvVTe83BDUmPO70AbG1Jeq0042FuIoen"
      >
      </stripe-pricing-table>
    </div>
  );
};

export default PlansPage;
