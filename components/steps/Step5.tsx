// components/Step5.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { addItem } from "@/app/store/slices/cartSlice";
import { FormData } from "../types";
import type { RootState } from "@/app/store/store";

interface Step5Props {
  formData: FormData;
  formId: string;
}

const Step5: React.FC<Step5Props> = ({ formData, formId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const handleAddToCart = () => {
    const cartItem = {
      id: formId,
      formId: formId,
      name: `Offer for ${formData["property-address"]}`,
      price: parseFloat(formData.purchasePrice || "0"),
      quantity: 1,
      description: `Offer for property at ${formData["property-address"]}`,
      offerDetails: {
        id: formId,
        propertyAddress: formData["property-address"] || "",
        propertyType: formData["property-type"] || "",
        purchasePrice: formData.purchasePrice || "",
        closingDate: formData.closingDate || "",
      },
    };

    // Log before adding to cart
    console.log("Adding item to cart:", cartItem);

    // Add to Redux store
    dispatch(addItem(cartItem));

    // Log updated cart items
    console.log("Cart items after adding:", cartItems);

    // Redirect to plans page
    router.push("/plans");
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Offer Summary</h2>
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <div className="scrollable-container">
          <h2 className="mb-10 text-center font-bold">
            Offer to Purchase Real Estate
          </h2>
          <p className="mb-5 font-bold">
            THIS OFFER TO PURCHASE REAL ESTATE (the &quot;Offer&quot;)
          </p>
          <p className="mb-5 font-bold">IS MADE BY:</p>
          <p className="mb-0 text-center">
            {formData["name-buyer-0"]} of {formData["address-buyer-0"]}
          </p>
          <p className="mb-10 text-center">(the &quot;Buyer&quot;)</p>
          <p className="mb-15 text-right font-bold">OF THE FIRST PART</p>
          <p className="mb-5 text-center font-bold">- TO -</p>
          <p className="mb-0 text-center">
            {formData["name-seller-0"]} of {formData["address-seller-0"]}
          </p>
          <p className="mb-10 text-center">(the &quot;Seller&quot;)</p>
          <p className="mb-15 text-right font-bold">OF THE SECOND PART</p>

          <h3 className="mb-10">Background</h3>
          <p className="mb-10">
            The Buyer wishes to submit an offer to purchase a certain completed
            home from the Seller under the terms stated below.
          </p>
          <p className="mb-15">
            <strong>IN CONSIDERATION OF</strong> and as a condition of the
            Seller selling the Property and the Buyer purchasing the Property
            (collectively the &quot;Parties&quot;) and other valuable
            consideration the receipt of which is hereby acknowledged, the
            Parties to this Offer to Purchase Real Estate agree as follows:
          </p>

          <ol>
            <li>
              <h3 className="mb-10">Real Property</h3>
              <p className="mb-15">
                The Property is located at: {formData["property-address"]}. The
                legal land description is as follows:{" "}
                {formData["legal-land-description"] || "N/A"}. All Property
                included within this Offer is referred to as the
                &quot;Property&quot;.
              </p>
            </li>
            <li>
              <h3 className="mb-10">Chattels, Fixtures & Improvements</h3>
              <p className="mb-15">
                The following chattels, fixtures, and improvements are to be
                included as part of the sale of the Property:
              </p>
              <p className="mb-15">
                {formData["additional-features-text"] || "N/A"}
              </p>
            </li>
            <li>
              <h3 className="mb-10">Sales Price</h3>
              <p className="mb-10">
                The total purchase price of $
                {Number(formData["purchasePrice"] || 0).toLocaleString()} (the
                &quot;Purchase Price&quot;) that is to be paid for the Property
                by the Buyer is payable as follows:
              </p>
              <p className="mb-10 ml-20">
                a. The initial earnest money deposit (the &ldquo;Deposit&rdquo;)
                accompanying this offer is ${formData["depositAmount"]}. The
                Deposit will be paid by {formData["depositMethod"]} on or before{" "}
                {formData["depositDueDate"]}. The Deposit will be held in escrow
                by {formData["escrowAgentName"]} until the sale is closed, at
                which time this money will be credited to the Buyer, or until
                this Offer is otherwise terminated; and
              </p>
              <p className="mb-15 ml-20">
                b. The balance of the Purchase Price will be paid in cash or
                equivalent in financing at closing unless otherwise provided in
                this Offer. The balance will be subject to adjustments.
              </p>
            </li>
          </ol>

          <h3 className="mb-10 text-center">Buyer&apos;s Offer</h3>
          <p className="mb-15">
            This is an offer to purchase the Property on the above terms and
            conditions. The Seller has the right to continue to offer the
            Property for sale and to accept any other offer at any time prior to
            acceptance by the Seller. If the Seller does not accept this offer
            from the Buyer by {formData["acceptanceDeadline"]}, this offer will
            lapse and become of no force or effect.
          </p>

          <p className="mb-5">
            Buyer&apos;s Signature: __________________________
          </p>
          <p className="mb-5">Buyer&apos;s Name: {formData["name-buyer-0"]}</p>
          <p className="mb-5">Address: {formData["address-buyer-0"]}</p>
          <p className="mb-5">Date: ____________________________</p>
          <p className="mb-20">Email: {formData["email"]}</p>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleAddToCart}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Offer to Cart
        </button>
      </div>
    </div>
  );
};

export default Step5;
