"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "../../contexts/CartContext";

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 49.99,
    features: ["Feature 1", "Feature 2", "Feature 3"],
  },
  {
    id: "standard",
    name: "Standard Plan",
    price: 99.99,
    features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 149.99,
    features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  },
];

const PlansPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const [formData, setFormData] = useState<any>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("formId");
    if (id) {
      setFormId(id);
      const storedFormData = localStorage.getItem(`form_${id}`);
      if (storedFormData) {
        try {
          const parsedData = JSON.parse(storedFormData);
          setFormData(parsedData);
        } catch (error) {
          console.error("Error parsing stored form data:", error);
          setError("Error retrieving form data. Please try again.");
        }
      } else {
        setError("No form data found. Please complete the offer form first.");
      }
    } else {
      setError("No form ID provided. Please complete the offer form first.");
    }
  }, [searchParams]);

  const handleSelectPlan = (plan: any) => {
    if (!formData || !formId) {
      alert("Please complete the offer form before selecting a plan.");
      router.push("/offerform");
      return;
    }

    const cartItem = {
      id: `${plan.id}-${formId}`,
      formId: formId,
      name: `${plan.name} - Offer for ${
        formData["property-address"] || "Unknown Property"
      }`,
      description: `${plan.name} for PDF Offer Document`,
      price: plan.price,
      quantity: 1,
      planDetails: plan,
      offerDetails: formData,
    };

    addToCart(cartItem);
    router.push("/checkout");
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            className="absolute bottom-0 right-0 top-0 px-4 py-3"
            onClick={() => router.push("/offerform")}
          >
            Go to Offer Form
          </button>
        </div>
      </div>
    );
  }

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Choose a Plan for Your Offer</h1>
      <div className="mb-6 rounded-lg bg-gray-100 p-4">
        <h2 className="mb-2 text-xl font-semibold">Offer Summary:</h2>
        <p>Property Address: {formData["property-address"]}</p>
        <p>Purchase Price: ${formData["purchasePrice"]}</p>
        <p>Closing Date: {formData["closingDate"]}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-lg border p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-semibold">{plan.name}</h2>
            <p className="mb-4 text-3xl font-bold">${plan.price}</p>
            <ul className="mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="mb-2">
                  ✓ {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectPlan(plan)}
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
