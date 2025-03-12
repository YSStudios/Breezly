// components/Step5.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { addItem } from "@/app/store/slices/cartSlice";
import { FormData } from "../types";
import type { RootState } from "@/app/store/store";
import { Dialog } from "@/components/ui/dialog";

interface Step5Props {
  formData: FormData;
  formId: string;
}

const Step5: React.FC<Step5Props> = ({ formData, formId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load Stripe pricing table script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;

    // Add event listener for plan selection
    script.onload = () => {
      const pricingTable = document.querySelector("stripe-pricing-table");
      if (pricingTable) {
        pricingTable.addEventListener("price-selected", async (event: any) => {
          console.log("Selected price:", event.detail);

          // Create cart item from form data
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

          // Add to Redux store
          dispatch(addItem(cartItem));

          // Create checkout session
          try {
            const response = await fetch("/api/create-checkout-session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                priceId: event.detail.priceId,
                cartItems: [...cartItems, cartItem],
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

    // Check if form has already been purchased
    const checkPurchaseStatus = async () => {
      try {
        const response = await fetch(`/api/check-purchase?formId=${formId}`);
        const data = await response.json();
        setIsPurchased(data.isPurchased);
      } catch (error) {
        console.error("Error checking purchase status:", error);
      }
    };

    checkPurchaseStatus();

    return () => {
      document.body.removeChild(script);
    };
  }, [cartItems, formId, formData, dispatch]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isPreviewOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isPreviewOpen]);

  const handleDownload = () => {
    // Implement form PDF download functionality
    console.log("Downloading form...");
  };

  const handleSendEmail = () => {
    // Implement email sending functionality
    console.log("Sending form via email...");
  };

  // Content for the full offer preview
  const OfferPreviewContent = () => (
    <div className="scrollable-container max-h-[80vh] overflow-y-auto">
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

      {/* Rest of the offer content */}
      <h3 className="mb-10">Background</h3>
      <p className="mb-10">
        The Buyer wishes to submit an offer to purchase a certain completed home
        from the Seller under the terms stated below.
      </p>
      <p className="mb-15">
        <strong>IN CONSIDERATION OF</strong> and as a condition of the Seller
        selling the Property and the Buyer purchasing the Property (collectively
        the &quot;Parties&quot;) and other valuable consideration the receipt of
        which is hereby acknowledged, the Parties to this Offer to Purchase Real
        Estate agree as follows:
      </p>

      <ol>
        <li>
          <h3 className="mb-10">Real Property</h3>
          <p className="mb-15">
            The Property is located at: {formData["property-address"]}. The
            legal land description is as follows:{" "}
            {formData["legal-land-description"] || "N/A"}. All Property included
            within this Offer is referred to as the &quot;Property&quot;.
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
            &quot;Purchase Price&quot;) that is to be paid for the Property by
            the Buyer is payable as follows:
          </p>
          <p className="mb-10 ml-20">
            a. The initial earnest money deposit (the &ldquo;Deposit&rdquo;)
            accompanying this offer is ${formData["depositAmount"]}. The Deposit
            will be paid by {formData["depositMethod"]} on or before{" "}
            {formData["depositDueDate"]}. The Deposit will be held in escrow by{" "}
            {formData["escrowAgentName"]} until the sale is closed, at which
            time this money will be credited to the Buyer, or until this Offer
            is otherwise terminated; and
          </p>
          <p className="mb-15 ml-20">
            b. The balance of the Purchase Price will be paid in cash or
            equivalent in financing at closing unless otherwise provided in this
            Offer. The balance will be subject to adjustments.
          </p>
        </li>
      </ol>

      <h3 className="mb-10 text-center">Buyer&apos;s Offer</h3>
      <p className="mb-15">
        This is an offer to purchase the Property on the above terms and
        conditions. The Seller has the right to continue to offer the Property
        for sale and to accept any other offer at any time prior to acceptance
        by the Seller. If the Seller does not accept this offer from the Buyer
        by {formData["acceptanceDeadline"]}, this offer will lapse and become of
        no force or effect.
      </p>

      <p className="mb-5">Buyer&apos;s Signature: __________________________</p>
      <p className="mb-5">Buyer&apos;s Name: {formData["name-buyer-0"]}</p>
      <p className="mb-5">Address: {formData["address-buyer-0"]}</p>
      <p className="mb-5">Date: ____________________________</p>
      <p className="mb-20">Email: {formData["email"]}</p>
    </div>
  );

  return (
    <div className="flex flex-col space-y-6">
      {/* Purchase options first */}
      <div className="w-full">
        {" "}
        {/* Ensure full width */}
        {isPurchased ? (
          <div className="w-full rounded-lg bg-white p-6 shadow-md">
            {" "}
            {/* Added shadow-md for grey shadow */}
            <h2 className="mb-4 text-2xl font-bold">Your Purchased Form</h2>
            <p className="mb-4">Your form is ready. You can now:</p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleDownload}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Download PDF
              </button>
              <button
                onClick={handleSendEmail}
                className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Send via Email
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-lg p-6 shadow-md">
            {" "}
            {/* Added shadow-md for grey shadow */}
            <h2 className="mb-4 text-2xl font-bold">Choose a Plan</h2>
            <p className="mb-4">Select a plan to complete your purchase:</p>
            <stripe-pricing-table
              pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
              publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
            ></stripe-pricing-table>
          </div>
        )}
      </div>

      {/* Offer Preview (condensed version) */}
      <div className="w-full rounded-lg bg-white p-6 shadow-md">
        {" "}
        {/* Added shadow-md for grey shadow */}
        <h2 className="mb-4 text-2xl font-bold">Offer Preview</h2>
        <div
          className="cursor-pointer rounded p-4 transition-colors hover:bg-gray-50"
          onClick={() => setIsPreviewOpen(true)}
        >
          <div className="mb-4 border-b pb-4">
            <h3 className="text-lg font-bold">Offer to Purchase Real Estate</h3>
            <p className="text-gray-600">
              Property: {formData["property-address"]}
            </p>
            <p className="text-gray-600">Buyer: {formData["name-buyer-0"]}</p>
            <p className="text-gray-600">
              Price: ${Number(formData["purchasePrice"] || 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-center font-medium text-emerald-600">
            <span>Click to view full offer details</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-4xl rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Full Offer Preview</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsPreviewOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <OfferPreviewContent />
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5;
