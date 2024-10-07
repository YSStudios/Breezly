"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number | string;
  quantity: number;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCartItems();
    }
  }, [status, router]);

  const fetchCartItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setError("Failed to fetch cart items. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.message); // Log the success message
      // Refresh the cart items after successful deletion
      fetchCartItems();
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError("Failed to remove item from cart. Please try again later.");
    }
  };

  // Helper function to format price
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="mb-4 flex items-center justify-between rounded-lg bg-white p-6 shadow-md"
            >
              <div>
                <h2 className="mb-2 text-xl font-semibold">{item.name}</h2>
                <p className="mb-2 text-gray-600">{item.description}</p>
                <p className="mb-2">
                  <strong>Price:</strong> ${formatPrice(item.price)}
                </p>
                <p className="mb-2">
                  <strong>Quantity:</strong> {item.quantity}
                </p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
              >
                Remove
              </button>
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
