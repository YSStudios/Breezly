import React from "react";
import { useRouter } from "next/navigation";
import { FormData } from "../types";

interface Step5Props {
  formData: FormData;
}

const Step5: React.FC<Step5Props> = ({ formData }) => {
  const router = useRouter();

  const handlePurchaseOffer = () => {
    console.log("Offer details:", formData);
    // You can add any additional logic for handling the purchase here
    router.push("/plans");
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Offer Summary</h2>
	  <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="scrollable-container">
        <h2 className="font-bold text-center mb-10">Offer to Purchase Real Estate</h2>
        <p className="font-bold mb-5">THIS OFFER TO PURCHASE REAL ESTATE (the &quot;Offer&quot;)</p>
        <p className="font-bold mb-5">IS MADE BY:</p>
        <p className="text-center mb-0">{formData['name-buyer-0']} of {formData['address-buyer-0']}</p>
        <p className="text-center mb-10">(the &quot;Buyer&quot;)</p>
        <p className="font-bold text-right mb-15">OF THE FIRST PART</p>
        <p className="font-bold text-center mb-5">- TO -</p>
        <p className="text-center mb-0">{formData['name-seller-0']} of {formData['address-seller-0']}</p>
        <p className="text-center mb-10">(the &quot;Seller&quot;)</p>
        <p className="font-bold text-right mb-15">OF THE SECOND PART</p>
        
        <h3 className="mb-10 ">Background</h3>
        <p className="mb-10">The Buyer wishes to submit an offer to purchase a certain completed home from the Seller under the terms stated below.</p>
        <p className="mb-15"><strong>IN CONSIDERATION OF</strong> and as a condition of the Seller selling the Property and the Buyer purchasing the Property (collectively the &quot;Parties&quot;) and other valuable consideration the receipt of which is hereby acknowledged, the Parties to this Offer to Purchase Real Estate agree as follows:</p>
        
        <ol>
          <li>
            <h3 className="mb-10">Real Property</h3>
            <p className="mb-15">The Property is located at: {formData['property-address']}. The legal land description is as follows: {formData['legal-land-description'] || 'N/A'}. All Property included within this Offer is referred to as the "Property".</p>
          </li>
          <li>
            <h3 className="mb-10">Chattels, Fixtures & Improvements</h3>
            <p className="mb-15">The following chattels, fixtures, and improvements are to be included as part of the sale of the Property:</p>
            <p className="mb-15">{formData['additional-features-text'] || 'N/A'}</p>
          </li>
          <li>
            <h3 className="mb-10">Sales Price</h3>
            <p className="mb-10">The total purchase price of ${Number(formData['purchasePrice'] || 0).toLocaleString()} (the "Purchase Price") that is to be paid for the Property by the Buyer is payable as follows:</p>
            <p className="ml-20 mb-10">a. The initial earnest money deposit (the "Deposit") accompanying this offer is ${formData['depositAmount']}. The Deposit will be paid by {formData['depositMethod']} on or before {formData['depositDueDate']}. The Deposit will be held in escrow by {formData['escrowAgentName']} until the sale is closed, at which time this money will be credited to the Buyer, or until this Offer is otherwise terminated; and</p>
            <p className="ml-20 mb-15">b. The balance of the Purchase Price will be paid in cash or equivalent in financing at closing unless otherwise provided in this Offer. The balance will be subject to adjustments.</p>
          </li>
          {/* Add more list items as needed */}
        </ol>
        
        <h3 className="mb-10 text-center">Buyer's Offer</h3>
        <p className="mb-15">This is an offer to purchase the Property on the above terms and conditions. The Seller has the right to continue to offer the Property for sale and to accept any other offer at any time prior to acceptance by the Seller. If the Seller does not accept this offer from the Buyer by {formData['acceptanceDeadline']}, this offer will lapse and become of no force or effect.</p>
        
        <p className="mb-5">Buyer's Signature: __________________________</p>
        <p className="mb-5">Buyer's Name: {formData['name-buyer-0']}</p>
        <p className="mb-5">Address: {formData['address-buyer-0']}</p>
        <p className="mb-5">Date: ____________________________</p>
        <p className="mb-20">Email: {formData['email']}</p>
      </div>
      
      <button
        className="mt-6 rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
        onClick={handlePurchaseOffer}
      >
        Purchase My Offer
      </button>
	  </div>
    </div>
  );
};

export default Step5;
