"use client";
import React from "react";
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
import { usStates } from "./states";

const CheckoutPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartItems, removeFromCart } = useCart();
  const countries = countryList().getData();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice =
        typeof item.price === "string" ? parseFloat(item.price) : item.price;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement the logic to submit the order
    alert("Order submitted successfully!");
    // You might want to clear the cart and redirect to a confirmation page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="md:w-2/3">
          <h1 className="mb-4 text-2xl font-bold">Checkout</h1>
          <div className="mb-6 flex items-center justify-between">
            <nav className="text-sm">
              <ol className="inline-flex list-none p-0">
                <li className="flex items-center text-gray-500">
                  <span>Information</span>
                  <svg
                    className="mx-3 h-3 w-3 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                  >
                    <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                  </svg>
                </li>
                <li className="flex items-center text-gray-500">
                  <span>Review</span>
                </li>
              </ol>
            </nav>
          </div>

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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
              <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="first-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    name="first-name"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="last-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    name="last-name"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded bg-indigo-600 px-4 py-2 text-white transition duration-200 hover:bg-indigo-700"
            >
              Place Order
            </button>
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

export default CheckoutPage;
