// components/Step5.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { addItem } from "@/app/store/slices/cartSlice";
import { FormData } from "../types";
import type { RootState } from "@/app/store/store";
import { toast } from "react-hot-toast";

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
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    recipientEmail: formData.email || "",
    message: "",
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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
    // Implement PDF download if purchased
    if (isPurchased) {
      window.open(`/api/generate-pdf?formId=${formId}`, "_blank");
    }
  };

  const handleSendEmail = async () => {
    // Open the email form dialog
    if (isPurchased) {
      setIsEmailFormOpen(true);
    } else {
      toast.error(
        "You need to purchase this offer before sending it via email",
      );
    }
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
            message: emailFormData.message,
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
        setTimeout(() => {
          setIsConfirmationVisible(false);
        }, 5000);
      } else {
        toast.error("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(
        `Error sending email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePlanSelection = async () => {
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

    // Create checkout session with the actual price ID
    try {
      // Use the actual price ID from Stripe
      const priceId = "price_1R6f2jEgn55dkaBZCsbDErRg";

      console.log("Initiating checkout with price ID:", priceId);
      console.log("Form ID:", formId);

      // First check if the form exists
      const formResponse = await fetch(`/api/form/get?id=${formId}`);
      if (!formResponse.ok) {
        throw new Error(
          `Form not found or not accessible. Please ensure your form is saved.`,
        );
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceId,
          cartItems: [...cartItems, cartItem],
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create checkout session";
        try {
          const errorData = await response.json();
          console.error("Checkout session error:", errorData);
          errorMessage =
            errorData.message || errorData.error || response.statusText;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(`Stripe Error: ${errorMessage}`);
      }

      const data = await response.json();
      console.log("Checkout session created, redirecting to:", data.url);

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      // Show a more user-friendly error
      toast.error(
        `Payment processing error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  // Content for the full offer preview
  const OfferPreviewContent = () => (
    <div className="scrollable-container max-h-[80vh] overflow-y-auto relative">
      {/* Diagonal DRAFT watermark only shown for unpurchased offers */}
      {!isPurchased && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
          <div className="relative h-full w-full">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="absolute text-red-200 text-[150px] font-bold opacity-30 w-full text-center"
                style={{ top: `${i * 40}%`, transform: 'rotate(-30deg)' }}>
                DRAFT
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="relative z-20">
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
              {formData["legal-land-description"] === 'attach' ||
              !formData["legal-land-description-text"] ||
              formData["legal-land-description-text"] === 'N/A'
                ? '\n____________________________________________________________________________________________________.\n'
                : formData["legal-land-description-text"]}
              . All Property included within this Offer is referred to as the &quot;Property&quot;.
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
          <li>
            <h3 className="mb-10">Return of Deposit</h3>
            <p className="mb-15">
              {formData["escrowAgentName"] || "The escrow agent"} will return the Deposit to the Buyer if the Offer is rejected or expires prior to acceptance.
            </p>
          </li>
          <li>
            <h3 className="mb-10">Closing & Possession</h3>
            <p className="mb-15">
              The Closing Date will be on or be prior to {formData["closingDate"]} or at such other time agreed by the Parties, at which point the Buyer will take possession of the Property.
              {formData["possession"] === 'Before funding, under a temporary lease'
                ? ` The Buyer will take possession on ${formData["possessionDate"]} under a temporary lease arrangement.`
                : ''}
            </p>
          </li>
          <li>
            <h3 className="mb-10">Conditions</h3>
            <p className="mb-10">
              The Buyer&apos;s obligation to purchase the Property is contingent upon the following enumerated condition(s):
            </p>
            {typeof formData["conditions"] === 'string' && formData["conditions"] ? 
              formData["conditions"].split(',').map((condition, index) => (
                <p key={index} className="mb-10 ml-20">
                  {String.fromCharCode(97 + index)}. {condition.trim()}
                </p>
              )) : 
              <p className="mb-10 ml-20">a. No conditions specified.</p>
            }
            <p className="mb-15">
              All conditions must be satisfied by {formData["completionDate"]}.
            </p>
          </li>
          <li>
            <h3 className="mb-10">Additional Clauses</h3>
            <p className="mb-15">
              {formData["additionalClauses"] || "No additional clauses"}
            </p>
          </li>
          <li>
            <h3 className="mb-10">Notices</h3>
            <p className="mb-10">
              All notices pursuant to this Offer must be written and signed by the respective party or its agent and all such correspondence will be effective upon it being mailed with return receipt requested, hand-delivered, or emailed as follows:
            </p>
            <p className="mb-5">Buyer</p>
            <p className="mb-0 ml-20">Name: {formData["name-buyer-0"]}</p>
            <p className="mb-0 ml-20">Address: {formData["address-buyer-0"]}</p>
            <p className="mb-15 ml-20">Email: {formData["email"]}</p>
            <p className="mb-5">Seller</p>
            <p className="mb-0 ml-20">Name: {formData["name-seller-0"]}</p>
            <p className="mb-0 ml-20">Address: {formData["address-seller-0"]}</p>
            <p className="mb-15 ml-20">Email: {formData["seller-email"] || "N/A"}</p>
          </li>
          <li>
            <h3 className="mb-10">Severability</h3>
            <p className="mb-15">
              If any term or provision of this Offer will, to any extent, be determined to be invalid or unenforceable by a court of competent jurisdiction, the remainder of this Offer will not be affected and each unaffected term and provision of this Offer will remain valid and be enforceable to the fullest extent permitted by law.
            </p>
          </li>
          <li>
            <h3 className="mb-10">Interpretation</h3>
            <p className="mb-15">
              Headings are inserted for the convenience of the Parties only and are not to be considered when interpreting this Offer. Words in the singular mean and include the plural and vice versa. Words in the masculine gender mean and include the feminine gender and vice versa. Words importing persons include firms and corporations and vice versa.
            </p>
          </li>
          <li>
            <h3 className="mb-10">Time of Essence</h3>
            <p className="mb-15">
              Time is of the essence in this Offer. Every calendar day except Saturday, Sunday, or a US national holiday will be deemed a business day and all relevant time periods in this Offer will be calculated in business days. Performance will be due the next business day if any deadline falls on a Saturday, Sunday, or a US national holiday. A business day ends at 5:00 p.m. local time in the time zone in which the Property is situated.
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

        {/* Second page content */}
        <div className="page-break"></div>
        <h3 className="mb-10 text-center">Seller&apos;s Acceptance/ Counteroffer/ Rejection</h3>
        <p className="mb-10"><strong>_____Acceptance of offer to purchase:</strong> The Seller accepts the foregoing offer on the terms and conditions specified above, and agrees to convey the Property to the Buyer.</p>
        <div className="flex">
          <div className="flex-item"> 
            <p className="mb-5">_________________________</p>
            <p className="mb-10">Seller&apos;s Signature</p>
          </div>
          <div className="flex-item">
            <p className="mb-5">_________________________</p>
            <p className="mb-10">Date</p>
          </div>
          <div className="flex-item">
            <p className="mb-5">_________________________</p>
            <p className="mb-15">Time</p>
          </div>
        </div>
        
        <p className="mb-10"><strong>_____Counteroffer:</strong> The Seller presents for the Buyer&apos;s Acceptance the terms of the Buyer&apos;s offer subject to the exceptions or modifications as specified in the attached addendum.</p>
        <div className="flex">
          <div className="flex-item"> 
            <p className="mb-5">_________________________</p>
            <p className="mb-10">Seller&apos;s Signature</p>
          </div>
          <div className="flex-item">
            <p className="mb-5">_________________________</p>
            <p className="mb-10">Date</p>
          </div>
          <div className="flex-item">
            <p className="mb-5">_________________________</p>
            <p className="mb-15">Time</p>
          </div>
        </div>
        
        <p className="mb-10"><strong>_____Rejection:</strong> The Seller rejects the foregoing offer.</p>
        <div className="flex">
          <div className="flex-item"> 
            <p className="mb-5">_________________________</p>
            <p className="mb-10">Seller&apos;s Signature</p>
          </div>
          <div className="flex-item">
            <p className="mb-5">_________________________</p>
            <p className="mb-10">Date</p>
          </div>
          <div className="flex-item">
            <p className="mb-5">_________________________</p>
            <p className="mb-15">Time</p>
          </div>
        </div>
        
        <p className="mb-5">Seller&apos;s Name: {formData["name-seller-0"]}</p>
        <p className="mb-5">Address: {formData["address-seller-0"]}</p>
        <p className="mb-5">Date: ____________________________</p>
        <p className="mb-20">Email: {formData["seller-email"] || "N/A"}</p>
      </div>
    </div>
  );

  // Update the preview modal title based on purchase status
  const modalTitle = isPurchased ? "Offer to Purchase Real Estate" : "Offer Preview";

  return (
    <div className="flex flex-col">
      {/* Main row with 4 columns */}
      <div className="grid grid-cols-4 gap-6">
        {/* Offer Preview (3 columns) */}
        <div className="col-span-2 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">Offer Preview</h2>
          <div
            className="cursor-pointer rounded p-4 transition-colors hover:bg-gray-50 relative overflow-hidden"
            onClick={() => setIsPreviewOpen(true)}
          >
            <div className="relative mb-4 border-b pb-4">
              <h3 className="text-lg font-bold">
                Offer to Purchase Real Estate
              </h3>
              <p className="text-gray-600">
                Property: {formData["property-address"]}
              </p>
              <p className="text-gray-600">Buyer: {formData["name-buyer-0"]}</p>
              <p className="text-gray-600">
                Price: $
                {Number(formData["purchasePrice"] || 0).toLocaleString()}
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

        {/* Purchase options (1 column) */}
        <div className="col-span-2">
          {isPurchased ? (
            <div className="rounded-lg bg-white p-6 shadow-md">
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
            <div className="rounded-lg bg-white">
              <div className="flex flex-col space-y-4">
                {/* Standard Plan */}
                <div className="overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100 p-4">
                    <h3 className="text-lg font-bold text-indigo-700">
                      One-Time Purchase
                    </h3>
                    <div className="mt-1 flex items-baseline">
                      <span className="text-2xl font-bold">$10</span>
                      <span className="ml-1 text-gray-500">/one-time</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <ul className="mb-6 space-y-2">
                      <li className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2">Downloadable PDF</span>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2">Email delivery</span>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2">90-day access</span>
                      </li>
                    </ul>

                    <div className="space-y-2">
                      {/* Real Stripe checkout button */}
                      <button
                        onClick={handlePlanSelection}
                        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-center font-medium text-white hover:bg-indigo-700"
                      >
                        Purchase Now
                      </button>

                      {/* Test mode button */}
                      {/* <button
                        onClick={() => {
                          // FOR TESTING ONLY: Simulate purchase completion
                          // This bypasses Stripe and marks the offer as purchased directly
                          fetch(`/api/check-purchase?formId=${formId}`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ markAsPurchased: true }),
                          })
                            .then((response) => response.json())
                            .then((data) => {
                              if (data.success) {
                                // Refresh the page to show the purchased state
                                window.location.reload();
                              } else {
                                alert(
                                  "Unable to complete purchase simulation. Please try again.",
                                );
                              }
                            })
                            .catch((error) => {
                              console.error("Error:", error);
                              alert("An error occurred. Please try again.");
                            });
                        }}
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Test Purchase (Skip Payment)
                      </button> */}
                    </div>
                  </div>
                </div>

                {/* Premium Plan */}
                {/* <div className="overflow-hidden rounded-lg border-2 border-indigo-500 transition-all hover:shadow-md">
									<div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 border-b border-gray-200">
										<div className="-mt-2 mb-2 text-center">
											<span className="px-3 py-1 text-xs font-semibold text-indigo-800 bg-indigo-100 rounded-full">MOST POPULAR</span>
										</div>
										<h3 className="text-lg font-bold text-white">Premium</h3>
										<div className="flex items-baseline mt-1">
											<span className="text-2xl font-bold text-white">$49</span>
											<span className="ml-1 text-indigo-200">/one-time</span>
										</div>
									</div>

									<div className="p-4">
										<ul className="mb-6 space-y-2">
											<li className="flex items-center">
												<svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="ml-2">Downloadable PDF</span>
											</li>
											<li className="flex items-center">
												<svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="ml-2">Email delivery</span>
											</li>
											<li className="flex items-center">
												<svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="ml-2">Unlimited access</span>
											</li>
											<li className="flex items-center">
												<svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="ml-2">Priority support</span>
											</li>
											<li className="flex items-center">
												<svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="ml-2">Form customization</span>
											</li>
										</ul>

										<button
											onClick={() => handlePlanSelection('price_premium')}
											className="px-4 py-2 w-full font-medium text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
										>
											Purchase Now
										</button>
									</div>
								</div> End of Premium Plan */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative mx-4 w-full max-w-4xl rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{modalTitle}</h2>
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
        </div>
      )}

      {/* Email Form Modal */}
      {isEmailFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsEmailFormOpen(false)}
        >
          <div
            className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Send Offer via Email</h2>
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

            <form onSubmit={handleSendEmailSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="recipientEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Recipient Email
                </label>
                <input
                  type="email"
                  id="recipientEmail"
                  value={emailFormData.recipientEmail}
                  onChange={(e) =>
                    setEmailFormData({
                      ...emailFormData,
                      recipientEmail: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  placeholder="recipient@example.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Custom Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={emailFormData.message}
                  onChange={(e) =>
                    setEmailFormData({
                      ...emailFormData,
                      message: e.target.value,
                    })
                  }
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
                  disabled={isSendingEmail}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
        <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Email Sent!
              </h3>
              <div className="mt-1 text-sm text-green-700">
                <p>
                  Your offer has been successfully emailed to{" "}
                  {emailFormData.recipientEmail}.
                </p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setIsConfirmationVisible(false)}
                  className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5;
