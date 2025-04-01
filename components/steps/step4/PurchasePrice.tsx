import React from "react";
import { MoneyField } from "./FormComponents";

export const PurchasePrice: React.FC = () => {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Purchase Price</h2>
      <MoneyField
        name="purchasePrice"
        label="What is the purchase price?"
        placeholder="e.g. 250,000"
      />
    </div>
  );
}; 