import React from "react";
import { RadioOptions } from "./FormComponents";
import { POSSESSION_OPTIONS } from "../Step4";

export const ClosingAndPossession: React.FC = () => {
  return (
    <>
      <h2 className="mb-4 text-2xl font-bold">Closing and Possession</h2>
      <h3 className="mb-2 text-lg font-medium">
        When will the seller provide possession?
      </h3>
      <RadioOptions name="possession" options={POSSESSION_OPTIONS} />
    </>
  );
}; 