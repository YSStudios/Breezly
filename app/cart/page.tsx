"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "contexts/CartContext"; // Import CartItem along with useCart

const CartPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cartItems, removeFromCart, updateCartItem } = useCart();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleRemoveItem = async (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateCartItem(itemId, newQuantity);
    } else {
      removeFromCart(itemId);
    }
  };

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item: CartItem) => (
            <div
              key={item.id}
              className="mb-4 rounded-lg bg-white p-6 shadow-md"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="mb-2 text-xl font-semibold">{item.name}</h2>
                  {item.description && (
                    <p className="mb-2 text-gray-600">{item.description}</p>
                  )}
                  <p className="mb-2">
                    <strong>Price:</strong> ${formatPrice(item.price)}
                  </p>
                  <p className="mb-2">
                    <strong>Quantity:</strong> {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="h-10 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
              {item.planDetails && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="mb-2 text-lg font-semibold">Plan Details:</h3>
                  <p>
                    <strong>Plan ID:</strong> {item.planDetails.id}
                  </p>
                  <ul className="list-inside list-disc">
                    {item.planDetails.features.map(
                      (feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ),
                    )}
                  </ul>
                </div>
              )}
              {item.offerDetails && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="mb-2 text-lg font-semibold">Offer Details:</h3>
                  <p>
                    <strong>Property Address:</strong>{" "}
                    {item.offerDetails.propertyAddress}
                  </p>
                  <p>
                    <strong>Property Type:</strong>{" "}
                    {item.offerDetails.propertyType}
                  </p>
                  <p>
                    <strong>Purchase Price:</strong> $
                    {formatPrice(item.offerDetails.purchasePrice)}
                  </p>
                  <p>
                    <strong>Closing Date:</strong>{" "}
                    {item.offerDetails.closingDate}
                  </p>
                </div>
              )}
            </div>
          ))}
          <div className="mt-6">
            <p className="text-xl font-bold">
              Total: $
              {formatPrice(
                cartItems.reduce((sum, item) => {
                  const itemPrice =
                    typeof item.price === "string"
                      ? parseFloat(item.price)
                      : item.price;
                  return (
                    sum + (isNaN(itemPrice) ? 0 : itemPrice) * item.quantity
                  );
                }, 0),
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
