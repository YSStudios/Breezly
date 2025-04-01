import React from "react";
import { RadioOptions } from "./FormComponents";
import { ESCROW_AGENT_OPTIONS } from "../Step4";

export const EscrowAgent: React.FC = () => {
  return (
    <>
      <h2 className="mb-4 text-2xl font-bold">Escrow Agent</h2>
      <h3 className="mb-2 text-lg font-medium">
        Who will hold the deposit until the deal is closed?
      </h3>
      <RadioOptions name="escrowAgent" options={ESCROW_AGENT_OPTIONS} />
    </>
  );
}; 