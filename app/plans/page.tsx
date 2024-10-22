"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "contexts/CartContext";

interface Plan {
  id: string;
  name: string;
  price: number; // Ensure this is typed as number
  features: string[];
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 9.99, // This is a number
    features: ["PDF Download", "Basic Template"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19.99, // This is a number
    features: ["PDF Download", "Premium Template", "Email Support"],
  },
  {
    id: "pro",
    name: "Professional",
    price: 29.99, // This is a number
    features: [
      "PDF Download",
      "Custom Template",
      "Priority Support",
      "Revisions",
    ],
  },
];

const PlansPage: React.FC = () => {
  const [formData, setFormData] = useState<any>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    const storedFormData = localStorage.getItem("offerFormData");
    if (storedFormData) {
      const parsedData = JSON.parse(storedFormData);
      setFormData(parsedData);
      console.log("Form data retrieved from localStorage:", parsedData);
    } else {
      console.log("No form data found in localStorage");
      // If no form data is found, redirect to the form page
      router.push("/form");
    }
  }, [router]);

  const handleAddToCart = async (plan: Plan) => {
    if (!formData) {
      console.log("No offer data available. Please create an offer first.");
      alert("No offer data available. Please create an offer first.");
      return;
    }

    console.log("Adding to cart. Form data:", formData);
    console.log("Selected plan:", plan);

    const cartItem = {
      id: `${plan.id}-${formData.id}`,
      name: `${plan.name} Plan - Offer for ${
        formData.propertyAddress || "Unknown Property"
      }`,
      description: `${plan.name} Plan for PDF Offer Document`,
      price:
        typeof plan.price === "number" ? plan.price : parseFloat(plan.price),
      quantity: 1,
      planDetails: {
        id: plan.id,
        features: plan.features,
      },
      offerDetails: formData,
      imageUrl: `/images/${plan.id}-plan-icon.png`,
    };

    console.log("Cart item being added:", cartItem);

    addToCart(cartItem);
    console.log("Item added to cart, navigating to checkout");

    router.push("/checkout");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Choose a Plan</h1>
      {formData ? (
        <p className="mb-4">
          Offer data loaded for: {formData.propertyAddress}
        </p>
      ) : (
        <p className="mb-4">Loading offer data...</p>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-lg border p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-semibold">{plan.name}</h2>
            <p className="mb-4 text-3xl font-bold">${plan.price.toFixed(2)}</p>
            <ul className="mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="mb-2 flex items-center">
                  <svg
                    className="mr-2 h-4 w-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleAddToCart(plan)}
              className="w-full rounded bg-blue-500 px-4 py-2 text-white transition duration-200 hover:bg-blue-600"
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;
