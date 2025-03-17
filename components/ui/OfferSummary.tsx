import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface OfferSummaryProps {
  formId: string;
  formData?: Record<string, any>;
}

export function OfferSummary({ formId, formData = {} }: OfferSummaryProps) {
  const { data: session } = useSession();
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    recipientEmail: formData.email || "",
    message: "",
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
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
    if (!isPurchased) {
      toast.error("You need to purchase this offer before sending it via email");
      return;
    }
    
    // Open the email form dialog
    setIsEmailFormOpen(true);
  };
  
  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailFormData.recipientEmail) {
      toast.error("Recipient email is required");
      return;
    }
    
    try {
      setIsSendingEmail(true);
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: "offer-sent",
          data: { 
            ...formData, 
            email: emailFormData.recipientEmail,
            message: emailFormData.message
          },
          formId: formId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Email error details:", errorData);
        throw new Error(errorData.details || "Failed to send email");
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Email sent successfully!");
        setIsEmailFormOpen(false);
        setIsConfirmationVisible(true);
        
        // If the sender email had problems but the recipient email was sent
        if (result.senderEmailProblem) {
          console.warn("Sender confirmation email failed, but recipient email was sent");
          toast("The offer was sent to the recipient, but we couldn't send you a confirmation email.", { 
            duration: 6000,
            icon: '⚠️'
          });
        }
        
        setTimeout(() => {
          setIsConfirmationVisible(false);
        }, 5000);
      } else {
        toast.error("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(`Error sending email: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSendingEmail(false);
    }
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
      
      {/* Email Form Modal */}
      {isEmailFormOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsEmailFormOpen(false)}></div>
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl"  onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Send Offer via Email</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsEmailFormOpen(false)}
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
            
            <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <p>The recipient will receive the offer details, and you'll receive a confirmation email to your account email address.</p>
            </div>
            
            <form onSubmit={handleSendEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700">
                  Recipient Email
                </label>
                <input
                  type="email"
                  id="recipientEmail"
                  value={emailFormData.recipientEmail}
                  onChange={(e) => setEmailFormData({...emailFormData, recipientEmail: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Custom Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={emailFormData.message}
                  onChange={(e) => setEmailFormData({...emailFormData, message: e.target.value})}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  placeholder="Add a personal message to include with this offer"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEmailFormOpen(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={isSendingEmail}
                >
                  {isSendingEmail ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email sent confirmation */}
      {isConfirmationVisible && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg bg-green-50 p-4 shadow-lg border border-green-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Email Sent!</h3>
              <div className="mt-1 text-sm text-green-700">
                <p>Your offer has been successfully emailed to {emailFormData.recipientEmail}.</p>
                <p className="mt-1">You'll also receive a confirmation email.</p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setIsConfirmationVisible(false)}
                  className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 