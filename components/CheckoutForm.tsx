"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Select from "react-select";
import countryList from "react-select-country-list";
import { usStates } from "@/app/checkout/states";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useCart } from "contexts/CartContext";
import { ChevronDownIcon } from "lucide-react";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  country: { label: string; value: string } | null;
  state: { label: string; value: string } | null;
  zip: string;
  phone: string;
  cardLast4?: string;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  zipCode: string;
}

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

  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    country: null,
    state: null,
    zip: "",
    phone: "",
    cardLast4: "8727", // Example card number display
  });

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: "",
    lastName: "",
    zipCode: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      fetchClientSecret();
    }
  }, [status, cartItems]);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const itemPrice =
        typeof item.price === "string" ? parseFloat(item.price) : item.price;
      return sum + (isNaN(itemPrice) ? 0 : itemPrice) * item.quantity;
    }, 0);
  };

  const fetchClientSecret = async () => {
    try {
      const total = calculateTotal();
      if (total <= 0) {
        setError("Your cart is empty. Please add items before checkout.");
        return;
      }

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(total * 100) }),
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
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error("No client secret received");
      }
    } catch (err) {
      console.error("Error fetching client secret:", err);
      setError(
        err instanceof Error
          ? `Failed to initialize payment: ${err.message}`
          : "Failed to initialize payment",
      );
    }
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData) => (option: any) => {
    setFormData((prev) => ({ ...prev, [name]: option }));
  };

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
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

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${billingInfo.firstName} ${billingInfo.lastName}`,
              email: formData.email,
              address: {
                line1: formData.address,
                postal_code: billingInfo.zipCode,
                state: formData.state?.value,
                country: formData.country?.value,
              },
              phone: formData.phone,
            },
          },
        },
      );

      if (error) {
        throw error;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        alert("Payment successful!");
        // Handle post-payment success (clear cart, redirect, etc.)
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="mx-auto max-w-[1300px] px-4">
        <div className="flex flex-row gap-8">
          {/* Main Checkout Column */}
          <div className="max-w-[800px] flex-grow space-y-4">
            <div className="rounded border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-medium">Sending offer to</h2>
                <button className="text-sm text-teal-600 hover:text-teal-700 hover:underline">
                  Change
                </button>
              </div>

              <div className="rounded bg-gray-50 p-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Recipient</div>
                    <div className="font-medium">
                      {formData.firstName} {formData.lastName}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">
                      {formData.email || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Property</div>
                    <div className="font-medium">
                      {formData.propertyAddress || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-medium">
                  Paying with Visa {formData.cardLast4}
                </h2>
                <button className="text-sm text-teal-600 hover:text-teal-700 hover:underline">
                  Change
                </button>
              </div>
              <div className="space-y-4">
                <div className="rounded border border-gray-200 pt-4">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "14px",
                          color: "#424770",
                          "::placeholder": { color: "#aab7c4" },
                        },
                      },
                    }}
                  />
                </div>

                {/* Billing Information */}
                <div className="border-t pt-4">
                  <div className="mb-3 text-sm font-medium">Name on card</div>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        value={billingInfo.firstName}
                        onChange={handleBillingChange}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        value={billingInfo.lastName}
                        onChange={handleBillingChange}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="mb-1 text-sm font-medium">ZIP Code</div>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="ZIP Code"
                      value={billingInfo.zipCode}
                      onChange={handleBillingChange}
                      className="w-48 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <button className="text-sm text-teal-600 hover:text-teal-700 hover:underline">
                  Use a gift card, voucher, or promo code
                </button>
              </div>
            </div>

            <div className="rounded border border-gray-200 bg-white p-4">
              <h2 className="mb-4 text-lg font-medium">Form Preview</h2>

              <div className="space-y-4">
                {/* Contact Information */}
                <div className="rounded bg-gray-50 p-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-600">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">
                        {formData.email || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">
                        {formData.phone || "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="rounded bg-gray-50 p-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-600">
                    Shipping Address
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium">
                        {formData.firstName} {formData.lastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="font-medium">{formData.address}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">State</div>
                        <div className="font-medium">
                          {formData.state?.label || "Not selected"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Country</div>
                        <div className="font-medium">
                          {formData.country?.label || "Not selected"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">ZIP Code</div>
                        <div className="font-medium">{formData.zip}</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Order Items */}
                {cartItems.map((item) => (
                  <div key={item.id} className="rounded border bg-white p-4">
                    <div className="flex gap-4">
                      <img
                        src="/api/placeholder/96/96"
                        alt={item.name}
                        className="h-24 w-24 object-contain"
                      />
                      <div className="flex-grow">
                        <h3 className="mb-1 font-medium">{item.name}</h3>
                        <div className="mb-1 inline-block bg-red-600 px-2 py-0.5 text-xs text-white">
                          33% off
                        </div>
                        <div className="mb-1 text-xs text-red-600">
                          Limited time deal
                        </div>
                        <div className="text-lg font-medium">
                          ${formatPrice(item.price)}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm">
                            Quantity: {item.quantity}
                          </span>
                          <button className="text-sm text-teal-600 hover:text-teal-700 hover:underline">
                            Change
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Info */}
            <div className="rounded border border-gray-200 bg-white p-4">
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  Do you need help? Explore our{" "}
                  <a href="#" className="text-teal-600 hover:underline">
                    Help pages
                  </a>{" "}
                  or{" "}
                  <a href="#" className="text-teal-600 hover:underline">
                    contact us
                  </a>
                </p>

                <p>
                  For an item sold by Breezly When you click the "Place your
                  order" button, we'll send you an email message acknowledging
                  receipt of your order.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="w-[300px]">
            <div className="sticky top-4 rounded border border-gray-200 bg-white p-4">
              <button
                onClick={handleSubmit}
                disabled={!stripe || processing || !clientSecret}
                className="mb-3 w-full rounded bg-yellow-400 px-4 py-2 text-sm font-medium hover:bg-yellow-500"
              >
                Place your order
              </button>

              <p className="mb-6 text-xs">
                By placing your order, you agree to Amazon's{" "}
                <a href="#" className="text-teal-600 hover:underline">
                  privacy notice
                </a>{" "}
                and{" "}
                <a href="#" className="text-teal-600 hover:underline">
                  conditions of use
                </a>
                .
              </p>

              <div className="space-y-2">
                <h3 className="mb-3 border-b pb-2 text-lg font-bold">
                  Order Summary
                </h3>
                <div className="flex justify-between text-sm">
                  <span>Items:</span>
                  <span>${formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping & handling:</span>
                  <span>$2.99</span>
                </div>
                <div className="flex justify-between text-sm text-green-700">
                  <span>Free Shipping:</span>
                  <span>-$2.99</span>
                </div>
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span>Estimated tax to be collected:</span>
                  <span>$2.26</span>
                </div>
                <div className="flex justify-between pt-1 text-lg font-bold">
                  <span>Order total:</span>
                  <span>${formatPrice(calculateTotal() + 2.26)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
