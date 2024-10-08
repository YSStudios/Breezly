"use client";

import React, { useState, useEffect } from "react";
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

const CheckoutForm = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartItems, removeFromCart } = useCart();
  const countries = countryList().getData();
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
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

  const calculateTotal = () => {
    console.log("Cart items:", cartItems);
    const total = cartItems.reduce((sum, item) => {
      const itemPrice =
        typeof item.price === "string" ? parseFloat(item.price) : item.price;
      console.log(
        `Item: ${item.name}, Price: ${itemPrice}, Quantity: ${item.quantity}`,
      );
      return sum + (isNaN(itemPrice) ? 0 : itemPrice) * item.quantity;
    }, 0);
    console.log("Calculated total:", total);
    return total;
  };

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
      setError(`Failed to initialize payment: ${err.message}`);
    }
  };

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (option: any) => {
    setFormData((prev) => ({ ...prev, [name]: option }));
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
              line1: formData.address,
              country: formData.country?.value,
              state: formData.state?.value,
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
      alert("Payment successful!");
      // Here you would typically clear the cart and redirect to a confirmation page
    } else {
      console.error("Unexpected payment result:", paymentIntent);
      setError("An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
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
              <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
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
                  htmlFor="address"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="country"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Country
                </label>
                <Select
                  options={countries}
                  value={formData.country}
                  onChange={handleSelectChange("country")}
                  className="rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="state"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <Select
                    options={usStates}
                    value={formData.state}
                    onChange={handleSelectChange("state")}
                    className="rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
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
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center">
              <DocumentTextIcon className="mr-2 h-6 w-6 text-gray-500" />
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>
            {cartItems.map((item) => (
              <div key={item.id} className="mb-4 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      ${formatPrice(item.price)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {item.planDetails && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium">Plan Features:</h4>
                    <ul className="list-inside list-disc text-sm">
                      {item.planDetails.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.offerDetails && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium">Offer Details:</h4>
                    <p className="text-sm">
                      Property: {item.offerDetails.propertyAddress}
                    </p>
                    <p className="text-sm">
                      Type: {item.offerDetails.propertyType}
                    </p>
                    <p className="text-sm">
                      Purchase Price: $
                      {formatPrice(item.offerDetails.purchasePrice)}
                    </p>
                    <p className="text-sm">
                      Closing Date: {item.offerDetails.closingDate}
                    </p>
                  </div>
                )}
              </div>
            ))}
            <div className="mb-4 flex items-center justify-between border-t pt-4">
              <span className="text-base font-medium">Subtotal</span>
              <span className="text-base font-semibold">
                ${formatPrice(calculateTotal())}
              </span>
            </div>
            <div className="mb-4 flex items-center justify-between border-t pt-4">
              <span className="text-base font-medium">Total</span>
              <span className="text-xl font-bold">
                ${formatPrice(calculateTotal())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
