"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "@/app/store/slices/cartSlice";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [offerDetails, setOfferDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  
  // Get the session ID from URL
  const sessionId = searchParams?.get('session_id');

  useEffect(() => {
    // Clear the cart after successful payment
    dispatch(clearCart());
    
    // If no session ID, show error
    if (!sessionId) {
      setIsLoading(false);
      setError("No session ID found. Your payment may have been processed, but we couldn't retrieve your offer details.");
      return;
    }

    // Fetch offer details based on session ID
    const fetchOfferDetails = async () => {
      try {
        setIsLoading(true);
        
        // Add retry logic for webhook processing delay
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        
        while (attempts < maxAttempts && !success) {
          console.log(`Attempt ${attempts + 1} to fetch offer details`);
          const response = await fetch(`/api/get-offer-details?sessionId=${sessionId}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.offerDetails) {
              setOfferDetails(data.offerDetails);
              success = true;
              break;
            }
          }
          
          // If not successful, wait before retrying
          if (!success && attempts < maxAttempts - 1) {
            console.log('Waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          }
          
          attempts++;
        }
        
        if (!success) {
          throw new Error("Unable to retrieve offer details after multiple attempts");
        }
      } catch (error) {
        console.error("Error fetching offer details:", error);
        setError("We're having trouble loading your offer details. This might be because your payment is still being processed. Please check your dashboard in a few minutes or contact support if this persists.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfferDetails();
  }, [dispatch, sessionId]);

  const handleDownloadOffer = async () => {
    if (!offerDetails?.id) return;
    
    setIsLoading(true);
    try {
      // Direct download approach
      window.location.href = `/api/generate-pdf?formId=${offerDetails.id}`;
      // Wait a bit before setting loading to false
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error("Error downloading offer:", error);
      setError("Failed to download your offer. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEmailOffer = async () => {
    if (!offerDetails?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          template: "offer-sent", 
          data: offerDetails,
          formId: offerDetails.id
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
      
      setEmailSent(true);
    } catch (error) {
      console.error("Error sending email:", error);
      setError("Failed to email your offer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToDashboard = () => {
    router.push('/dashboard');
  };

  const handleManualRetrieve = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get most recent paid offer
      const response = await fetch(`/api/get-recent-offer`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch recent offers");
      }
      
      const data = await response.json();
      if (data.offerDetails) {
        setOfferDetails(data.offerDetails);
      } else {
        throw new Error("No recent offers found");
      }
    } catch (error) {
      console.error("Error fetching recent offer:", error);
      setError("We couldn't find your recent offers. Please go to your dashboard to view all offers.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && !offerDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Your Purchase</h2>
          <p className="text-gray-600">Please wait while we finalize your offer...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-yellow-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">We're Processing Your Payment</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleReturnToDashboard}
              className="w-full px-4 py-2 text-white font-medium bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 text-teal-600 font-medium border border-teal-600 rounded-md hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Try Again
            </button>
            <button
              onClick={handleManualRetrieve}
              className="w-full px-4 py-2 text-blue-600 font-medium border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"
            >
              Retrieve My Recent Offer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          
          <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-center text-gray-600">
            Your offer has been successfully purchased and is now ready.
          </p>
          
          {offerDetails && (
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900">Offer Details</h3>
              <p className="mt-2 text-sm text-gray-600">
                <strong>Property:</strong> {offerDetails["property-address"] || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Purchase Price:</strong> ${offerDetails["purchasePrice"] ? Number(offerDetails["purchasePrice"]).toLocaleString() : "N/A"}
              </p>
              <p className="mt-2 text-xs text-gray-500 italic">
                The property address is now locked and cannot be modified.
              </p>
            </div>
          )}
          
          <div className="mt-6 space-y-3">
            <button
              onClick={handleDownloadOffer}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400"
            >
              {isLoading ? "Processing..." : "Download Offer PDF"}
            </button>
            
            <button
              onClick={handleEmailOffer}
              disabled={isLoading || emailSent}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isLoading ? "Processing..." : emailSent ? "Email Sent ✓" : "Email Offer"}
            </button>
            
            <button
              onClick={handleReturnToDashboard}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
