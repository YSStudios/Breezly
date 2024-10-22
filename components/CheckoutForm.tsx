"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LockClosedIcon,
  DocumentTextIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { useCart } from "contexts/CartContext";
import Select from "react-select";
import countryList from "react-select-country-list";
import { usStates } from "@/app/checkout/states";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// Define types
type CountryOption = {
  label: string;
  value: string;
};

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  country: CountryOption | null;
  state: { label: string; value: string } | null;
  zip: string;
  phone: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  // ... other properties
}

const CheckoutForm = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartItems, removeFromCart } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    country: null,
    state: null,
    zip: "",
    phone: "",
  });

  useEffect(() => {
    console.log("CheckoutForm useEffect triggered");
    console.log("Authentication status:", status);
    console.log("Cart items:", cartItems);
    if (status === "authenticated") {
      fetchClientSecret();
    }
  }, [status, cartItems]);

  useEffect(() => {
    const storedCheckoutData = localStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      setCheckoutData(JSON.parse(storedCheckoutData));
      console.log("Checkout data retrieved:", JSON.parse(storedCheckoutData));
    }
  }, []);

  const formatPrice = (price: number | string | undefined): string => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const calculateTotal = useCallback(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  }, [cartItems]);

  const fetchClientSecret = async () => {
    try {
      const total = calculateTotal();
      console.log("Calculated total for PaymentIntent:", total);

      if (total <= 0) {
        setError("Your cart is empty. Please add items before checkout.");
        return;
      }

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(total * 100) }), // Stripe expects amount in cents
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.error || "Unknown error"
          }`,
        );
      }

      const data = await response.json();
      console.log("Response from create-payment-intent:", data);

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error("No client secret received");
      }
    } catch (err) {
      console.error("Error fetching client secret:", err);
      if (err instanceof Error) {
        setError(`Failed to initialize payment: ${err.message}`);
      } else {
        setError("Failed to initialize payment: An unknown error occurred");
      }
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    setCheckoutData(null);
    localStorage.removeItem("checkoutData");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      console.error("Card Element not found");
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            address: {
              postal_code: formData.zip,
            },
            phone: formData.phone,
          },
        },
      },
    );

    if (error) {
      console.error("Payment confirmation error:", error);
      setError(`Payment failed: ${error.message}`);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      console.log("Payment succeeded:", paymentIntent);
      setShowConfirmation(true);
      // Clear the cart here
      // clearCart();
    } else {
      console.error("Unexpected payment result:", paymentIntent);
      setError("An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    router.push("/dashboard"); // Or wherever you want to redirect after purchase
  };

  const ConfirmationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
      <div className="relative mx-auto my-6 w-auto max-w-3xl">
        <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5">
            <h3 className="text-3xl font-semibold">Purchase Confirmed</h3>
            <button
              className="float-right ml-auto border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black opacity-5 outline-none focus:outline-none"
              onClick={handleCloseConfirmation}
            >
              <span className="block h-6 w-6 bg-transparent text-2xl text-black opacity-5 outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          <div className="relative flex-auto p-6">
            <p className="my-4 text-lg leading-relaxed text-slate-500">
              Your purchase has been successfully completed. Thank you for your
              order!
            </p>
          </div>
          <div className="flex items-center justify-end rounded-b border-t border-solid border-slate-200 p-6">
            <button
              className="background-transparent mb-1 mr-1 px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear focus:outline-none"
              type="button"
              onClick={handleCloseConfirmation}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderSummary = () => {
    if (cartItems.length === 0) return <p>Your cart is empty.</p>;

    return cartItems.map((item) => (
      <div key={item.id} className="mb-4 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">{item.name}</h2>
        <p className="text-sm text-gray-500">{item.description}</p>
        <p className="mt-2 text-lg font-semibold">${formatPrice(item.price)}</p>

        <div className="mt-4">
          <h4 className="text-sm font-medium">Plan Features:</h4>
          <ul className="list-inside list-disc text-sm">
            {item.planDetails?.features.map(
              (feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ),
            )}
          </ul>
        </div>

        {item.offerDetails && (
          <div className="mt-4 border-t pt-4">
            <h3 className="mb-2 text-lg font-semibold">Offer Details:</h3>
            <p className="text-sm">
              Property: {item.offerDetails.propertyAddress}
            </p>
            <p className="text-sm">
              Purchase Price: ${formatPrice(item.offerDetails.purchasePrice)}
            </p>
            {/* Add more offer details as needed */}
          </div>
        )}

        <button
          onClick={() => handleRemoveItem(item.id)}
          className="mt-4 w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Remove Item
        </button>
      </div>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="md:w-2/3">
          <h1 className="mb-4 text-2xl font-bold">Checkout</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">
                Contact Information
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">
                Personal Information
              </h2>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="zip"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  ZIP code
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Phone number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">
                Payment Information
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="card-element"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Credit or debit card
                </label>
                <div className="mt-1">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": {
                            color: "#aab7c4",
                          },
                        },
                        invalid: {
                          color: "#9e2146",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!stripe || processing || !clientSecret}
              className="w-full rounded bg-indigo-600 px-4 py-2 text-white transition duration-200 hover:bg-indigo-700 disabled:opacity-50"
            >
              {processing ? "Processing..." : "Pay Now"}
            </button>
            {error && <div className="mt-4 text-red-500">{error}</div>}
          </form>
        </div>

        <div className="mt-8 md:mt-0 md:w-1/3">
          {renderOrderSummary()}
          {cartItems.length > 0 && (
            <div className="mt-4 text-right">
              <p className="text-xl font-bold">
                Total: ${formatPrice(calculateTotal())}
              </p>
            </div>
          )}
        </div>
      </div>
      {showConfirmation && <ConfirmationModal />}
    </div>
  );
};

export default CheckoutForm;
