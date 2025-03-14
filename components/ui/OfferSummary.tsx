import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

interface OfferSummaryProps {
  formId: string;
  formData?: Record<string, any>;
}

export function OfferSummary({ formId, formData = {} }: OfferSummaryProps) {
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check purchase status
    const checkPurchaseStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/check-purchase?formId=${formId}`);
        const data = await response.json();
        setIsPurchased(data.isPurchased);
      } catch (error) {
        console.error('Error checking purchase status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPurchaseStatus();
    
    // Load Stripe pricing table script (only if not purchased)
    if (!isPurchased) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/pricing-table.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [formId, isPurchased]);
  
  const handleDownload = () => {
    // Implement PDF download
    window.open(`/api/generate-pdf?formId=${formId}`, '_blank');
  };
  
  const handleSendEmail = () => {
    // Show email form dialog
  };
  
  // If still checking purchase status
  if (isLoading) {
    return <div className="text-center p-8">Loading summary...</div>;
  }
  
  // Get primary buyer and seller
  const buyerName = formData["name-buyer-0"] || "Buyer";
  const sellerName = formData["name-seller-0"] || "Seller";
  const propertyAddress = formData["property-address"] || "the Property";
  const purchasePrice = formData["purchasePrice"] 
    ? Number(formData["purchasePrice"]).toLocaleString()
    : "N/A";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Form preview - left column */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Offer Summary</h2>
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="scrollable-container max-h-[600px] overflow-y-auto p-4">
            <h2 className="mb-10 text-center font-bold">
              Offer to Purchase Real Estate
            </h2>
            <p className="mb-5 font-bold">
              THIS OFFER TO PURCHASE REAL ESTATE (the &quot;Offer&quot;)
            </p>
            <p className="mb-5 font-bold">IS MADE BY:</p>
            <p className="mb-0 text-center">
              {buyerName} of {formData["address-buyer-0"] || ""}
            </p>
            <p className="mb-10 text-center">(the &quot;Buyer&quot;)</p>
            <p className="mb-15 text-right font-bold">OF THE FIRST PART</p>
            <p className="mb-5 text-center font-bold">- TO -</p>
            <p className="mb-0 text-center">
              {sellerName} of {formData["address-seller-0"] || ""}
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

            <ol className="list-decimal pl-5 space-y-6">
              <li>
                <h3 className="font-bold mb-2">Real Property</h3>
                <p>
                  The Property is located at: {propertyAddress}. The
                  legal land description is as follows:{" "}
                  {formData["legal-land-description"] || "N/A"}. All Property
                  included within this Offer is referred to as the
                  &quot;Property&quot;.
                </p>
              </li>
              <li>
                <h3 className="font-bold mb-2">Chattels, Fixtures & Improvements</h3>
                <p>
                  The following chattels, fixtures, and improvements are to be
                  included as part of the sale of the Property:
                </p>
                <p>
                  {formData["additional-features-text"] || "N/A"}
                </p>
              </li>
              <li>
                <h3 className="font-bold mb-2">Sales Price</h3>
                <p>
                  The total purchase price of $
                  {purchasePrice} (the
                  &quot;Purchase Price&quot;) that is to be paid for the Property
                  by the Buyer is payable as follows:
                </p>
                <ol className="list-[lower-alpha] pl-5 space-y-2 mt-2">
                  <li>
                    The initial earnest money deposit (the &ldquo;Deposit&rdquo;)
                    accompanying this offer is ${formData["depositAmount"] || "N/A"}. The
                    Deposit will be paid by {formData["depositMethod"] || "N/A"} on or before{" "}
                    {formData["depositDueDate"] || "N/A"}. The Deposit will be held in escrow
                    by {formData["escrowAgentName"] || "N/A"} until the sale is closed, at
                    which time this money will be credited to the Buyer, or until
                    this Offer is otherwise terminated; and
                  </li>
                  <li>
                    The balance of the Purchase Price will be paid in cash or
                    equivalent in financing at closing unless otherwise provided in
                    this Offer. The balance will be subject to adjustments.
                  </li>
                </ol>
              </li>
            </ol>

            <h3 className="mb-4 mt-6 text-center font-bold">Buyer&apos;s Offer</h3>
            <p>
              This is an offer to purchase the Property on the above terms and
              conditions. The Seller has the right to continue to offer the
              Property for sale and to accept any other offer at any time prior to
              acceptance by the Seller. If the Seller does not accept this offer
              from the Buyer by {formData["acceptanceDeadline"] || "N/A"}, this offer will
              lapse and become of no force or effect.
            </p>

            <div className="mt-10 border-t pt-4">
              <p className="mb-1">
                Buyer&apos;s Signature: __________________________
              </p>
              <p className="mb-1">Buyer&apos;s Name: {buyerName}</p>
              <p className="mb-1">Address: {formData["address-buyer-0"] || "N/A"}</p>
              <p className="mb-1">Date: ____________________________</p>
              <p>Email: {formData["email"] || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Purchase or download options - right column */}
      <div>
        {isPurchased ? (
          <div className="rounded-lg bg-white p-6 shadow-lg">
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
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Choose a Plan</h2>
            <p className="mb-4">Select a plan to complete your purchase:</p>
            <stripe-pricing-table
              pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
              publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
            ></stripe-pricing-table>
          </div>
        )}
      </div>
    </div>
  );
} 